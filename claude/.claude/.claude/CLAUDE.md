# ~/.claude (Claude Code config folder)

This folder is my Claude Code configuration, not a normal project. Instructions here apply only when working in `~/.claude`; `~/.claude/CLAUDE.md` is my global file for all projects.

## Hand-maintained files

- `CLAUDE.md`: global instructions. Only edit it when I ask.
- `settings.json`: global settings, permissions and hooks. Keep it valid JSON (`jq . settings.json`) and don't remove existing entries without asking.
- `hooks/`: hook scripts registered in `settings.json`.

Everything else (`projects/`, `sessions/`, `cache/`, `file-history/`, `telemetry/`, etc.) is managed by Claude Code. Don't edit or delete it unless I ask.

## Hooks

- Write hooks in JavaScript (`.mjs`, ES modules). Readability matters most: small named functions, comments explaining *why*, no clever one-liners or dense regexes.
- Each hook exports its logic as pure functions and only runs `main()` (read JSON from stdin, write to stdout) when executed directly, so the logic can be unit tested.
- Register hooks in `settings.json` as `node ~/.claude/hooks/<name>.mjs`.
- Hooks must not hang or crash: no interactive prompts, timeouts on network calls, and exit 0 when there's nothing to say.
- Keep hooks compatible with Node 16 (the old `/usr/local/bin/node` may be the one on PATH when a hook runs). Tests may use Node 18+.
- Every hook needs unit tests in `hooks/tests/<name>.test.mjs` using `node:test`. Cover the pure functions and running the script end-to-end via stdin/stdout.
- Run the tests after any change:
  ```bash
  cd ~/.claude/hooks && node --test 'tests/*.test.mjs'
  ```
