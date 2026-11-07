// Small helpers for looking at Bash command lines in hooks.
//
// These are deliberately simple, not a real shell parser: quoting and
// variables aren't understood. Hooks use them to decide when to *ask*, so a
// wrong guess costs an extra prompt, not a missed one in the common cases.

// Split a command line into the individual commands it runs,
// e.g. "cd x && git push; ls" -> ["cd x ", " git push", " ls"].
export function splitIntoCommands(commandLine) {
  return commandLine.split(/&&|\|\||[;|&()\n]/);
}

// Split a single command into its words, e.g. " git -C repo push" -> ["git", "-C", "repo", "push"].
export function words(command) {
  return command.trim().split(/\s+/).filter(Boolean);
}
