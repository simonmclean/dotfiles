-- nvim-dap-virtual-text: virtual text for DAP variable values
-- Requires: nvim-dap (must be added before this file is required)

vim.pack.add {
  'https://github.com/theHamsta/nvim-dap-virtual-text',
}

require('nvim-dap-virtual-text').setup {}
