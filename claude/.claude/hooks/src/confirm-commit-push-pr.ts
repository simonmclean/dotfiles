#!/usr/bin/env node
// PreToolUse hook (Bash): ask for approval before committing, pushing, or
// creating or merging a pull request (`git commit`, `git push`,
// `gh pr create`, `gh pr merge`).
//
// Claude Code sends the pending tool call as JSON on stdin. If the command
// would do one of those, we reply with permissionDecision "ask", which forces
// a permission prompt even in auto mode. Otherwise we print nothing and the
// normal permission rules apply.
//
// The matching `ask` rules in settings.json back this up for cases the
// parser can't see, such as "$(git push)".

import { readHookInput, runIfMain, stringField } from './lib/hook-io.ts';
import { type Command, parseCommands, programName } from './lib/shell.ts';
import type { PreToolUseInput, PreToolUseOutput } from './lib/types.ts';

const GUARDED_COMMANDS = ['git commit', 'git push', 'gh pr create', 'gh pr merge'];

// Git options that take their value as the next word, e.g. `git -C repo commit`.
const GIT_OPTIONS_WITH_SEPARATE_VALUE = ['-C', '-c', '--git-dir', '--work-tree', '--namespace'];

// Index of the word that runs `program`, or -1. The program may come after a
// prefix (`sudo git push`, `env FOO=1 git push`), so we look anywhere.
// Over-matching only causes an extra prompt, which is safe.
function indexOfProgram(words: Command, program: string): number {
  return words.findIndex((word) => programName(word) === program);
}

// "git commit", "git status", ... or null if the command doesn't run git.
function gitCommand(words: Command): string | null {
  const gitIndex = indexOfProgram(words, 'git');
  if (gitIndex === -1) return null;

  let i = gitIndex + 1;
  while (words[i]?.startsWith('-')) {
    if (GIT_OPTIONS_WITH_SEPARATE_VALUE.includes(words[i] ?? '')) i++; // skip the option's value too
    i++;
  }
  const subcommand = words[i];
  return subcommand === undefined ? null : `git ${subcommand}`;
}

// "gh pr merge", "gh issue list", ... or null if the command doesn't run gh.
function ghCommand(words: Command): string | null {
  const ghIndex = indexOfProgram(words, 'gh');
  if (ghIndex === -1) return null;

  const [group, action] = words.slice(ghIndex + 1).filter((word) => !word.startsWith('-'));
  return `gh ${group} ${action}`;
}

// The guarded commands a command line would run, e.g. ["git commit", "git push"].
export function guardedCommands(commandLine: string): string[] {
  const found = parseCommands(commandLine)
    .flatMap((words) => [gitCommand(words), ghCommand(words)])
    .filter((command): command is string => command !== null && GUARDED_COMMANDS.includes(command));
  return [...new Set(found)];
}

export function decide(hookInput: PreToolUseInput | undefined): PreToolUseOutput | null {
  const commands = guardedCommands(stringField(hookInput?.tool_input, 'command') ?? '');
  if (commands.length === 0) return null;

  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'ask',
      permissionDecisionReason: `Needs your approval (CLAUDE.md rule): ${commands.join(', ')}`,
    },
  };
}

function main(): void {
  const decision = decide(readHookInput<PreToolUseInput>());
  if (decision) console.log(JSON.stringify(decision));
}

runIfMain(import.meta.url, main);
