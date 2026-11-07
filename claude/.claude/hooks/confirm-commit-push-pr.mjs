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

import { readHookInput, runIfMain } from './lib/hook-io.mjs';
import { parseCommands, programName } from './lib/shell.mjs';

const GUARDED_GIT_SUBCOMMANDS = ['commit', 'push'];
const GUARDED_GH_COMMANDS = ['pr create', 'pr merge'];

// Git options that take their value as the next word, e.g. `git -C repo commit`.
const GIT_OPTIONS_WITH_SEPARATE_VALUE = ['-C', '-c', '--git-dir', '--work-tree', '--namespace'];

// Index of the word that runs `program`, or -1. The program may come after a
// prefix (`sudo git push`, `env FOO=1 git push`), so we look anywhere.
// Over-matching only causes an extra prompt, which is safe.
function indexOfProgram(words, program) {
  return words.findIndex((word) => programName(word) === program);
}

// "git commit", "git status", ... or null if the command doesn't run git.
function gitCommand(words) {
  const gitIndex = indexOfProgram(words, 'git');
  if (gitIndex === -1) return null;

  let i = gitIndex + 1;
  while (i < words.length && words[i].startsWith('-')) {
    if (GIT_OPTIONS_WITH_SEPARATE_VALUE.includes(words[i])) i++; // skip the option's value too
    i++;
  }
  return words[i] === undefined ? null : `git ${words[i]}`;
}

// "gh pr merge", "gh issue list", ... or null if the command doesn't run gh.
function ghCommand(words) {
  const ghIndex = indexOfProgram(words, 'gh');
  if (ghIndex === -1) return null;

  const [group, action] = words.slice(ghIndex + 1).filter((word) => !word.startsWith('-'));
  return `gh ${group} ${action}`;
}

function isGuarded(command) {
  return (
    GUARDED_GIT_SUBCOMMANDS.some((subcommand) => command === `git ${subcommand}`) ||
    GUARDED_GH_COMMANDS.some((ghCommandName) => command === `gh ${ghCommandName}`)
  );
}

// The guarded commands a command line would run, e.g. ["git commit", "git push"].
export function guardedCommands(commandLine) {
  const found = parseCommands(commandLine)
    .flatMap((words) => [gitCommand(words), ghCommand(words)])
    .filter((command) => command !== null && isGuarded(command));
  return [...new Set(found)];
}

export function decide(hookInput) {
  const commands = guardedCommands(hookInput?.tool_input?.command ?? '');
  if (commands.length === 0) return null;

  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'ask',
      permissionDecisionReason: `Needs your approval (CLAUDE.md rule): ${commands.join(', ')}`,
    },
  };
}

function main() {
  const decision = decide(readHookInput());
  if (decision) console.log(JSON.stringify(decision));
}

runIfMain(import.meta.url, main);
