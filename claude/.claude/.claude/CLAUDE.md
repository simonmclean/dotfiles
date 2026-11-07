# ~/.claude (Claude Code config folder)

This folder is my Claude Code configuration, not a normal project. Instructions here load when the session is in `~/.claude` (or `~/stow/claude/.claude`); `~/.claude/CLAUDE.md` is my global file for all projects.

The files I maintain are stowed (symlinked) from `~/stow/claude/.claude/`, which is in the git repo `~/stow`. Editing via either path changes the same file. Git commands work through the symlinks, e.g. `git -C ~/.claude/hooks status -- :/claude`.

## Hand-maintained files

- `CLAUDE.md`: global instructions. Only edit it when I ask.
- `settings.json`: global settings, permissions and hooks. Keep it valid JSON (`jq . settings.json`) and don't remove existing entries without asking.
- `hooks/`: hook scripts (registered in `settings.json`) in `src/`, shared helpers and types in `src/lib/`, tests in `tests/`, and the TypeScript tooling (`package.json`, `tsconfig.json`).
- `.claude/`: config for working on this folder: this file, the `/review-claude-config` skill and its reviewer agents.

Everything else (`projects/`, `sessions/`, `cache/`, `file-history/`, `telemetry/`, etc.) is managed by Claude Code. Don't edit or delete it unless I ask.

## Hooks

- Write hooks in TypeScript (`.ts`). Readability matters most: small named functions, comments explaining *why*, no clever one-liners or dense regexes. Use types where they make the code clearer, such as function signatures and the hook input and output types in `hooks/src/lib/types.ts`.
- Node runs the `.ts` files directly by stripping the types, so:
  - Hooks run with whatever `node` is first on Claude Code's PATH, and it must be 22.18+. Older Nodes are installed (`/usr/local/bin/node` is v16) and fail on `.ts`; with `onFailure: "block"` that would block every Bash command.
  - Use only syntax that can simply be deleted: no `enum`, `namespace` or constructor parameter properties (`erasableSyntaxOnly` enforces this).
  - Import with the `.ts` extension, e.g. `./lib/shell.ts`.
  - Types are never checked at runtime. Hook input is untrusted JSON, so handle missing or wrong fields instead of relying on the types.
- Each hook exports its logic as functions (pure where possible) and only runs `main()` when executed directly, so the logic can be unit tested. Use `readHookInput()`, `runIfMain()` and `stringField()` from `hooks/src/lib/hook-io.ts`.
- Register hooks in `settings.json` as `node ~/.claude/hooks/src/<name>.ts`. When renaming or moving a hook, add the new file first, then update `settings.json`, then delete the old file: a missing hook file with `onFailure: "block"` blocks every Bash command.
- Hooks must not hang or crash: no interactive prompts, timeouts on git and network calls, and exit 0 when there's nothing to say.
- Hooks must not depend on `node_modules` at runtime: dev dependencies (`typescript`, `@types/node`) are only for type checking.
- Every hook needs unit tests in `hooks/tests/<name>.test.ts` using `node:test`. Cover the exported functions and running the script end-to-end via stdin/stdout with `runHook()` from `tests/helpers.ts`, which runs it through a symlink the way `settings.json` does.
- After any change, type-check and run the tests (run `npm install` once first):
  ```bash
  cd ~/.claude/hooks && npm test
  ```
