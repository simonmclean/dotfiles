// Shared helpers for running hook scripts end-to-end in tests.

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Hooks may run under this old system Node, so end-to-end tests run on it too when it's installed.
const SYSTEM_NODE = '/usr/local/bin/node';

export const NODE_BINARIES = [process.execPath, ...(existsSync(SYSTEM_NODE) ? [SYSTEM_NODE] : [])];

// Absolute path of a hook script, e.g. hookPath('confirm-commit-push-pr.mjs').
export function hookPath(name) {
  return fileURLToPath(new URL(`../${name}`, import.meta.url));
}

// Run a hook script with `input` on stdin (objects are sent as JSON) and return its stdout.
// Throws if the script exits non-zero.
export function runHook(name, input, { node = process.execPath, env = {} } = {}) {
  return execFileSync(node, [hookPath(name)], {
    input: typeof input === 'string' ? input : JSON.stringify(input),
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}
