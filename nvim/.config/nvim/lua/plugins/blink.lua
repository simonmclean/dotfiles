-- blink.cmp: completion engine
-- Requires: friendly-snippets, blink-cmp-copilot (must be added before this file is required)

vim.pack.add {
  'https://github.com/rafamadriz/friendly-snippets',
  'https://github.com/giuxtaposition/blink-cmp-copilot',
  { src = 'https://github.com/saghen/blink.cmp', version = vim.version.range('>=1.0.0 <2.0.0') },
}

---@module 'blink.cmp'
---@type blink.cmp.Config
require('blink.cmp').setup {
  sources = {
    per_filetype = {
      codecompanion = { 'codecompanion' },
    },
    default = { 'lsp', 'copilot', 'path', 'snippets', 'buffer' },
    providers = {
      copilot = {
        name = 'copilot',
        module = 'blink-cmp-copilot',
        score_offset = 100,
        async = true,
      },
    },
  },
  completion = { documentation = { auto_show = true } },
  signature = { enabled = true },
  cmdline = {
    completion = {
      menu = {
        auto_show = true,
      },
    },
  },
}
