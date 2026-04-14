-- codecompanion.nvim: AI-powered coding assistant
-- Requires: plenary.nvim, nvim-treesitter, fidget.nvim (must be added before this file is required)

local copilot_claude_sonnet = {
  name = 'copilot',
  model = 'claude-sonnet-4.6',
}

vim.pack.add {
  { src = 'https://github.com/olimorris/codecompanion.nvim', version = vim.version.range('>=19.0.0 <20.0.0') },
}

require('codecompanion').setup {
  interactions = {
    chat = {
      adapter = copilot_claude_sonnet,
      keymaps = {
        system_prompt = false,
      },
    },
    inline = { adapter = copilot_claude_sonnet },
    cmd = { adapter = copilot_claude_sonnet },
  },
}

require('code-companion-fidget'):init()
