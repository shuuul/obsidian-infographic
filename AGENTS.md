# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-14
**Branch:** main
**Version:** 0.1.4

## OVERVIEW
Obsidian plugin that renders AntV Infographic visualizations from fenced `infographic` code blocks. Integrates `@antv/infographic` library into Obsidian's markdown preview.

## STRUCTURE
```
./
├── src/
│   ├── main.ts           # Plugin entry point
│   ├── settings.ts       # Settings tab definition
│   ├── parser/           # DSL/JSON spec parsing
│   ├── renderer/         # AntV Infographic rendering
│   └── ui/               # Modals (Export, Source)
├── skills/               # Agent skills for OhMyOpenCode
│   └── obsidian-infographics/
│       ├── SKILL.md
│       └── reference/
│           └── GALLERY.md
├── main.js               # Bundled output (DO NOT EDIT)
├── styles.css            # Plugin styles
├── esbuild.config.mjs    # Build configuration
├── manifest.json         # Plugin metadata
├── README.md             # English documentation
├── README_CN.md          # Chinese documentation
└── AGENTS.md             # AI agent knowledge base
```

## WHERE TO LOOK
| Task | Location |
|------|----------|
| Plugin lifecycle | `src/main.ts` |
| Add new chart type | `src/renderer/InfographicView.ts` |
| Parse custom DSL | `src/parser/InfographicParser.ts` |
| Add settings | `src/settings.ts` + `src/ui/` |
| Styling | `styles.css` |
| Agent skill docs | `skills/obsidian-infographics/` |

## CODE MAP
| Symbol | Type | Location |
|--------|------|----------|
| `InfographicPlugin` | class | `src/main.ts:18` |
| `InfographicRenderChild` | class | `src/renderer/InfographicView.ts` |
| `InfographicParser` | class | `src/parser/InfographicParser.ts` |
| `ExportModal` | class | `src/ui/ExportModal.ts` |
| `SourceModal` | class | `src/ui/SourceModal.ts` |
| `InfographicSettings` | type | `src/settings.ts` |

## CONVENTIONS
- **Strict TypeScript**: `strictNullChecks`, `noUncheckedIndexedAccess` enabled
- **Module resolution**: `baseUrl: "src"` - import from `src/...` directly
- **Bundle**: esbuild, externalizes `obsidian`, `@codemirror/*`, `electron`
- **Versioning**: `version-bump.mjs` syncs `package.json` → `manifest.json` → `versions.json`
- **License**: Apache-2.0
- **No backward compatibility**: Breaking changes accepted per `CLAUDE.md`

## ANTI-PATTERNS (THIS PROJECT)
- **Never** edit `main.js` directly - always rebuild from `src/`
- **Never** bypass `InfographicRenderChild` for rendering - use lifecycle hooks
- **Never** register events without `this.registerEvent()` - causes leaks
- **Never** put DOM logic in `main.ts` - delegate to `MarkdownRenderChild`

## COMMANDS
```bash
npm run dev       # Watch mode with esbuild
npm run build     # Type-check + production bundle
npm run lint      # ESLint + obsidianmd rules
npm run version   # Bump version, update manifests
```

## RELEASE PROCESS

### Automated (GitHub Actions)

When you push a tag matching `v*`, GitHub Actions automatically:
1. Builds the plugin
2. Creates and publishes a release with `main.js`, `manifest.json`, `styles.css`

Tag format: `v0.x.x` (e.g., `v0.1.4`)

### Manual Release Process

```bash
# 1. Build the plugin
npm run build

# 2. Commit changes
git add -A && git commit -m "Your commit message"

# 3. Push changes (optional - for CI/CD)
git push origin

# 4. Create and push tag
git tag -a v0.x.x -m "Release v0.x.x"
git push origin v0.x.x

# 5. GitHub Actions will create the release automatically
# OR create manually:
gh release create v0.x.x --title "v0.x.x" --notes "Release notes" main.js manifest.json styles.css
```

**Version bump:**
```bash
# Manual: Edit version in package.json and manifest.json
# Or use: npm run version [patch|minor|major]
```

**Why this order?**
- Tag must exist BEFORE GitHub Actions can create release
- GitHub Actions triggers on tag push event
- Release is published immediately (not draft)

## FEATURES
- 🎨 **200+ Built-in Templates** - Process flows, timelines, hierarchies, charts
- 📝 **Dual Syntax Support** - JSON configuration + AntV declarative DSL
- 🖼️ **Export Options** - Save as SVG or PNG
- 🌓 **Theme Support** - Auto-detect or force light/dark mode
- 📐 **Responsive Design** - Automatic resize handling
- 🔄 **Live Reload** - Refresh all infographics with a command
- 🤖 **Agent Skill** - Available in OhMyOpenCode for AI-assisted visualization

## SETTINGS
| Setting | Description | Default |
|---------|-------------|---------|
| Auto render | Automatically render in preview | `true` |
| Theme | Auto / Light / Dark | `auto` |
| Error behavior | show-code / show-error / hide | `show-code` |
| Max width | Maximum width (px) | `800` |
| Max height | Maximum height (px) | `600` |

## NOTES
- Toolbar (Copy/Export) always visible on rendered blocks
- Error behavior configurable: hide / show-error / show-code
- Dark mode auto-detected via `document.body.classList`
- ResizeObserver handles chart resizing
- Agent skill in `skills/obsidian-infographics/` for OhMyOpenCode integration
