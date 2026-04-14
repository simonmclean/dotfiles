-- nvim-ts-autotag: auto close and rename HTML/JSX tags
-- Requires: nvim-treesitter (must be added before this file is required)

vim.pack.add {
  'https://github.com/windwp/nvim-ts-autotag',
}

require('nvim-ts-autotag').setup {}
