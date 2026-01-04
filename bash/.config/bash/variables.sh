if command -v nvim &> /dev/null; then
  export EDITOR="nvim"
fi

export PNPM_HOME="/Users/simonmclean/Library/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac

export HOMEBREW_BUNDLE_FILE=~/.Brewfile
