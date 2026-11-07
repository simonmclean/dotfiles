## Claude Sessions

- Keep the session name up to date: if the work moves significantly away from it, rename the session (using the session title tool, where one is available).

## Git

- When starting new work, switch to the default branch (usually `main`), then fetch and pull, unless I say otherwise.
- When starting new work, if there are existing unrelated changes in the current worktree, ask me whether to:
  - Discard those changes
  - Start in a new worktree
  - Continue anyway
- Only commit, push, or create or merge a pull request when I've asked for it (asking for several together, e.g. commit and push, is fine). If you think something is ready, suggest it rather than doing it. `git commit`, `git push`, `gh pr create` and `gh pr merge` also always show a permission prompt, enforced by a hook.
