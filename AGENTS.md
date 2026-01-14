# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-14
**Branch:** main

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
├── main.js               # Bundled output (DO NOT EDIT)
├── styles.css            # Plugin styles
├── esbuild.config.mjs    # Build configuration
└── manifest.json         # Plugin metadata
```

## WHERE TO LOOK
| Task | Location |
|------|----------|
| Plugin lifecycle | `src/main.ts` |
| Add new chart type | `src/renderer/InfographicView.ts` |
| Parse custom DSL | `src/parser/InfographicParser.ts` |
| Add settings | `src/settings.ts` + `src/ui/` |
| Styling | `styles.css` |

## CODE MAP
| Symbol | Type | Location |
|--------|------|----------|
| `InfographicPlugin` | class | `src/main.ts:18` |
| `InfographicRenderChild` | class | `src/renderer/InfographicView.ts` |
| `InfographicParser` | class | `src/parser/InfographicParser.ts` |
| `ExportModal` | class | `src/ui/ExportModal.ts` |
| `InfographicSettings` | type | `src/settings.ts` |

## CONVENTIONS
- **Strict TypeScript**: `strictNullChecks`, `noUncheckedIndexedAccess` enabled
- **Module resolution**: `baseUrl: "src"` - import from `src/...` directly
- **Bundle**: esbuild, externalizes `obsidian`, `@codemirror/*`, `electron`
- **Versioning**: `version-bump.mjs` syncs `package.json` → `manifest.json` → `versions.json`
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

## NOTES
- Toolbar (Copy/Export) always visible on rendered blocks
- Error behavior configurable: hide / show-error / show-code
- Dark mode auto-detected via `document.body.classList`
- ResizeObserver handles chart resizing
