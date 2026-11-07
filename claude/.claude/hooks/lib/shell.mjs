// A small Bash command-line parser for hooks.
//
// It understands enough of the shell to find the commands a command line runs
// and their arguments: quotes, backslash escapes, separators (; && || | & ( )
// and newlines), command substitution with backticks or $( ), redirections,
// and `bash -c '...'` style wrappers.
//
// It is not a full shell parser. Variables aren't expanded, and command
// substitution inside double quotes ("$(git push)") isn't seen. Hooks use it
// to decide when to *ask*, so it leans towards finding too much rather than
// too little.

// Characters that end one command and start the next.
const COMMAND_SEPARATORS = [';', '&', '|', '(', ')', '\n', '`'];

// Characters that end a word but aren't part of any word: `cat a>b` -> ["cat", "a", "b"].
const REDIRECTIONS = ['<', '>'];

const SHELLS = ['sh', 'bash', 'zsh'];

const isWhitespace = (char) => char === ' ' || char === '\t';

// Split a command line into commands, each a list of words with quotes removed.
//
//   parseCommands(`cd x && git commit -m 'a; b'`)
//   -> [["cd", "x"], ["git", "commit", "-m", "a; b"]]
//
// The commands inside `sh -c '...'` are returned in place of the wrapper.
export function parseCommands(commandLine) {
  const commands = splitIntoWords(commandLine);
  return commands.flatMap((words) => {
    const inner = innerShellCommand(words);
    return inner === null ? [words] : parseCommands(inner);
  });
}

// The last part of a path: "/usr/bin/git" -> "git".
export function programName(word) {
  return word.slice(word.lastIndexOf('/') + 1);
}

// For `bash -c 'git push'` (or -lc, -ic, ...) return "git push"; otherwise null.
function innerShellCommand(words) {
  if (!SHELLS.includes(programName(words[0] ?? ''))) return null;

  const commandFlagIndex = words.findIndex((word, i) => i > 0 && /^-[a-z]*c[a-z]*$/.test(word));
  if (commandFlagIndex === -1) return null;

  return words[commandFlagIndex + 1] ?? null;
}

// The tokenizer: walks the command line one character at a time.
function splitIntoWords(commandLine) {
  const commands = [];
  let words = [];
  let word = '';
  let inWord = false; // separate from `word !== ''` so that '' still counts as a word
  let quote = null; // the quote character we're inside, if any

  const endWord = () => {
    if (inWord) words.push(word);
    word = '';
    inWord = false;
  };
  const endCommand = () => {
    endWord();
    if (words.length > 0) commands.push(words);
    words = [];
  };

  for (let i = 0; i < commandLine.length; i++) {
    const char = commandLine[i];

    if (quote) {
      if (char === quote) quote = null;
      else word += char;
    } else if (char === "'" || char === '"') {
      quote = char;
      inWord = true;
    } else if (char === '\\' && i + 1 < commandLine.length) {
      word += commandLine[++i];
      inWord = true;
    } else if (char === '$' && commandLine[i + 1] === '(') {
      endCommand();
      i++; // skip the "("
    } else if (COMMAND_SEPARATORS.includes(char)) {
      endCommand();
    } else if (isWhitespace(char) || REDIRECTIONS.includes(char)) {
      endWord();
    } else {
      word += char;
      inWord = true;
    }
  }

  endCommand();
  return commands;
}
