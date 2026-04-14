-- mason-lspconfig.nvim: bridges mason and lspconfig
-- Requires: mason.nvim, nvim-lspconfig (must be added before this file is required)

vim.pack.add {
  'https://github.com/mason-org/mason-lspconfig.nvim',
}

require('mason-lspconfig').setup {}
