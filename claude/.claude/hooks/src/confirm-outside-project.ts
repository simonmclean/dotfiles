#!/usr/bin/env node
// PreToolUse hook: ask for approval before Claude reads or writes outside the project.
//
// "Inside" means any of:
//   - the folder the session started in (CLAUDE_PROJECT_DIR)
//   - the current folder, which differs after /cd or in a worktree
//   - folders listed in `permissions.additionalDirectories` in settings
// Folders added with /add-dir during a session aren't visible to hooks, so
// those still prompt.
//
// Claude Code's own working files (scratchpad, memory, saved tool output,
// plans, plugins) are always allowed.
//
// File tools (Read, Edit, Write, Glob, Grep, LSP, ...) give us the exact path.
// For Bash we can only guess: any argument that looks like a path outside
// (/abs/path, ~/x, $HOME/x, ../x) counts as an access. A command can still
// reach outside in ways we can't see (other variables, scripts it runs), so
// this is a guard rail, not a sandbox.

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

import { readHookInput, runIfMain, stringField } from './lib/hook-io.ts';
import { type Command, parseCommands, programName } from './lib/shell.ts';
import type { PreToolUseInput, PreToolUseOutput } from './lib/types.ts';

/** Everything the hook needs to know about where it's running. */
export interface Context {
  /** The folder the session started in. */
  projectDir: string;
  /** The folder Claude is in now. Relative paths resolve from here. */
  cwd: string;
  home: string;
  /** Used to find the default scratchpad location, /tmp/claude-<uid>. */
  uid: number | undefined;
  /** The session's scratchpad, when Claude Code tells us. */
  scratchpadDir: string | undefined;
  /** `permissions.additionalDirectories` from settings, as absolute paths. */
  additionalDirs: string[];
}

// Input fields that hold a path, per file tool.
const PATH_FIELDS_BY_TOOL: Record<string, string[]> = {
  Read: ['file_path'],
  Write: ['file_path'],
  Edit: ['file_path'],
  MultiEdit: ['file_path'],
  NotebookEdit: ['notebook_path'],
  Glob: ['path', 'pattern'],
  Grep: ['path'],
  // The LSP tool's input isn't documented, so check each likely name for its file.
  LSP: ['filePath', 'file_path', 'path'],
};

// Device files that are safe to use from anywhere.
const DEVICE_FILES = ['/dev/null', '/dev/stdin', '/dev/stdout', '/dev/stderr', '/dev/tty', '/dev/fd'];

// Tools whose first plain argument is a program or pattern, not a file:
// `sed -n '/start/,/end/p' file`, `awk '/x/ {print}' file`.
const TOOLS_WITH_PROGRAM_ARGUMENT = ['jq', 'sed', 'awk', 'gawk', 'grep', 'egrep', 'fgrep', 'rg'];

// Options whose value is code or a pattern, not a file: `sed -e`, `grep -e`, `node -e`, `python -c`.
const CODE_OPTIONS = ['-e', '--expression', '--regexp', '--eval', '-c'];

// `NAME=value` at the start of a command, e.g. `FOO=/etc/x make`.
const ENV_ASSIGNMENT = /^[A-Za-z_][A-Za-z0-9_]*=/;

// --- Recognising and resolving paths ---

const HOME_VARIABLES = ['$HOME', '${HOME}'];

function looksLikePath(text: string): boolean {
  return (
    text.startsWith('/') ||
    text.startsWith('~') ||
    HOME_VARIABLES.some((variable) => text.startsWith(variable)) ||
    text === '..' ||
    text.startsWith('../') ||
    text.includes('/../') ||
    text.endsWith('/..')
  );
}

// "~/x", "$HOME/x" -> "/Users/me/x"; "~bob/x" -> "/Users/bob/x".
function expandHome(text: string, home: string): string {
  if (text === '~' || text.startsWith('~/')) return home + text.slice(1);
  if (text.startsWith('~')) return path.join(path.dirname(home), text.slice(1));

  for (const variable of HOME_VARIABLES) {
    if (text === variable || text.startsWith(`${variable}/`)) return home + text.slice(variable.length);
  }
  return text;
}

function resolvePath(text: string, baseFolder: string, home: string): string {
  return path.resolve(baseFolder, expandHome(text, home));
}

function isWithin(target: string, folder: string): boolean {
  const relative = path.relative(folder, target);
  return relative === '' || !(relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative));
}

// ~/.claude/projects/<project>/memory/... and ~/.claude/projects/<project>/<session>/tool-results/...
function isClaudeProjectFile(target: string, home: string): boolean {
  const relative = path.relative(path.join(home, '.claude', 'projects'), target);
  if (relative === '' || relative.startsWith('..')) return false;

  const [, second, third] = relative.split(path.sep);
  return second === 'memory' || third === 'tool-results';
}

function isClaudeCodeFile(target: string, { home, uid, scratchpadDir }: Context): boolean {
  const folders = [
    scratchpadDir,
    `/tmp/claude-${uid}`, // where scratchpads live when the hook isn't told (/tmp is /private/tmp on macOS)
    `/private/tmp/claude-${uid}`,
    path.join(home, '.claude', 'plans'),
    path.join(home, '.claude', 'plugins'),
  ].filter((folder): folder is string => folder !== undefined);

  return folders.some((folder) => isWithin(target, folder)) || isClaudeProjectFile(target, home);
}

