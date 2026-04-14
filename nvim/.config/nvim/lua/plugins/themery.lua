-- Theme selector with persistence

vim.pack.add {
  'https://github.com/zaldih/themery.nvim',
}

require('themery').setup {
  themes = {
    'catppuccin-frappe',
    'catppuccin-macchiato',
    'catppuccin-mocha',
    'default',
    'gruvbox',
    'kanagawa-dragon',
    'kanagawa-wave',
    'nightfox',
    'nord',
    'tokyonight-moon',
    'tokyonight-night',
    'tokyonight-storm',
  },
}
