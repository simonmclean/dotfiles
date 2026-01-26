local git_utils = require 'git.utils'
local u = require 'utils'

local create_cmd = vim.api.nvim_create_user_command

create_cmd('Main', git_utils.main, { desc = 'Switch to the main branch and pull the latest changes' })

create_cmd('TabWidth', function()
  vim.ui.input({ prompt = 'How many spaces? ', completion = 'command' }, function(arg)
    local n = tonumber(arg)
    vim.bo.tabstop = n
    vim.bo.shiftwidth = n
    vim.bo.expandtab = true
  end)
end, {})

create_cmd('Diff', function(opts)
  vim.cmd.tabnew()
  vim.api.nvim_set_option_value('filetype', opts.args, { buf = 0 })
  vim.cmd.vnew()
  vim.api.nvim_set_option_value('filetype', opts.args, { buf = 0 })
  vim.cmd 'windo diffthis'
end, {
  nargs = 1,
  complete = 'filetype',
  desc = 'Diff <filetype> - open a tab with 2 splits of given filetype and start a diffthis',
})

create_cmd('Run', function()
  local ft = vim.api.nvim_get_option_value('filetype', { buf = 0 })
  local path = vim.fn.expand '%:p'

  if ft == 'c' then
    local command = '!gcc -Wall -Wextra ' .. path .. ' -o /tmp/runc && /tmp/runc'
    vim.api.nvim_exec2(command, {})
  else
    u.warn('No run command for filetype: ' .. ft)
  end
end, {})
