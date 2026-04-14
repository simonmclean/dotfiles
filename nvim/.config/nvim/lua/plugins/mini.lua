-- mini.nvim ecosystem: small focused plugins

vim.pack.add {
  -- textobjects for arguments
  'https://github.com/echasnovski/mini.ai',
  -- toggle between single and multiline arg lists (gS mapping)
  'https://github.com/echasnovski/mini.splitjoin',
  -- auto pairs
  'https://github.com/echasnovski/mini.pairs',
  -- surround chars: ({" etc
  'https://github.com/echasnovski/mini.surround',
}

require('mini.ai').setup {
  n_lines = 500,
}

require('mini.splitjoin').setup {}

require('mini.pairs').setup {}

require('mini.surround').setup {
  n_lines = 50,
  mappings = {
    add = 'gs',         -- Add surrounding in Normal and Visual modes
    delete = 'ds',      -- Delete surrounding
    replace = 'cs',     -- Replace surrounding
    find = '',          -- Find surrounding (to the right)
    find_left = '',     -- Find surrounding (to the left)
    highlight = '',     -- Highlight surrounding
    update_n_lines = '', -- Update `n_lines`
  },
}
