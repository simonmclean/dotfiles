-- nvim-spider: smarter word motions that skip unimportant characters

vim.pack.add {
  'https://github.com/chrisgrieser/nvim-spider',
}

require('spider').setup {
  consistentOperatorPending = true,
}

vim.keymap.set({ 'n', 'o', 'x' }, 'w', "<cmd>lua require('spider').motion('w')<CR>", { silent = true })
vim.keymap.set({ 'n', 'o', 'x' }, 'e', "<cmd>lua require('spider').motion('e')<CR>", { silent = true })
vim.keymap.set({ 'n', 'o', 'x' }, 'b', "<cmd>lua require('spider').motion('b')<CR>", { silent = true })
