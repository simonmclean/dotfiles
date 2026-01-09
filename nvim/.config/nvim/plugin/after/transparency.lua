-- TODO: Set transparent background on my statusline and tabline

if vim.g._settings_transparent_background == true then
  local highlight_groups = {
    'EndOfBuffer',
    'FloatBorder',
    'FloatFooter',
    'FloatTitle',
    'FoldColumn',
    'Folded',
    'Normal',
    'NormalFloat',
    'NormalNC',
    'Pmenu',
    'SignColumn',
    'Statusline',
    'TablineFill',
    'TablineFill',
    'TelescopeBorder',
    'TelescopeNormal',
    'TelescopePromptBorder',
    'TelescopePromptTitle',
    'Terminal',
    'WhichKeyFloat',
    'Winbar',

    -- Neotree
    'NeoTreeNormal',
    'NeoTreeNormalNC',
    'NeoTreeVertSplit',
    'NeoTreeWinSeparator',
    'NeoTreeEndOfBuffer',

    -- Nvim-tree
    'NvimTreeNormal',
    'NvimTreeVertSplit',
    'NvimTreeEndOfBuffer',

    -- Notify
    'NotifyINFOBody',
    'NotifyERRORBody',
    'NotifyWARNBody',
    'NotifyTRACEBody',
    'NotifyDEBUGBody',
    'NotifyINFOTitle',
    'NotifyERRORTitle',
    'NotifyWARNTitle',
    'NotifyTRACETitle',
    'NotifyDEBUGTitle',
    'NotifyINFOBorder',
    'NotifyERRORBorder',
    'NotifyWARNBorder',
    'NotifyTRACEBorder',
    'NotifyDEBUGBorder',
  }

  for _, hi in ipairs(highlight_groups) do
    vim.api.nvim_set_hl(0, hi, { bg = 'none' })
  end
end
