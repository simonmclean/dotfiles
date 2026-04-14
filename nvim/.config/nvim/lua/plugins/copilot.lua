-- copilot.lua: GitHub Copilot integration
-- Suggestion/panel UI disabled in favour of blink-cmp-copilot source

vim.pack.add {
  'https://github.com/zbirenbaum/copilot.lua',
}

require('copilot').setup {
  suggestion = {
    enabled = false,
  },
  panel = {
    enabled = false,
  },
}
