#!/usr/bin/env node
// SessionStart hook: tell Claude the git state of the session's folder.
//
// Whatever this prints is added to Claude's context at the start of the
// session. It supports two CLAUDE.md rules:
//   - start new work from the latest default branch (so we report how far behind we are)
//   - ask about existing unrelated changes (so we list them)
//
// settings.json runs it only on "startup" and "clear": after a resume or
// compaction, uncommitted changes are usually Claude's own work in progress.

import { execFileSync } from 'node:child_process';

import { readHookInput, runIfMain } from './lib/hook-io.mjs';

const MAX_LISTED_CHANGES = 20;
const FETCH_TIMEOUT_MS = 10_000;
const LOCAL_GIT_TIMEOUT_MS = 3_000;

// Never let git wait for a password or an SSH prompt: a hook must not hang.
const NON_INTERACTIVE_GIT_ENV = {
  ...process.env,
  GIT_TERMINAL_PROMPT: '0',
  GIT_SSH_COMMAND: 'ssh -o BatchMode=yes -o ConnectTimeout=5',
};

// Run git in `cwd` and return its trimmed output, or null if it fails or times out.
function git(cwd, args, { timeout = LOCAL_GIT_TIMEOUT_MS } = {}) {
  try {
    const output = execFileSync('git', args, {
      cwd,
      env: NON_INTERACTIVE_GIT_ENV,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout,
    });
    return output.trimEnd();
  } catch {
    return null;
  }
}

// The remote's default branch, e.g. "origin/main", or null if there isn't one.
function findDefaultRemoteBranch(cwd) {
  const fromRemoteHead = git(cwd, ['symbolic-ref', '--short', 'refs/remotes/origin/HEAD']);
  if (fromRemoteHead) return fromRemoteHead;

  const hasOriginMain = git(cwd, ['rev-parse', '--verify', '--quiet', 'origin/main']) !== null;
  return hasOriginMain ? 'origin/main' : null;
}

// Number of commits in `range`, or null if git can't tell us.
function countCommits(cwd, range) {
  const output = git(cwd, ['rev-list', '--count', range]);
  return output === null ? null : Number(output);
}

function compareWithBase(cwd, base) {
  const behind = countCommits(cwd, `HEAD..${base}`);
  const ahead = countCommits(cwd, `${base}..HEAD`);
  return behind === null || ahead === null ? null : { base, behind, ahead };
}

// Collect the git state of `cwd`, or return null if it isn't inside a git repo.
export function getGitState(cwd) {
  if (git(cwd, ['rev-parse', '--is-inside-work-tree']) !== 'true') return null;

  const state = {
    branch: git(cwd, ['branch', '--show-current']) || null, // empty when HEAD is detached
    fetchFailed: false,
    comparison: null,
    changes: [], // null when git status fails
  };

  const hasOrigin = git(cwd, ['remote', 'get-url', 'origin']) !== null;
  if (hasOrigin) {
    state.fetchFailed = git(cwd, ['fetch', '--quiet', 'origin'], { timeout: FETCH_TIMEOUT_MS }) === null;

    const base = findDefaultRemoteBranch(cwd);
    if (base) state.comparison = compareWithBase(cwd, base);
  }

  const status = git(cwd, ['status', '--short']);
  state.changes = status === null ? null : status.split('\n').filter(Boolean);

  return state;
}

function describeChanges(changes) {
  if (changes === null) return ['- (git status failed; uncommitted changes unknown)'];
  if (changes.length === 0) return ['- Working tree clean'];

  return [
    `- Uncommitted changes (${changes.length} files):`,
    ...changes.slice(0, MAX_LISTED_CHANGES).map((change) => `    ${change}`),
    'If starting new work and these changes are unrelated to it, follow the CLAUDE.md rule about existing changes.',
  ];
}

// Turn the state into the short report Claude sees.
export function formatReport(state) {
  const lines = ['Git state at session start:'];

  lines.push(`- Current branch: ${state.branch ?? '(detached HEAD)'}`);

  if (state.fetchFailed) {
    lines.push('- (git fetch failed; remote info may be stale)');
  }

  if (state.comparison) {
    const { base, behind, ahead } = state.comparison;
    lines.push(`- vs ${base}: ${behind} behind, ${ahead} ahead`);
  }

  lines.push(...describeChanges(state.changes));

  return lines.join('\n');
}

function main() {
  const hookInput = readHookInput();
  const state = getGitState(hookInput.cwd || process.cwd());
  if (state) console.log(formatReport(state));
}

runIfMain(import.meta.url, main);
