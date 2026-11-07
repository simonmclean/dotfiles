import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { parseCommands, programName } from '../lib/shell.mjs';

const HOOK_IO = fileURLToPath(new URL('../lib/hook-io.mjs', import.meta.url));

describe('parseCommands', () => {
  test('splits on separators', () => {
    assert.deepEqual(parseCommands('cd x && git push; ls | wc -l || true & sleep 1'), [
      ['cd', 'x'],
      ['git', 'push'],
      ['ls'],
      ['wc', '-l'],
      ['true'],
      ['sleep', '1'],
    ]);
  });

  test('splits on newlines and parentheses', () => {
    assert.deepEqual(parseCommands('echo a\n(cd b && ls)'), [['echo', 'a'], ['cd', 'b'], ['ls']]);
  });

  test('keeps quoted text together and removes the quotes', () => {
    assert.deepEqual(parseCommands(`git commit -m 'a; b' --author "Me <me@x>"`), [
      ['git', 'commit', '-m', 'a; b', '--author', 'Me <me@x>'],
    ]);
    assert.deepEqual(parseCommands(`cat "$HOME"/.zshrc`), [['cat', '$HOME/.zshrc']]);
  });

  test('keeps empty quoted words', () => {
    assert.deepEqual(parseCommands(`printf ''`), [['printf', '']]);
  });

  test('handles backslash escapes', () => {
    assert.deepEqual(parseCommands('cat my\\ file\\;x'), [['cat', 'my file;x']]);
  });

  test('treats command substitution as separate commands', () => {
    assert.deepEqual(parseCommands('echo `git push`'), [['echo'], ['git', 'push']]);
    assert.deepEqual(parseCommands('echo $(git push)'), [['echo'], ['git', 'push']]);
  });

  test('splits words at redirections', () => {
    assert.deepEqual(parseCommands('echo x>/tmp/out 2>/dev/null <in'), [['echo', 'x', '/tmp/out', '2', '/dev/null', 'in']]);
  });

  test('unwraps sh/bash/zsh -c', () => {
    assert.deepEqual(parseCommands(`bash -c 'cd x && git push'`), [['cd', 'x'], ['git', 'push']]);
    assert.deepEqual(parseCommands(`/bin/zsh -lc "ls ~"`), [['ls', '~']]);
    assert.deepEqual(parseCommands(`sh -c`), [['sh', '-c']]);
  });

  test('returns nothing for an empty command line', () => {
    assert.deepEqual(parseCommands(''), []);
    assert.deepEqual(parseCommands('  ;  '), []);
  });
});

test('programName strips the folder', () => {
  assert.equal(programName('/usr/bin/git'), 'git');
  assert.equal(programName('git'), 'git');
});

describe('hook-io', () => {
  const runModule = (script, input) =>
    execFileSync(process.execPath, ['--input-type=module', '-e', script], { input, encoding: 'utf8' });

  test('readHookInput parses JSON from stdin', () => {
    const script = `import { readHookInput } from ${JSON.stringify(HOOK_IO)}; console.log(JSON.stringify(readHookInput()));`;
    assert.equal(runModule(script, '{"a":1}').trim(), '{"a":1}');
  });

  test('readHookInput treats empty or malformed input as {}', () => {
    const script = `import { readHookInput } from ${JSON.stringify(HOOK_IO)}; console.log(JSON.stringify(readHookInput()));`;
    assert.equal(runModule(script, '').trim(), '{}');
    assert.equal(runModule(script, 'not json').trim(), '{}');
    assert.equal(runModule(script, 'null').trim(), '{}');
  });

  test('runIfMain does nothing when there is no script path (node -e)', () => {
    const script = `import { runIfMain } from ${JSON.stringify(HOOK_IO)}; runIfMain(import.meta.url, () => console.log('ran'));`;
    assert.equal(runModule(script, ''), '');
  });
});
