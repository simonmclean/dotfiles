// The JSON that Claude Code sends to hooks and accepts back, limited to the
// fields these hooks use. See https://code.claude.com/docs/en/hooks.md
//
// Input fields are all optional: the hook can't trust what arrives on stdin,
// and readHookInput() returns {} when it's missing or malformed.

// --- Input ---

export interface HookInput {
  hook_event_name?: string;
  session_id?: string;
  /** The folder Claude is in when the hook runs. */
  cwd?: string;
  /** The session's scratchpad folder, where Claude keeps temporary files. */
  scratchpad_dir?: string;
}

export interface PreToolUseInput extends HookInput {
  tool_name?: string;
  /** The tool's arguments, e.g. `{ command }` for Bash or `{ file_path }` for Read. */
  tool_input?: Record<string, unknown>;
}

export interface SessionStartInput extends HookInput {
  source?: 'startup' | 'resume' | 'clear' | 'compact' | 'fork';
}

// --- Output ---

export interface PreToolUseOutput {
  hookSpecificOutput: {
    hookEventName: 'PreToolUse';
    permissionDecision: 'allow' | 'deny' | 'ask';
    /** Shown to the user with the permission prompt. */
    permissionDecisionReason?: string;
  };
}
