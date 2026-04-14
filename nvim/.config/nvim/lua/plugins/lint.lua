-- nvim-lint: linting plugin

vim.pack.add {
  'https://github.com/mfussenegger/nvim-lint',
}

local js = {}

require('lint').linters_by_ft = {
  javascript = js,
  typescript = js,
  javascriptreact = js,
  typescriptreact = js,
  terraform = { 'tflint' },
  lua = { 'luacheck' },
}

vim.api.nvim_create_autocmd({ 'BufWritePost', 'BufEnter' }, {
  callback = function()
    require('lint').try_lint()
  end,
})
