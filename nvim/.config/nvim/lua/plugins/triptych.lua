-- triptych.nvim: floating file explorer
-- Requires: plenary.nvim, nvim-web-devicons (must be added before this file is required)

vim.pack.add {
  'https://github.com/simonmclean/triptych.nvim',
}

require('triptych').setup {
  options = {
    backdrop = 100,
    transparency = vim.g._settings_winblend,
    show_hidden = true,
  },
  extension_mappings = {
    ['<leader>sg'] = {
      mode = 'n',
      fn = function(target)
        require('snacks').picker.grep {
          dirs = { target.path },
        }
      end,
    },
  },
}

vim.keymap.set('n', '<leader>-', ':Triptych<CR>', { silent = true })
