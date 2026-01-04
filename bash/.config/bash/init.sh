source "$HOME/.config/bash/theme.sh"

if command -v zoxide &> /dev/null; then
  eval "$(zoxide init zsh)"
fi

if command -v starship &> /dev/null; then
  eval "$(starship init zsh)"
fi

if command -v carapace &> /dev/null; then
  autoload -Uz compinit
  compinit
  export CARAPACE_BRIDGES='zsh,fish,bash,inshellisense' # optional
  zstyle ':completion:*' format $'\e[2;37mCompleting %d\e[m'
  source <(carapace _carapace)
fi

if command -v fzf &> /dev/null; then
  source <(fzf --zsh)
fi

source "$HOME/.config/bash/variables.sh"
source "$HOME/.config/bash/aliases.sh"
source "$HOME/.config/bash/nvm.sh"
