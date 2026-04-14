-- nvim-lsp-file-operations: LSP file operation support (rename, move, etc.)
-- Requires: plenary.nvim (must be added before this file is required)

vim.pack.add {
  'https://github.com/antosha417/nvim-lsp-file-operations',
}

require('lsp-file-operations').setup {}
