#!/usr/bin/env node
// SessionStart hook: tell Claude the git state of the session's folder.
//
// Whatever this prints is added to Claude's context at the start of the
// session. It supports two CLAUDE.md rules:
//   - start new work from the latest main (so we report how far behind we are)
//   - ask about existing uncommitted changes (so we list them)

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const MAX_LISTED_CHANGES = 20;
const FETCH_TIMEOUT_MS = 10_000;

// Never let git wait for a password or an SSH prompt: a hook must not hang.
const NON_INTERACTIVE_GIT_ENV = {
  ...process.env,
  GIT_TERMINAL_PROMPT: '0',
  GIT_SSH_COMMAND: 'ssh -o BatchMode=yes -o ConnectTimeout=5',
};

// Run git in `cwd` and return its trimmed output, or null if it fails.
function git(cwd, args, { timeout } = {}) {
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

function countCommits(cwd, range) {
  return Number(git(cwd, ['rev-list', '--count', range]));
}

// Collect the git state of `cwd`, or return null if it isn't inside a git repo.
export function getGitState(cwd) {
  if (git(cwd, ['rev-parse', '--is-inside-work-tree']) !== 'true') return null;

  const state = {
    branch: git(cwd, ['branch', '--show-current']) || null, // empty when HEAD is detached
    fetchFailed: false,
    comparison: null,
    changes: [],
  };

  const hasOrigin = git(cwd, ['remote', 'get-url', 'origin']) !== null;
  if (hasOrigin) {
    state.fetchFailed = git(cwd, ['fetch', '--quiet', 'origin'], { timeout: FETCH_TIMEOUT_MS }) === null;

    const base = findDefaultRemoteBranch(cwd);
    if (base) {
      state.comparison = {
        base,
        behind: countCommits(cwd, `HEAD..${base}`),
        ahead: countCommits(cwd, `${base}..HEAD`),
      };
    }
  }

  const status = git(cwd, ['status', '--short']);
  state.changes = status ? status.split('\n') : [];

  return state;
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

  if (state.changes.length === 0) {
    lines.push('- Working tree clean');
  } else {
    lines.push(`- Uncommitted changes (${state.changes.length} files):`);
    for (const change of state.changes.slice(0, MAX_LISTED_CHANGES)) {
      lines.push(`    ${change}`);
    }
    lines.push(
      'If starting new work, follow the CLAUDE.md rule: ask whether to discard, use a new worktree, or continue.',
    );
  }

  return lines.join('\n');
}

function main() {
  const hookInput = JSON.parse(readFileSync(0, 'utf8') || '{}');
  const state = getGitState(hookInput.cwd || process.cwd());
  if (state) console.log(formatReport(state));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
