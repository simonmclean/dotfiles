#!/usr/bin/env node
// PreToolUse hook: ask for approval before Claude reads or writes outside the project.
//
// "The project" is the folder the session started in (CLAUDE_PROJECT_DIR).
//
// File tools (Read, Edit, Write, Glob, Grep, ...) give us the exact path.
// For Bash we can only guess: any argument that looks like a path outside the
// project (/abs/path, ~/x, $HOME/x, ../x) counts as an access. A wrong guess
// only costs an extra prompt. A command can still reach outside in ways we
// can't see (other variables, scripts it runs), so this is a guard rail,
// not a sandbox.

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { splitIntoCommands, words } from './lib/shell.mjs';

// Input fields that hold a path, per file tool.
const PATH_FIELDS_BY_TOOL = {
  Read: ['file_path'],
  Write: ['file_path'],
  Edit: ['file_path'],
  MultiEdit: ['file_path'],
  NotebookEdit: ['notebook_path'],
  Glob: ['path', 'pattern'],
  Grep: ['path'],
};

// --- Recognising and resolving paths ---

const HOME_VARIABLES = ['$HOME', '${HOME}'];

function looksLikePath(text) {
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
function expandHome(text, home) {
  if (text === '~' || text.startsWith('~/')) return home + text.slice(1);
  if (text.startsWith('~')) return path.join(path.dirname(home), text.slice(1));

  for (const variable of HOME_VARIABLES) {
    if (text === variable || text.startsWith(`${variable}/`)) return home + text.slice(variable.length);
  }
  return text;
}

function isWithin(target, folder) {
  const relative = path.relative(folder, target);
  return relative === '' || !(relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative));
}

// Claude Code's own memory folders: ~/.claude/projects/<project>/memory/...
function isClaudeMemoryPath(target, home) {
  const relative = path.relative(path.join(home, '.claude', 'projects'), target);
  const [project, folder] = relative.split(path.sep);
  return project !== '..' && folder === 'memory';
}

// Places Claude may use without asking, besides the project itself.
function isAlwaysAllowed(target, { home, uid }) {
  const allowedFolders = [
    '/dev/null',
    `/tmp/claude-${uid}`, // Claude Code's scratchpad (/tmp is /private/tmp on macOS)
    `/private/tmp/claude-${uid}`,
  ];
  return allowedFolders.some((folder) => isWithin(target, folder)) || isClaudeMemoryPath(target, home);
}

// --- Finding the paths a tool call touches ---

// "--config=/etc/x" -> ["--config", "/etc/x"]; "2>/dev/null" -> ["2", "/dev/null"]; '"~/x"' -> ["~/x"].
function argumentParts(argument) {
  const unquoted = argument.replace(/^['"]|['"]$/g, '');
  return unquoted.split(/[<>=]/);
}

function pathsInBashCommand(commandLine, home) {
  const paths = [];

  for (const command of splitIntoCommands(commandLine)) {
    // The first word is the program being run, which isn't a read of that file.
    const [program, ...args] = words(command);

    if (program === 'cd' && args.length === 0) paths.push(home); // bare `cd` goes home

    for (const part of args.flatMap(argumentParts)) {
      if (looksLikePath(part)) paths.push(part);
    }
  }
  return paths;
}

function pathsInToolCall(toolName, toolInput, home) {
  if (toolName === 'Bash') return pathsInBashCommand(toolInput.command ?? '', home);

  const fields = PATH_FIELDS_BY_TOOL[toolName] ?? [];
  return fields.map((field) => toolInput[field]).filter((value) => typeof value === 'string' && looksLikePath(value));
}

// --- The hook ---

// Return the absolute paths outside the project that this tool call would touch.
export function findOutsidePaths(hookInput, context) {
  const { projectDir, home } = context;
  const toolName = hookInput?.tool_name;
  const toolInput = hookInput?.tool_input ?? {};

  const outside = pathsInToolCall(toolName, toolInput, home)
    .map((text) => path.resolve(projectDir, expandHome(text, home)))
    .filter((target) => !isWithin(target, projectDir) && !isAlwaysAllowed(target, context));

  return [...new Set(outside)];
}

export function decide(hookInput, context) {
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

function main() {
  const hookInput = JSON.parse(readFileSync(0, 'utf8') || '{}');
  const context = {
    projectDir: process.env.CLAUDE_PROJECT_DIR || hookInput.cwd || process.cwd(),
    home: homedir(),
    uid: process.getuid(),
  };
  const decision = decide(hookInput, context);
  if (decision) console.log(JSON.stringify(decision));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
