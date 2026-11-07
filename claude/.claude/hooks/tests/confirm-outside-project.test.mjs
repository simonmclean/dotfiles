import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { decide, findOutsidePaths } from '../confirm-outside-project.mjs';

const HOOK = fileURLToPath(new URL('../confirm-outside-project.mjs', import.meta.url));

const context = { projectDir: '/Users/me/project', home: '/Users/me', uid: 501 };

const bash = (command) => findOutsidePaths({ tool_name: 'Bash', tool_input: { command } }, context);
const tool = (tool_name, tool_input) => findOutsidePaths({ tool_name, tool_input }, context);

describe('file tools', () => {
  test('allows paths inside the project', () => {
    assert.deepEqual(tool('Read', { file_path: '/Users/me/project/src/a.js' }), []);
    assert.deepEqual(tool('Write', { file_path: '/Users/me/project/new.txt' }), []);
    assert.deepEqual(tool('Edit', { file_path: '/Users/me/project' }), []);
    assert.deepEqual(tool('Grep', { pattern: 'TODO' }), []);
    assert.deepEqual(tool('Glob', { pattern: '**/*.js' }), []);
    assert.deepEqual(tool('Grep', { pattern: 'x', path: 'src' }), []);
  });

  test('flags paths outside the project', () => {
    assert.deepEqual(tool('Read', { file_path: '/etc/hosts' }), ['/etc/hosts']);
    assert.deepEqual(tool('Write', { file_path: '/Users/me/other/x' }), ['/Users/me/other/x']);
    assert.deepEqual(tool('Edit', { file_path: '/Users/me/project/../secrets' }), ['/Users/me/secrets']);
    assert.deepEqual(tool('NotebookEdit', { notebook_path: '/tmp/n.ipynb' }), ['/tmp/n.ipynb']);
    assert.deepEqual(tool('Grep', { pattern: 'x', path: '~/stow' }), ['/Users/me/stow']);
    assert.deepEqual(tool('Glob', { pattern: '/etc/**' }), ['/etc/**']);
  });

  test('does not treat a sibling folder with the same prefix as inside', () => {
    assert.deepEqual(tool('Read', { file_path: '/Users/me/project-old/a' }), ['/Users/me/project-old/a']);
  });

  test('ignores tools that take no path', () => {
    assert.deepEqual(tool('WebFetch', { url: 'https://example.com' }), []);
  });
});

describe('Bash', () => {
  test('allows commands that stay in the project', () => {
    const commands = [
      'ls',
      'cat src/a.js',
      "node --test 'tests/*.test.mjs'",
      'ls 2>/dev/null',
      '/usr/bin/git status',
      'cat /Users/me/project/README.md',
      'curl https://example.com',
      'echo hello',
      '',
    ];
    for (const command of commands) {
      assert.deepEqual(bash(command), [], command);
    }
  });

  test('flags paths outside the project', () => {
    const cases = {
      'ls ~/stow': ['/Users/me/stow'],
      'cat /etc/hosts': ['/etc/hosts'],
      'cd .. && ls': ['/Users/me'],
      cd: ['/Users/me'],
      'git -C ~/stow status': ['/Users/me/stow'],
      'echo x > /tmp/out.txt': ['/tmp/out.txt'],
      'echo x >/tmp/out.txt': ['/tmp/out.txt'],
      'cat "$HOME/.zshrc"': ['/Users/me/.zshrc'],
      'cat ${HOME}/.zshrc': ['/Users/me/.zshrc'],
      'tool --config=/etc/tool.conf': ['/etc/tool.conf'],
      'cat ~bob/notes': ['/Users/bob/notes'],
      'cat ../../x': ['/Users/x'],
      'cat src/../../other/x': ['/Users/me/other/x'],
      'ls; cat /etc/a /etc/b': ['/etc/a', '/etc/b'],
    };
    for (const [command, expected] of Object.entries(cases)) {
      assert.deepEqual(bash(command), expected, command);
    }
  });

  test('reports each path once', () => {
    assert.deepEqual(bash('cat /etc/hosts && cat /etc/hosts'), ['/etc/hosts']);
  });
});

describe('always-allowed places', () => {
  test("Claude's scratchpad", () => {
    assert.deepEqual(tool('Write', { file_path: '/private/tmp/claude-501/session/scratchpad/a.txt' }), []);
    assert.deepEqual(bash('ls /tmp/claude-501/session'), []);
  });

  test("another user's scratchpad is not allowed", () => {
    assert.deepEqual(tool('Read', { file_path: '/tmp/claude-502/a' }), ['/tmp/claude-502/a']);
  });

  test("Claude's memory folders", () => {
    const memoryFile = '/Users/me/.claude/projects/-Users-me-other/memory/MEMORY.md';
    assert.deepEqual(tool('Write', { file_path: memoryFile }), []);
  });

  test('other files under ~/.claude/projects are not allowed', () => {
    const transcript = '/Users/me/.claude/projects/-Users-me-other/session.jsonl';
    assert.deepEqual(tool('Read', { file_path: transcript }), [transcript]);
  });
});

describe('decide', () => {
  test('asks, naming the project and the paths', () => {
    const decision = decide({ tool_name: 'Read', tool_input: { file_path: '/etc/hosts' } }, context);
    assert.equal(decision.hookSpecificOutput.permissionDecision, 'ask');
    assert.equal(decision.hookSpecificOutput.permissionDecisionReason, 'Outside the project (/Users/me/project): /etc/hosts');
  });

  test('returns null when everything is inside, or input is missing', () => {
    assert.equal(decide({ tool_name: 'Bash', tool_input: { command: 'ls' } }, context), null);
    assert.equal(decide({}, context), null);
    assert.equal(decide(undefined, context), null);
  });
});

describe('as a script', () => {
  const run = (hookInput) =>
    execFileSync('node', [HOOK], {
      input: JSON.stringify(hookInput),
      encoding: 'utf8',
      env: { ...process.env, CLAUDE_PROJECT_DIR: '/Users/me/project' },
    });

  test('uses CLAUDE_PROJECT_DIR as the project', () => {
    const output = run({ tool_name: 'Read', tool_input: { file_path: '/Users/me/project/a' }, cwd: '/elsewhere' });
    assert.equal(output, '');
  });

  test('prints an "ask" decision for outside paths', () => {
    const output = run({ tool_name: 'Read', tool_input: { file_path: '/etc/hosts' } });
    assert.equal(JSON.parse(output).hookSpecificOutput.permissionDecision, 'ask');
  });
});
