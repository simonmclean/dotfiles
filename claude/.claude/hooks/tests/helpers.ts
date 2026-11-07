// Shared helpers for running hook scripts end-to-end in tests.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HOOKS_DIR = fileURLToPath(new URL('..', import.meta.url));

// settings.json runs hooks through ~/.claude/hooks, which is a symlink into
// ~/stow. Run them through a symlink here too, so the tests catch anything
// that only breaks when the path isn't the real one.
const linkParent = mkdtempSync(path.join(tmpdir(), 'hooks-link-'));
const LINKED_HOOKS_DIR = path.join(linkParent, 'hooks');
symlinkSync(HOOKS_DIR, LINKED_HOOKS_DIR);
process.on('exit', () => rmSync(linkParent, { recursive: true, force: true }));

// Path of a hook script through the symlink, e.g. hookPath('confirm-commit-push-pr.ts').
export function hookPath(name: string): string {
  return path.join(LINKED_HOOKS_DIR, 'src', name);
}

// Run a hook script with `input` on stdin (objects are sent as JSON) and return its stdout.
// Throws if the script exits non-zero.
export function runHook(name: string, input: unknown, { env = {} }: { env?: Record<string, string> } = {}): string {
  return execFileSync(process.execPath, [hookPath(name)], {
    input: typeof input === 'string' ? input : JSON.stringify(input),
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}
