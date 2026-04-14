-- pretty-vanilla-tabline.nvim: enhanced tabline
-- Requires: nvim-web-devicons (must be added before this file is required)

vim.pack.add {
  'https://github.com/simonmclean/pretty-vanilla-tabline.nvim',
}

local get_icon = require('nvim-web-devicons').get_icon_by_filetype
local git_icon = get_icon 'git'

require('pretty-vanilla-tabline').setup {
  filetype_icons = {
    DiffviewFiles = git_icon,
    DiffviewFileHistory = git_icon,
  },
}
