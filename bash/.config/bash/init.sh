if command -v zoxide &> /dev/null; then
  eval "$(zoxide init zsh)"
fi

if command -v starship &> /dev/null; then
  eval "$(starship init zsh)"
fi

if command -v carapace &> /dev/null; then
  export CARAPACE_BRIDGES='zsh,fish,bash,inshellisense'
  source <(carapace _carapace)
fi

if command -v fzf &> /dev/null; then
  source <(fzf --zsh)
fi

source "$HOME/.config/bash/variables.sh"
source "$HOME/.config/bash/aliases.sh"
