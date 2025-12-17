-- Manage language servers, linters, debuggers etc

return {
  'williamboman/mason.nvim',
  build = ':MasonUpdate',
  event = 'VeryLazy',
  dependencies = {
    'folke/neodev.nvim',
  },
  ---@module 'mason'
  ---@type MasonSettings
  opts = {
    ui = {
      border = vim.g._settings_winborder,
      winblend = vim.g._settings_winblend,
      backdrop = 100
    },
  },
}
