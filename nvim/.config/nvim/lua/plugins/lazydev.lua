-- lazydev.nvim: properly configures LuaLS for editing your Neovim config

vim.pack.add {
  'https://github.com/folke/lazydev.nvim',
}

require('lazydev').setup {
  library = {
    -- Load luvit types when the `vim.uv` word is found
    { path = '${3rd}/luv/library', words = { 'vim%.uv' } },
  },
}
