-- All colorscheme plugins
-- These are added first so they're available for other plugins that reference colorschemes

vim.pack.add {
  -- Catppuccin
  'https://github.com/catppuccin/nvim',

  -- Tokyonight
  'https://github.com/folke/tokyonight.nvim',

  -- Gruvbox
  'https://github.com/ellisonleao/gruvbox.nvim',

  -- Kanagawa
  'https://github.com/rebelot/kanagawa.nvim',

  -- Nightfox
  'https://github.com/EdenEast/nightfox.nvim',

  -- Nord (using fork until upstream PR is merged)
  -- https://github.com/shaunsingh/nord.nvim/pull/160
  { src = 'https://github.com/simonmclean/nord.nvim', version = 'winbar' },
}

require('tokyonight').setup {
  style = 'moon',
}
