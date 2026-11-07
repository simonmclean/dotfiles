# ~/.claude (Claude Code config folder)

This folder is my Claude Code configuration, not a normal project. Instructions here load when the session is in `~/.claude` (or `~/stow/claude/.claude`); `~/.claude/CLAUDE.md` is my global file for all projects.

The files I maintain are stowed (symlinked) from `~/stow/claude/.claude/`, which is in the git repo `~/stow`. Editing via either path changes the same file. Git commands work through the symlinks, e.g. `git -C ~/.claude/hooks status -- :/claude`.

## Hand-maintained files

- `CLAUDE.md`: global instructions. Only edit it when I ask.
- `settings.json`: global settings, permissions and hooks. Keep it valid JSON (`jq . settings.json`) and don't remove existing entries without asking.
- `hooks/`: hook scripts registered in `settings.json`, shared helpers in `hooks/lib/`, tests in `hooks/tests/`.
- `.claude/`: config for working on this folder: this file, the `/review-claude-config` skill and its reviewer agents.

Everything else (`projects/`, `sessions/`, `cache/`, `file-history/`, `telemetry/`, etc.) is managed by Claude Code. Don't edit or delete it unless I ask.

## Hooks

- Write hooks in JavaScript (`.mjs`, ES modules). Readability matters most: small named functions, comments explaining *why*, no clever one-liners or dense regexes.
- Each hook exports its logic as functions (pure where possible) and only runs `main()` when executed directly, so the logic can be unit tested. Use `readHookInput()` and `runIfMain()` from `hooks/lib/hook-io.mjs`.
- Register hooks in `settings.json` as `node ~/.claude/hooks/<name>.mjs`.
- Hooks must not hang or crash: no interactive prompts, timeouts on git and network calls, and exit 0 when there's nothing to say.
- Keep hooks compatible with Node 16 (the old `/usr/local/bin/node` may be the one on PATH when a hook runs). The tests run each hook script under Node 16 too when it's installed; the tests themselves need Node 18+.
- Every hook needs unit tests in `hooks/tests/<name>.test.mjs` using `node:test`. Cover the exported functions and running the script end-to-end via stdin/stdout.
- Run the tests after any change:
  ```bash
  cd ~/.claude/hooks && node --test 'tests/*.test.mjs'
  ```
