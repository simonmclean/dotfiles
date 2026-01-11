local copilot_claude_sonnet = {
  name = 'copilot',
  model = 'claude-sonnet-4.5',
}

return {
  'olimorris/codecompanion.nvim',
  version = '^18.0.0',
  event = 'VeryLazy',
  opts = {
    interactions = {
      chat = { adapter = copilot_claude_sonnet },
      inline = { adapter = copilot_claude_sonnet },
      cmd = { adapter = copilot_claude_sonnet },
    },
  },
  dependencies = {
    'nvim-lua/plenary.nvim',
    'nvim-treesitter/nvim-treesitter',
  },
  init = function()
    require('code-companion-fidget'):init()
  end,
}
