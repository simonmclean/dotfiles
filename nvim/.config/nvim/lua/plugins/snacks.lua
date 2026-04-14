-- snacks.nvim: collection of small utilities
-- Includes: picker (telescope replacement), terminal, indent guides, words, scope, gitbrowse

vim.pack.add {
  'https://github.com/folke/snacks.nvim',
}

---@return snacks.picker
local function picker()
  return require('snacks').picker
end

---@module 'snacks'
---@type snacks.Config
require('snacks').setup {
  image = { enabled = true },
  bigfile = { enabled = false },
  dashboard = { enabled = false },
  explorer = { enabled = false },
  indent = { enabled = true, animate = { enabled = false } },
  input = { enabled = false },
  gitbrowse = {},
  picker = {
    enabled = true,
    sources = {
      files = {
        hidden = true,
      },
      grep = {
        hidden = true,
      },
    },
    layouts = {
      default = {
        layout = {
          backdrop = false,
          width = 0.7,
          min_width = 80,
          height = 0.8,
          min_height = 30,
          box = 'vertical',
          border = vim.g._settings_winborder,
          title = '{title} {live} {flags}',
          title_pos = 'center',
          { win = 'input', height = 1, border = 'bottom' },
          { win = 'list', border = 'none' },
          { win = 'preview', title = '{preview}', height = 0.5, border = 'top' },
        },
      },
    },
  },
  notifier = { enabled = false },
  quickfile = { enabled = false },
  scope = { enabled = true },
  scroll = { enabled = false },
  statuscolumn = { enabled = false },
  words = { enabled = true },
  terminal = {
    win = {
      style = 'floating_terminal',
    },
  },
  styles = {
    ['floating_terminal'] = {
      relative = 'editor',
      position = 'float',
      backdrop = 100,
      height = 0.8,
      width = 0.8,
      zindex = 50,
      border = vim.g._settings_winborder,
    },
  },
}

vim.keymap.set({ 'n', 't' }, '<c-t>', function()
  require('snacks.terminal').toggle()
end, { desc = 'Toggle floating terminal', silent = true })

vim.keymap.set('n', 'gn', function()
  require('snacks.words').jump(1, true)
end, { desc = '[G]o [N]ext LSP reference', silent = true })

vim.keymap.set('n', '<leader>sh', function() picker().help() end, { desc = '[S]earch [H]elp', silent = true })
vim.keymap.set('n', '<leader>sf', function() picker().files() end, { desc = '[S]earch [F]iles', silent = true })
vim.keymap.set('n', '<leader>sp', function() picker()() end, { desc = '[S]earch [P]ickers', silent = true })
vim.keymap.set('n', '<leader>sb', function() picker().lines() end, { desc = '[S]earch [B]uffer', silent = true })
vim.keymap.set('n', '<leader>sg', function() picker().grep() end, { desc = '[S]earch [G]rep', silent = true })
vim.keymap.set('n', '<leader>sc', function() picker().commands() end, { desc = '[S]earch [C]ommands', silent = true })
vim.keymap.set('n', '<leader>sd', function() picker().diagnostics() end, { desc = '[S]earch [D]iagnostics', silent = true })
vim.keymap.set('n', '<leader>sr', function() picker().resume() end, { desc = '[S]earch [R]esume', silent = true })
vim.keymap.set('n', 'gd', function() picker().lsp_definitions() end, { desc = '[G]oto [D]efinition', silent = true })
vim.keymap.set('n', 'gr', function() picker().lsp_references() end, { desc = '[G]oto [R]eferences', silent = true, nowait = true })
vim.keymap.set('n', '<leader>ss', function() picker().lsp_symbols() end, { desc = '[S]earch Document [S]ymbols', silent = true })
vim.keymap.set('n', '<leader>sws', function() picker().lsp_workspace_symbols() end, { desc = '[S]earch [W]orkspace [S]ymbols', silent = true })
