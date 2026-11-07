// Reading hook input and running a hook's main().

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// Claude Code sends hook input as JSON on stdin. Treat missing or malformed
// input as empty, so a bad payload can't crash the hook.
export function readHookInput() {
  try {
    return JSON.parse(readFileSync(0, 'utf8')) ?? {};
  } catch {
    return {};
  }
}

// Run `main` only when the file is executed directly (`node hook.mjs`), not
// when tests import it. `moduleUrl` is the caller's `import.meta.url`.
export function runIfMain(moduleUrl, main) {
  const scriptPath = process.argv[1];
  if (scriptPath && moduleUrl === pathToFileURL(scriptPath).href) main();
}
