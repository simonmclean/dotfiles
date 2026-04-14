-- neotest: integrated test runner
-- Requires: nvim-nio, plenary.nvim, FixCursorHold.nvim, nvim-treesitter (must be added before this file is required)

vim.pack.add {
  'https://github.com/nvim-neotest/nvim-nio',
  'https://github.com/antoinemadec/FixCursorHold.nvim',
  'https://github.com/marilari88/neotest-vitest',
  'https://github.com/nvim-neotest/neotest-jest',
  'https://github.com/fredrikaverpil/neotest-golang',
  'https://github.com/nvim-neotest/neotest',
}

local neotest = require 'neotest'

---@diagnostic disable-next-line: missing-fields
neotest.setup {
  adapters = {
    require 'neotest-vitest',
    require 'neotest-golang',
    require 'neotest-jest' {
      jestCommand = 'yarn dlx jest',
      jestArguments = function(defaultArguments, _)
        return defaultArguments
      end,
      cwd = function()
        return vim.fn.getcwd()
      end,
      jest_test_discovery = true,
      isTestFile = require('neotest-jest.jest-util').defaultIsTestFile,
    },
  },
}

-- Close neotest before exiting, otherwise it makes a mess when the session is restored
vim.api.nvim_create_autocmd('VimLeavePre', {
  callback = function()
    local wins = vim.api.nvim_list_wins()
    for _, win in ipairs(wins) do
      local buf = vim.api.nvim_win_get_buf(win)
      local ft = vim.api.nvim_get_option_value('filetype', { buf = buf })
      if ft and string.find(ft, 'neotest') then
        vim.api.nvim_win_close(win, true)
      end
    end
  end,
})
