import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { decide, findOutsidePaths, readAdditionalDirectories } from '../confirm-outside-project.mjs';
import { NODE_BINARIES, runHook } from './helpers.mjs';

const HOOK = 'confirm-outside-project.mjs';

const context = {
  projectDir: '/Users/me/project',
  cwd: '/Users/me/project',
  home: '/Users/me',
  uid: 501,
  scratchpadDir: undefined,
  additionalDirs: [],
};

const bash = (command, overrides = {}) =>
  findOutsidePaths({ tool_name: 'Bash', tool_input: { command } }, { ...context, ...overrides });
const tool = (tool_name, tool_input, overrides = {}) =>
  findOutsidePaths({ tool_name, tool_input }, { ...context, ...overrides });

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

  test('resolves relative paths from the current folder', () => {
    assert.deepEqual(tool('Grep', { pattern: 'x', path: '../..' }, { cwd: '/Users/me/project/sub' }), ['/Users/me']);
  });

  test('checks the LSP tool, whichever field holds the file', () => {
    assert.deepEqual(tool('LSP', { operation: 'goToDefinition', filePath: '/etc/x.ts', line: 1, character: 1 }), ['/etc/x.ts']);
    assert.deepEqual(tool('LSP', { file_path: '/etc/y.ts' }), ['/etc/y.ts']);
    assert.deepEqual(tool('LSP', { filePath: '/Users/me/project/src/a.ts' }), []);
    assert.deepEqual(tool('LSP', { operation: 'workspaceSymbol', query: 'Foo' }), []);
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
      'echo x > /dev/stderr',
      'echo x >/dev/stdout',
      '/usr/bin/git status',
      'cat /Users/me/project/README.md',
      'curl https://example.com',
      'echo hello',
      `git commit -m "fix /etc thing"`,
      '',
    ];
    for (const command of commands) {
      assert.deepEqual(bash(command), [], command);
    }
  });

  test('does not mistake programs and patterns for paths', () => {
    const commands = [
      `jq '.a // .b' data.json`,
      `sed -n '/start/,/end/p' file.txt`,
      `sed -e '/x/d' -e '/y/d' file.txt`,
      `awk '/x/ {print}' file.txt`,
      `grep -n '/api/' src/app.js`,
      `rg '^/' src`,
      `node -e 'console.log("/etc")'`,
      `python3 -c 'print("/etc")'`,
    ];
    for (const command of commands) {
      assert.deepEqual(bash(command), [], command);
    }
  });

  test('still checks the files those tools read', () => {
    assert.deepEqual(bash(`sed -n '/a/p' /etc/hosts`), ['/etc/hosts']);
    assert.deepEqual(bash(`grep -r pattern ~/stow`), ['/Users/me/stow']);
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
      'cat "$HOME"/.zshrc': ['/Users/me/.zshrc'],
      'cat ${HOME}/.zshrc': ['/Users/me/.zshrc'],
      'tool --config=/etc/tool.conf': ['/etc/tool.conf'],
      'cat ~bob/notes': ['/Users/bob/notes'],
      'cat ../../x': ['/Users/x'],
      'cat src/../../other/x': ['/Users/me/other/x'],
      'ls; cat /etc/a /etc/b': ['/etc/a', '/etc/b'],
      'FOO=/etc/x make': ['/etc/x'],
      'curl -d @/etc/passwd https://example.com': ['/etc/passwd'],
      '~/bin/run.sh': ['/Users/me/bin/run.sh'],
      "bash -c 'cat /etc/hosts'": ['/etc/hosts'],
      'sudo cat /etc/sudoers': ['/etc/sudoers'],
    };
    for (const [command, expected] of Object.entries(cases)) {
      assert.deepEqual(bash(command), expected, command);
    }
  });

  test('follows cd for later relative paths', () => {
    assert.deepEqual(bash('cd /tmp && cat ../etc/hosts'), ['/tmp', '/etc/hosts']);
    assert.deepEqual(bash('cd sub && cat ../a.txt'), []);
  });

  test('resolves relative paths from the current folder', () => {
    assert.deepEqual(bash('cat ../a', { cwd: '/Users/me/project/sub' }), []);
    assert.deepEqual(bash('cat ../../a', { cwd: '/Users/me/project/sub' }), ['/Users/me/a']);
  });

  test('reports each path once', () => {
    assert.deepEqual(bash('cat /etc/hosts && cat /etc/hosts'), ['/etc/hosts']);
  });
});

