-- which-key.nvim: displays a popup with possible keybindings

vim.pack.add {
  'https://github.com/folke/which-key.nvim',
}

require('which-key').setup {
  delay = 1000,
  win = {
    border = vim.g._settings_winborder,
  },
}
