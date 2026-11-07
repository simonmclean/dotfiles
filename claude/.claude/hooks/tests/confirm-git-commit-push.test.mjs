import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { decide, isCommitOrPush } from '../confirm-git-commit-push.mjs';

const HOOK = fileURLToPath(new URL('../confirm-git-commit-push.mjs', import.meta.url));

test('asks for commands that commit or push', () => {
  const commands = [
    'git commit -m "x"',
    'git push',
    'git push origin main',
    'git commit --amend --no-edit',
    'git -C /some/repo commit -am fix',
    'git --no-pager commit',
    'git -c user.name=x commit -m y',
    'cd repo && git commit -m "x"',
    'git add . && git commit -m x && git push',
    'npm test; git push --force',
    '(cd repo && git push)',
    'git status | cat; git push',
    'echo hi\ngit push',
    'sudo git push',
    'GIT_TRACE=1 git push',
    '/usr/bin/git commit -m x',
  ];
  for (const command of commands) {
    assert.equal(isCommitOrPush(command), true, command);
  }
});

test('stays silent for everything else', () => {
  const commands = [
    'git status',
    'git log --oneline',
    'git diff HEAD',
    'git add .',
    'git fetch origin',
    'git -C repo status',
    'git commit-graph write',
    'git log --grep=pushover',
    'git-lfs ls-files',
    'echo "commit"',
    'ls -la',
    '',
  ];
  for (const command of commands) {
    assert.equal(isCommitOrPush(command), false, command);
  }
});

test('decide returns an "ask" decision for commit/push', () => {
  const decision = decide({ tool_name: 'Bash', tool_input: { command: 'git push' } });
  assert.equal(decision.hookSpecificOutput.hookEventName, 'PreToolUse');
  assert.equal(decision.hookSpecificOutput.permissionDecision, 'ask');
});

test('decide returns null for other commands and for missing input', () => {
  assert.equal(decide({ tool_input: { command: 'git status' } }), null);
  assert.equal(decide({}), null);
  assert.equal(decide(undefined), null);
});

test('as a script: prints the decision JSON for commit/push', () => {
  const input = JSON.stringify({ tool_name: 'Bash', tool_input: { command: 'git commit -m x' } });
  const output = execFileSync('node', [HOOK], { input, encoding: 'utf8' });
  assert.equal(JSON.parse(output).hookSpecificOutput.permissionDecision, 'ask');
});

test('as a script: prints nothing for other commands', () => {
  const input = JSON.stringify({ tool_name: 'Bash', tool_input: { command: 'ls' } });
  const output = execFileSync('node', [HOOK], { input, encoding: 'utf8' });
  assert.equal(output, '');
});
