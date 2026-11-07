// Reading hook input and running a hook's main().

import { readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import type { HookInput } from './types.ts';

// Claude Code sends hook input as JSON on stdin. Treat missing or malformed
// input as empty, so a bad payload can't crash the hook.
export function readHookInput<Input extends HookInput>(): Input {
  try {
    const parsed: unknown = JSON.parse(readFileSync(0, 'utf8'));
    return isObject(parsed) ? (parsed as Input) : ({} as Input);
  } catch {
    return {} as Input;
  }
}

// A string field of hook input or tool input, or undefined if it's missing or
// not a string. The JSON is untrusted, so check before using it.
export function stringField(source: object | undefined, name: string): string | undefined {
  const value = (source as Record<string, unknown> | undefined)?.[name];
  return typeof value === 'string' ? value : undefined;
}

// Run `main` only when the file is executed directly (`node hook.ts`), not
// when tests import it. `moduleUrl` is the caller's `import.meta.url`.
export function runIfMain(moduleUrl: string, main: () => void): void {
  const scriptPath = process.argv[1];
  if (scriptPath && isSameFile(scriptPath, fileURLToPath(moduleUrl))) main();
}

// Compare real paths: Node follows symlinks for import.meta.url but not for
// process.argv[1], and ~/.claude/hooks is a symlink into ~/stow.
function isSameFile(pathA: string, pathB: string): boolean {
  try {
    return realpathSync(pathA) === realpathSync(pathB);
  } catch {
    return false;
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
