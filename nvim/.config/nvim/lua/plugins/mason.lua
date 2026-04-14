-- mason.nvim: manage language servers, linters, debuggers etc

vim.pack.add {
  'https://github.com/mason-org/mason.nvim',
}

---@module 'mason'
---@type MasonSettings
require('mason').setup {
  ui = {
    border = vim.g._settings_winborder,
    winblend = vim.g._settings_winblend,
    backdrop = 100,
  },
}
