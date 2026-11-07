import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { decide, guardedCommands } from '../confirm-commit-push-pr.mjs';
import { NODE_BINARIES, runHook } from './helpers.mjs';

const HOOK = 'confirm-commit-push-pr.mjs';

const needsApproval = (commandLine) => guardedCommands(commandLine).length > 0;

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
    `bash -c "git push"`,
    `sh -c 'git commit -m x'`,
    `zsh -lc 'cd x && git push'`,
    '`git push`',
    'echo $(git push)',
    `"git" push`,
    'gh pr create --fill',
    'gh pr create --title x --body y',
    'gh pr merge 12 --squash',
    'gh pr merge --auto',
    `bash -c 'gh pr merge 3'`,
  ];
  for (const command of commands) {
    assert.equal(needsApproval(command), true, command);
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
    'git log --grep "git push"',
    'git-lfs ls-files',
    'echo "commit"',
    'echo "git push"',
    `bash -c 'git status'`,
    'gh pr view 12',
    'gh pr list',
    'gh pr checks --watch',
    'gh issue create',
    'gh',
    'echo "gh pr merge"',
    'ls -la',
    '',
  ];
  for (const command of commands) {
    assert.equal(needsApproval(command), false, command);
  }
});

test('guardedCommands names each guarded command once', () => {
  assert.deepEqual(guardedCommands('git commit -m x && git push && git push && gh pr create --fill'), [
    'git commit',
    'git push',
    'gh pr create',
  ]);
});

test('decide returns an "ask" decision naming the commands', () => {
  const decision = decide({ tool_name: 'Bash', tool_input: { command: 'git push && gh pr merge 3' } });
  assert.equal(decision.hookSpecificOutput.hookEventName, 'PreToolUse');
  assert.equal(decision.hookSpecificOutput.permissionDecision, 'ask');
  assert.equal(decision.hookSpecificOutput.permissionDecisionReason, 'Needs your approval (CLAUDE.md rule): git push, gh pr merge');
});

test('decide returns null for other commands and for missing input', () => {
  assert.equal(decide({ tool_input: { command: 'git status' } }), null);
  assert.equal(decide({}), null);
  assert.equal(decide(undefined), null);
});

for (const node of NODE_BINARIES) {
  describe(`as a script (${node})`, () => {
    test('prints the decision JSON for commit/push', () => {
      const output = runHook(HOOK, { tool_name: 'Bash', tool_input: { command: 'git commit -m x' } }, { node });
      assert.equal(JSON.parse(output).hookSpecificOutput.permissionDecision, 'ask');
    });

    test('prints nothing for other commands', () => {
      assert.equal(runHook(HOOK, { tool_name: 'Bash', tool_input: { command: 'ls' } }, { node }), '');
    });

    test('prints nothing, and exits 0, on malformed input', () => {
      assert.equal(runHook(HOOK, 'not json', { node }), '');
    });
  });
}