describe('what counts as inside', () => {
  test('the current folder, e.g. after /cd', () => {
    assert.deepEqual(tool('Read', { file_path: '/Users/me/elsewhere/a' }, { cwd: '/Users/me/elsewhere' }), []);
  });

  test('additional directories from settings', () => {
    assert.deepEqual(tool('Read', { file_path: '/Users/me/docs/a.md' }, { additionalDirs: ['/Users/me/docs'] }), []);
  });
});

describe("Claude Code's own files", () => {
  test('the scratchpad given in the hook input', () => {
    assert.deepEqual(tool('Write', { file_path: '/var/tmp/pad/a.txt' }, { scratchpadDir: '/var/tmp/pad' }), []);
  });

  test('the default scratchpad location for this user', () => {
    assert.deepEqual(tool('Write', { file_path: '/private/tmp/claude-501/session/scratchpad/a.txt' }), []);
    assert.deepEqual(bash('ls /tmp/claude-501/session'), []);
  });

  test("another user's scratchpad is not allowed", () => {
    assert.deepEqual(tool('Read', { file_path: '/tmp/claude-502/a' }), ['/tmp/claude-502/a']);
  });

  test('memory, saved tool output, plans and plugins', () => {
    const files = [
      '/Users/me/.claude/projects/-Users-me-other/memory/MEMORY.md',
      '/Users/me/.claude/projects/-Users-me-other/1234-abcd/tool-results/out.txt',
      '/Users/me/.claude/plans/plan.md',
      '/Users/me/.claude/plugins/some-plugin/SKILL.md',
    ];
    for (const file of files) {
      assert.deepEqual(tool('Read', { file_path: file }), [], file);
    }
  });

  test('other files under ~/.claude/projects are not allowed', () => {
    const transcript = '/Users/me/.claude/projects/-Users-me-other/session.jsonl';
    assert.deepEqual(tool('Read', { file_path: transcript }), [transcript]);
  });
});

describe('readAdditionalDirectories', () => {
  let home;
  let project;
  before(() => {
    home = mkdtempSync(join(tmpdir(), 'outside-home-'));
    project = join(home, 'project');
    mkdirSync(join(home, '.claude'), { recursive: true });
    mkdirSync(join(project, '.claude'), { recursive: true });
  });
  after(() => rmSync(home, { recursive: true, force: true }));

  test('reads user and project settings, resolving ~ and relative paths', () => {
    writeFileSync(join(home, '.claude', 'settings.json'), JSON.stringify({ permissions: { additionalDirectories: ['~/notes'] } }));
    writeFileSync(join(project, '.claude', 'settings.json'), JSON.stringify({ permissions: { additionalDirectories: ['../docs'] } }));
    writeFileSync(join(project, '.claude', 'settings.local.json'), 'not json');

    assert.deepEqual(readAdditionalDirectories(project, home), [join(home, 'notes'), join(home, 'docs')]);
  });

  test('returns nothing when there are no settings files', () => {
    assert.deepEqual(readAdditionalDirectories('/does/not/exist', '/also/missing'), []);
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

for (const node of NODE_BINARIES) {
  describe(`as a script (${node})`, () => {
    const env = { CLAUDE_PROJECT_DIR: '/Users/me/project' };

    test('uses CLAUDE_PROJECT_DIR as the project', () => {
      const input = { tool_name: 'Read', tool_input: { file_path: '/Users/me/project/a' }, cwd: '/elsewhere' };
      assert.equal(runHook(HOOK, input, { node, env }), '');
    });

    test('prints an "ask" decision for outside paths', () => {
      const output = runHook(HOOK, { tool_name: 'Read', tool_input: { file_path: '/etc/hosts' } }, { node, env });
      assert.equal(JSON.parse(output).hookSpecificOutput.permissionDecision, 'ask');
    });

    test('allows the scratchpad_dir from the input', () => {
      const input = { tool_name: 'Write', tool_input: { file_path: '/var/pad/a' }, scratchpad_dir: '/var/pad' };
      assert.equal(runHook(HOOK, input, { node, env }), '');
    });

    test('prints nothing, and exits 0, on malformed input', () => {
      assert.equal(runHook(HOOK, 'not json', { node, env }), '');
    });
  });
}
