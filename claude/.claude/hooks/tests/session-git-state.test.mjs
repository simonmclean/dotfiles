import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { formatReport, getGitState } from '../session-git-state.mjs';

const HOOK = fileURLToPath(new URL('../session-git-state.mjs', import.meta.url));

// Isolate git from the user's own config so tests behave the same everywhere.
Object.assign(process.env, {
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'test',
  GIT_AUTHOR_EMAIL: 'test@example.com',
  GIT_COMMITTER_NAME: 'test',
  GIT_COMMITTER_EMAIL: 'test@example.com',
});

const git = (cwd, ...args) => execFileSync('git', args, { cwd, stdio: 'ignore' });
const commit = (cwd, message) => git(cwd, 'commit', '--allow-empty', '-m', message);

describe('formatReport', () => {
  const cleanState = { branch: 'main', fetchFailed: false, comparison: null, changes: [] };

  test('reports branch and a clean tree', () => {
    assert.equal(
      formatReport(cleanState),
      ['Git state at session start:', '- Current branch: main', '- Working tree clean'].join('\n'),
    );
  });

  test('reports a detached HEAD', () => {
    assert.match(formatReport({ ...cleanState, branch: null }), /Current branch: \(detached HEAD\)/);
  });

  test('reports behind/ahead counts', () => {
    const report = formatReport({ ...cleanState, comparison: { base: 'origin/main', behind: 2, ahead: 1 } });
    assert.match(report, /- vs origin\/main: 2 behind, 1 ahead/);
  });

  test('warns when fetch failed', () => {
    assert.match(formatReport({ ...cleanState, fetchFailed: true }), /git fetch failed/);
  });

  test('lists changes and reminds Claude to ask', () => {
    const report = formatReport({ ...cleanState, changes: ['?? a.txt', ' M b.txt'] });
    assert.match(report, /Uncommitted changes \(2 files\):/);
    assert.match(report, /^ {4}\?\? a\.txt$/m);
    assert.match(report, /^ {4} M b\.txt$/m);
    assert.match(report, /ask whether to discard, use a new worktree, or continue/);
    assert.doesNotMatch(report, /Working tree clean/);
  });

  test('lists at most 20 changes but counts them all', () => {
    const changes = Array.from({ length: 32 }, (_, i) => `?? f${i}.txt`);
    const report = formatReport({ ...cleanState, changes });
    assert.match(report, /Uncommitted changes \(32 files\)/);
    assert.equal(report.split('\n').filter((line) => line.startsWith('    ')).length, 20);
  });
});

describe('getGitState', () => {
  let tmp;
  before(() => (tmp = mkdtempSync(join(tmpdir(), 'session-git-state-'))));
  after(() => rmSync(tmp, { recursive: true, force: true }));

  // A bare "origin", a "seed" clone that pushes to it, and a "work" clone under test.
  function setUpClonedRepo(name) {
    const origin = join(tmp, `${name}-origin.git`);
    const seed = join(tmp, `${name}-seed`);
    const work = join(tmp, `${name}-work`);
    git(tmp, 'init', '-q', '--bare', '-b', 'main', origin);
    git(tmp, 'init', '-q', '-b', 'main', seed);
    commit(seed, 'one');
    git(seed, 'remote', 'add', 'origin', origin);
    git(seed, 'push', '-q', 'origin', 'main');
    git(tmp, 'clone', '-q', origin, work);
    return { seed, work };
  }

  function setUpLocalRepo(name) {
    const repo = join(tmp, name);
    git(tmp, 'init', '-q', '-b', 'main', repo);
    commit(repo, 'one');
    return repo;
  }

  test('returns null outside a git repo', () => {
    const plain = join(tmp, 'plain');
    mkdirSync(plain);
    assert.equal(getGitState(plain), null);
  });

  test('fresh clone: up to date and clean', () => {
    const { work } = setUpClonedRepo('fresh');
    assert.deepEqual(getGitState(work), {
      branch: 'main',
      fetchFailed: false,
      comparison: { base: 'origin/main', behind: 0, ahead: 0 },
      changes: [],
    });
  });

  test('fetches, so new remote commits show as behind', () => {
    const { seed, work } = setUpClonedRepo('behind');
    commit(seed, 'two');
    commit(seed, 'three');
    git(seed, 'push', '-q', 'origin', 'main');

    assert.deepEqual(getGitState(work).comparison, { base: 'origin/main', behind: 2, ahead: 0 });
  });

  test('feature branch with local commits and uncommitted files', () => {
    const { work } = setUpClonedRepo('feature');
    git(work, 'checkout', '-q', '-b', 'feature');
    commit(work, 'local');
    writeFileSync(join(work, 'new.txt'), 'x');

    const state = getGitState(work);
    assert.equal(state.branch, 'feature');
    assert.deepEqual(state.comparison, { base: 'origin/main', behind: 0, ahead: 1 });
    assert.deepEqual(state.changes, ['?? new.txt']);
  });

  test('repo without a remote: no comparison', () => {
    const repo = setUpLocalRepo('no-remote');
    assert.deepEqual(getGitState(repo), { branch: 'main', fetchFailed: false, comparison: null, changes: [] });
  });

  test('unreachable remote: flags the failed fetch', () => {
    const repo = setUpLocalRepo('broken-remote');
    git(repo, 'remote', 'add', 'origin', join(tmp, 'does-not-exist.git'));
    assert.equal(getGitState(repo).fetchFailed, true);
  });

  test('detached HEAD: branch is null', () => {
    const repo = setUpLocalRepo('detached');
    git(repo, 'checkout', '-q', '--detach');
    assert.equal(getGitState(repo).branch, null);
  });

  test('as a script: prints the report for the cwd it is given', () => {
    const repo = setUpLocalRepo('script');
    const output = execFileSync('node', [HOOK], { input: JSON.stringify({ cwd: repo }), encoding: 'utf8' });
    assert.match(output, /^Git state at session start:\n- Current branch: main\n- Working tree clean\n$/);
  });

  test('as a script: prints nothing outside a repo', () => {
    const output = execFileSync('node', [HOOK], { input: JSON.stringify({ cwd: tmpdir() }), encoding: 'utf8' });
    assert.equal(output, '');
  });
});
