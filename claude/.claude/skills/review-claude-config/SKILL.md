---
name: review-claude-config
description: Review my Claude Code config (CLAUDE.md files, settings.json, hooks and their tests, skills, agents) for code quality, docs quality and whether it actually does its job. Reviews uncommitted changes by default, or the whole config with "all". Use when I ask to review my Claude config, hooks, CLAUDE.md or settings.
argument-hint: "[all | <git ref or range>]"
---

# Review Claude config

Review the Claude Code config I maintain, using three reviewer agents in parallel, then report verified findings. This is a review only: don't change any files unless I ask afterwards.

## The config

The files I maintain are stowed from `~/stow/claude/.claude/` into `~/.claude/`. Treat `~/stow/claude/.claude/` as the source of truth: it's what's in git. Everything else in `~/.claude` (`projects/`, `sessions/`, `cache/`, ...) is managed by Claude Code and is out of scope.

The conventions for this config are in `~/stow/claude/.claude/.claude/CLAUDE.md`. Reviewers judge against those.

## Steps

### 1. Work out the scope

From `$ARGUMENTS`:

- **Empty**: the uncommitted changes under `claude/` in `~/stow`:
  `git -C ~/stow status --short -- claude` and `git -C ~/stow diff HEAD -- claude`, plus the contents of any untracked files.
  If there are none, say so and ask whether to review everything instead.
- **`all`**: every file in `~/stow/claude/.claude/`.
- **A git ref or range** (e.g. `HEAD~3`, `main..feature`): `git -C ~/stow diff <ref> -- claude`.

For a change review, the reviewers still read surrounding files for context (a hook change may need its tests or the docs that describe it), but only report problems in, or caused by, the changes.

### 2. Gather shared context

- The list of files in scope, and the diff if there is one.
- Test results: `cd ~/stow/claude/.claude/hooks && node --test 'tests/*.test.mjs'`. Include failures in full.

### 3. Run the reviewers in parallel

Launch these three agents in a single message, giving each the scope, the file list, the diff and the test results:

| Agent | Looks at |
|---|---|
| `claude-config-code-reviewer` | Hooks, tests and other code: correctness, readability, tests, organisation |
| `claude-config-docs-reviewer` | CLAUDE.md files, skills, agents, code comments: clarity, concision, accuracy, consistency |
| `claude-config-effectiveness-reviewer` | Whether each rule, hook, setting, skill and agent actually achieves its purpose in Claude Code, including CLAUDE.md guidance that should be enforced by a hook or setting |

### 4. Verify and merge

For each finding, open the cited file and line and confirm it's real. Drop anything you can't confirm. Merge duplicates that several reviewers reported.

### 5. Report

Lead with a one-line verdict. Then list findings grouped by severity (**High**: broken, or fails its purpose; **Medium**: real weakness worth fixing; **Low**: polish). For each: `file:line`, the problem in one or two sentences, and the suggested fix. Paths are relative to `~/stow/claude/.claude/`.

End by asking which findings I want fixed.