function isAllowed(target: string, context: Context): boolean {
  const insideFolders = [context.projectDir, context.cwd, ...context.additionalDirs];
  return (
    insideFolders.some((folder) => isWithin(target, folder)) ||
    DEVICE_FILES.some((device) => isWithin(target, device)) ||
    isClaudeCodeFile(target, context)
  );
}

// --- Finding the paths a Bash command touches ---

// "--config=/etc/x" -> "/etc/x"; "@/etc/passwd" (curl's read-from-file) -> "/etc/passwd".
function argumentValue(argument: string): string {
  const value = argument.startsWith('-') && argument.includes('=') ? argument.slice(argument.indexOf('=') + 1) : argument;
  return value.startsWith('@') ? value.slice(1) : value;
}

// Positions in `args` that hold code or a pattern rather than a file.
function codeArgumentPositions(program: string, args: string[]): Set<number> {
  const positions = new Set<number>();

  args.forEach((arg, i) => {
    if (CODE_OPTIONS.includes(arg)) positions.add(i + 1);
  });

  // With no -e, tools like sed and awk take their program as the first plain argument.
  if (positions.size === 0 && TOOLS_WITH_PROGRAM_ARGUMENT.includes(programName(program))) {
    const firstPlain = args.findIndex((arg) => !arg.startsWith('-'));
    if (firstPlain !== -1) positions.add(firstPlain);
  }
  return positions;
}

// The path-like words in one command, still unresolved.
function pathsInCommand(words: Command): string[] {
  const paths: string[] = [];
  let i = 0;

  for (; i < words.length && ENV_ASSIGNMENT.test(words[i] ?? ''); i++) {
    const assignment = words[i] ?? '';
    paths.push(assignment.slice(assignment.indexOf('=') + 1));
  }

  const program = words[i];
  if (program === undefined) return paths;
  const args = words.slice(i + 1);

  // Running a script from outside (`~/bin/run.sh`, `../tool`) counts. Absolute
  // programs (`/usr/bin/git`) are almost always system binaries, so they don't.
  if (!program.startsWith('/')) paths.push(program);

  if (programName(program) === 'cd' && args.length === 0) paths.push('~'); // bare `cd` goes home

  const codePositions = codeArgumentPositions(program, args);
  args.forEach((arg, position) => {
    if (!codePositions.has(position)) paths.push(argumentValue(arg));
  });

  return paths.filter(looksLikePath);
}

// Every absolute path a command line touches. Follows `cd` so that later
// relative paths resolve from the right folder: `cd .. && cat x`.
function pathsInBashCommand(commandLine: string, { cwd, home }: Context): string[] {
  const paths: string[] = [];
  let folder = cwd;

  for (const words of parseCommands(commandLine)) {
    paths.push(...pathsInCommand(words).map((text) => resolvePath(text, folder, home)));

    if (programName(words[0] ?? '') === 'cd') folder = resolvePath(words[1] ?? '~', folder, home);
  }
  return paths;
}

function pathsInToolCall(toolName: string, toolInput: Record<string, unknown>, context: Context): string[] {
  if (toolName === 'Bash') return pathsInBashCommand(stringField(toolInput, 'command') ?? '', context);

  const fields = PATH_FIELDS_BY_TOOL[toolName] ?? [];
  return fields
    .map((field) => stringField(toolInput, field))
    .filter((value): value is string => value !== undefined && looksLikePath(value))
    .map((value) => resolvePath(value, context.cwd, context.home));
}

// --- The hook ---

// Return the absolute paths outside the project that this tool call would touch.
export function findOutsidePaths(hookInput: PreToolUseInput | undefined, context: Context): string[] {
  const toolName = hookInput?.tool_name ?? '';
  const toolInput = hookInput?.tool_input ?? {};

  const outside = pathsInToolCall(toolName, toolInput, context).filter((target) => !isAllowed(target, context));
  return [...new Set(outside)];
}

export function decide(hookInput: PreToolUseInput | undefined, context: Context): PreToolUseOutput | null {
  const outsidePaths = findOutsidePaths(hookInput, context);
  if (outsidePaths.length === 0) return null;

  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'ask',
      permissionDecisionReason: `Outside the project (${context.projectDir}): ${outsidePaths.join(', ')}`,
    },
  };
}

// `permissions.additionalDirectories` from the user and project settings files.
export function readAdditionalDirectories(projectDir: string, home: string): string[] {
  const settingsFiles = [
    path.join(home, '.claude', 'settings.json'),
    path.join(projectDir, '.claude', 'settings.json'),
    path.join(projectDir, '.claude', 'settings.local.json'),
  ];

  return settingsFiles.flatMap((file) => {
    try {
      const folders: unknown = JSON.parse(readFileSync(file, 'utf8'))?.permissions?.additionalDirectories;
      if (!Array.isArray(folders)) return [];

      return folders
        .filter((folder): folder is string => typeof folder === 'string')
        .map((folder) => resolvePath(folder, projectDir, home));
    } catch {
      return []; // missing or unreadable settings file
    }
  });
}

function main(): void {
  const hookInput = readHookInput<PreToolUseInput>();
  const home = homedir();
  const cwd = stringField(hookInput, 'cwd');
  const projectDir = process.env.CLAUDE_PROJECT_DIR || cwd || process.cwd();

  const context: Context = {
    projectDir,
    cwd: cwd || projectDir,
    home,
    uid: process.getuid?.(),
    scratchpadDir: stringField(hookInput, 'scratchpad_dir'),
    additionalDirs: readAdditionalDirectories(projectDir, home),
  };

  const decision = decide(hookInput, context);
  if (decision) console.log(JSON.stringify(decision));
}

runIfMain(import.meta.url, main);
