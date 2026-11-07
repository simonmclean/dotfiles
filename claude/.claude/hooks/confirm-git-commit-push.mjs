#!/usr/bin/env node
// PreToolUse hook (Bash): ask for approval before any `git commit` or `git push`.
//
// Claude Code sends the pending tool call as JSON on stdin. If the command
// would commit or push, we reply with permissionDecision "ask", which forces
// a permission prompt even in auto mode. Otherwise we print nothing and the
// normal permission rules apply.

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

import { splitIntoCommands, words as toWords } from './lib/shell.mjs';

const GUARDED_SUBCOMMANDS = ['commit', 'push'];

// Git options that take their value as the next word, e.g. `git -C repo commit`.
const OPTIONS_WITH_SEPARATE_VALUE = ['-C', '-c', '--git-dir', '--work-tree', '--namespace'];

const isGitExecutable = (word) => word === 'git' || word.endsWith('/git');

// Return the git subcommand a single command runs ("commit", "status", ...),
// or null if it doesn't run git.
//
// `git` may appear after a prefix (`sudo git push`, `FOO=1 git push`), so we
// look for it anywhere. Over-matching only causes an extra prompt, which is safe.
function gitSubcommand(command) {
  const words = toWords(command);
  const gitIndex = words.findIndex(isGitExecutable);
  if (gitIndex === -1) return null;

  let i = gitIndex + 1;
  while (i < words.length && words[i].startsWith('-')) {
    if (OPTIONS_WITH_SEPARATE_VALUE.includes(words[i])) i++; // skip the option's value too
    i++;
  }
  return words[i] ?? null;
}

export function isCommitOrPush(commandLine) {
  return splitIntoCommands(commandLine)
    .map(gitSubcommand)
    .some((subcommand) => GUARDED_SUBCOMMANDS.includes(subcommand));
}

export function decide(hookInput) {
  const command = hookInput?.tool_input?.command ?? '';
  if (!isCommitOrPush(command)) return null;

  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'ask',
      permissionDecisionReason: 'git commit/push requires your approval (CLAUDE.md rule)',
    },
  };
}

function main() {
  const hookInput = JSON.parse(readFileSync(0, 'utf8') || '{}');
  const decision = decide(hookInput);
  if (decision) console.log(JSON.stringify(decision));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
