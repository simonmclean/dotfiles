# 🗂️ Dotfiles

Unified dotfiles managed by [GNU Stow](https://www.gnu.org/software/stow/)

Create a package like `<package-name>/<location-relative-to-home>` e.g. `nvim/.config/nvim` or `zsh/.zshrc`.

Then - let's say we're on a new machine - from the root of this project, run `stow nvim`.
That will symlink `$STOW_DIR/.config/nvim` to `~/.config/nvim`.
