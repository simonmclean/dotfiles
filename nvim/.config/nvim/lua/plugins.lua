-- Foundational / shared dependencies --
require 'plugins.themes' -- colorschemes (available early for :colorscheme)
require 'plugins.plenary' -- utility library used by many plugins
require 'plugins.web-devicons' -- filetype icons used by many plugins
require 'plugins.treesitter' -- syntax parsing; required by several plugins
require 'plugins.fidget' -- progress notifications; required by code-companion

-- LSP --
require 'plugins.lsp-config' -- LSP configurations
require 'plugins.mason' -- LSP/tool installer
require 'plugins.mason-lspconfig' -- bridges mason ↔ lspconfig (needs both above)
require 'plugins.lazydev' -- LuaLS config for Neovim development

-- Completion --
require 'plugins.copilot' -- GitHub Copilot (source for blink)
require 'plugins.blink' -- completion engine (needs copilot + friendly-snippets)

-- AI / code assistance --
require 'plugins.code-companion' -- AI chat/inline (needs plenary, treesitter, fidget)

-- Formatting & linting --
require 'plugins.conform' -- formatter
require 'plugins.lint' -- linter
require 'plugins.eslint' -- ESLint integration

-- Debugging --
require 'plugins.dap' -- DAP core + dap-view UI (needs mason)
require 'plugins.dap-virtual-text' -- virtual text for DAP (needs dap)

-- Git --
require 'plugins.gitsigns' -- hunk management, signcolumn
require 'plugins.diffview' -- advanced diff UI

-- Navigation & UI --
require 'plugins.snacks' -- picker, terminal, indent guides, words, etc.
require 'plugins.flash' -- jump navigation
require 'plugins.spider' -- smarter word motions
require 'plugins.triptych' -- file explorer (needs plenary, web-devicons, snacks)
require 'plugins.outline' -- LSP symbol outline
require 'plugins.which-key' -- keybinding hints
require 'plugins.yankbank' -- clipboard history

-- Language-specific --
require 'plugins.treesitter-context' -- sticky context (needs treesitter)
require 'plugins.ts-autotag' -- auto close/rename HTML/JSX tags (needs treesitter)
require 'plugins.metals' -- Scala LSP (needs plenary)
require 'plugins.neotest' -- test runner (needs nvim-nio, plenary, treesitter)

-- Markdown --
require 'plugins.render-markdown' -- rich markdown rendering (needs treesitter, web-devicons)

-- Appearance & session --
require 'plugins.themery' -- theme selector + persistence (needs colorschemes above)
require 'plugins.pretty-vanilla-tabline' -- tabline (needs web-devicons)
require 'plugins.lsp-file-operations' -- LSP rename/move support (needs plenary)
require 'plugins.persistence' -- session management

-- Misc --
require 'plugins.mini' -- mini.ai, mini.splitjoin, mini.pairs, mini.surround
require 'plugins.misc' -- fugitive, vim-repeat, vim-abolish, vim-jsdoc, vim-eunuch
