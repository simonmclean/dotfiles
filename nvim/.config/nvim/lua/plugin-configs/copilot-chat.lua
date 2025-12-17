return {
  'CopilotC-Nvim/CopilotChat.nvim',
  event = 'VeryLazy',
  branch = 'main',
  dependencies = {
    { 'nvim-lua/plenary.nvim' }, -- for curl, log wrapper
  },
  build = 'make tiktoken', -- Only on MacOS or Linux
  opts = {
    -- debug = true, -- Enable debugging
    -- See Configuration section for rest
    model = 'claude-haiku-4.5',
    headers = {
      user = '👤 User',
      assistant = '🤖 Copilot',
      tool = '🔧 Tool',
    },
    separator = '━━',
  },
  keys = {
    { '<leader>cpc', '<cmd>CopilotChat<cr>', desc = 'CopilotChat' },
  },
  -- See Commands section for default commands if you want to lazy load on them
}
