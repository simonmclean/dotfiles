-- nvim-web-devicons: filetype icons

vim.pack.add {
  'https://github.com/nvim-tree/nvim-web-devicons',
}

require('nvim-web-devicons').setup {
  override = {
    TelescopePrompt = {
      icon = ' ',
    },
    fugitive = {
      icon = '',
      -- TODO: Colors aren't working
      color = '#f14e32',
    },
  },
}
