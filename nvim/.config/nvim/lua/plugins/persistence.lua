-- persistence.nvim: session management

vim.pack.add {
  'https://github.com/folke/persistence.nvim',
}

local persistence = require 'persistence'
persistence.setup()

-- don't restore session if we're starting nvim with a file argument
if vim.fn.argc() == 0 then
  vim.schedule(persistence.load)
end
