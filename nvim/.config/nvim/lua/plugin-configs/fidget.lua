-- Progress notifications with LSP integration

return {
  'j-hui/fidget.nvim',
  opts = {
    notification = {
      window = {
        winblend = 0,
      },
    },
    progress = {
      display = {
        render_limit = 8,
      },
    },
  },
}
