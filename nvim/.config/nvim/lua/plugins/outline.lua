-- outline.nvim: sidebar with tree-like outline of symbols, powered by LSP

-- https://github.com/hedyhli/outline.nvim/blob/main/lua/outline/symbols.lua
local icons = {
  Function = 'func',
  Class = 'class',
  Method = 'method',
  Property = 'prop',
  Constructor = 'constructor',
  Variable = 'var',
  Constant = 'const',
  String = 'str',
  Number = 'num',
  Boolean = 'bool',
  Array = 'arr',
  Object = 'obj',
}

local function icon_fetcher(kind)
  if icons[kind] then
    return icons[kind]
  end
  return string.lower(kind)
end

vim.pack.add {
  'https://github.com/hedyhli/outline.nvim',
}

require('outline').setup {
  preview_window = {
    auto_preview = true,
    winblend = vim.g._settings_winblend,
  },
  outline_window = {
    show_cursorline = true,
    hide_cursor = true,
  },
  symbols = {
    icon_fetcher = icon_fetcher,
  },
}
