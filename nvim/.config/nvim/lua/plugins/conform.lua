-- conform.nvim: formatting plugin

local js = { 'prettierd', 'prettier', stop_after_first = true }

vim.pack.add {
  'https://github.com/stevearc/conform.nvim',
}

---@module "conform"
---@type conform.setupOpts
require('conform').setup {
  formatters_by_ft = {
    lua = { 'stylua' },
    javascript = js,
    typescript = js,
    javascriptreact = js,
    typescriptreact = js,
    scala = { 'scalafmt' },
  },
}

vim.o.formatexpr = "v:lua.require'conform'.formatexpr()"

vim.keymap.set('n', '<leader>f', function()
  require('conform').format { async = true, lsp_format = 'fallback' }
end, { desc = 'Format buffer', silent = true })

vim.api.nvim_create_autocmd('BufWritePre', {
  callback = function(args)
    require('conform').format { bufnr = args.buf, lsp_format = 'fallback' }
  end,
})
