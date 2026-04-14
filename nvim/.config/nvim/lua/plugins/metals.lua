-- nvim-metals: Scala LSP support
-- Requires: plenary.nvim (must be added before this file is required)

vim.pack.add {
  'https://github.com/scalameta/nvim-metals',
}

local metals_config = require('metals').bare_config()

metals_config.settings = {
  showImplicitArguments = true,
  showImplicitConversionsAndClasses = true,
  showInferredType = true,
  fallbackScalaVersion = '2.13.13',
  testUserInterface = 'Test Explorer',
}

metals_config.init_options.statusBarProvider = 'off'

local nvim_metals_group = vim.api.nvim_create_augroup('nvim-metals', { clear = true })
vim.api.nvim_create_autocmd('FileType', {
  pattern = { 'scala', 'sbt' },
  callback = function()
    require('metals').initialize_or_attach(metals_config)
  end,
  group = nvim_metals_group,
})
