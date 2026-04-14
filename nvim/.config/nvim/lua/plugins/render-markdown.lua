-- render-markdown.nvim: rich markdown rendering
-- Requires: nvim-treesitter, nvim-web-devicons (must be added before this file is required)

vim.pack.add {
  'https://github.com/MeanderingProgrammer/render-markdown.nvim',
}

---@module 'render-markdown'
---@type render.md.UserConfig
require('render-markdown').setup {
  file_types = { 'markdown', 'codecompanion' },
}
