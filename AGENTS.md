# OBSIDIAN-INFOGRAPHIC

**Generated:** 2026-01-14  
**Commit:** 6eef4ea  
**Branch:** master

## OVERVIEW

Obsidian plugin rendering AntV Infographic visualizations from `infographic` fenced code blocks. TypeScript → esbuild → main.js.

## STRUCTURE

```
src/
├── main.ts           # Plugin lifecycle only (minimal)
├── settings.ts       # InfographicSettings + SettingTab
├── parser/           # parseInfographicSpec (JSON or AntV syntax)
├── renderer/         # InfographicRenderChild (MarkdownRenderChild)
└── ui/               # SourceCodeModal, ExportModal
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add command | `src/main.ts` | Use `this.addCommand()` in `onload()` |
| Change settings | `src/settings.ts` | Update interface + DEFAULT_SETTINGS + SettingTab |
| Modify parsing | `src/parser/InfographicParser.ts` | JSON vs AntV declarative detection |
| Change rendering | `src/renderer/InfographicView.ts` | Uses `@antv/infographic`, ResizeObserver |
| Add modal | `src/ui/` | Export from `index.ts` |
| Error handling | `src/main.ts:handleError()` | Three modes: show-code, show-error, hide |

## CODE MAP

| Symbol | Type | Location | Role |
|--------|------|----------|------|
| `InfographicPlugin` | class | main.ts | Plugin entry, registers code block processor |
| `InfographicSettings` | interface | settings.ts | Config schema |
| `InfographicSettingTab` | class | settings.ts | Settings UI |
| `parseInfographicSpec` | function | parser/ | Validates input, returns ParseResult |
| `InfographicRenderChild` | class | renderer/ | Manages Infographic lifecycle in DOM |
| `SourceCodeModal` | class | ui/ | Shows formatted source, copy support |
| `ExportModal` | class | ui/ | PNG/SVG export via toDataURL |

## CONVENTIONS

- **Tabs** for indentation (4-width)
- **Strict TypeScript**: `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`
- **Minimal main.ts**: Only lifecycle code; delegate to modules
- **Module exports**: Each subdir has `index.ts` barrel file
- **Error messages**: Use `console.error("[Infographic Plugin] ...")` pattern

## ANTI-PATTERNS

- **NEVER** commit `main.js`, `node_modules/`
- **NEVER** change `id` in manifest.json after release
- **NEVER** suppress type errors (`as any`, `@ts-ignore`)
- **NEVER** use empty catch blocks (current `destroyInfographic()` has one - legacy)
- **NEVER** make network requests without user consent
- **NEVER** access files outside vault

## COMMANDS

```bash
npm install          # Install deps
npm run dev          # Watch mode
npm run build        # Production (tsc check + minify)
npm run lint         # ESLint
```

## RELEASE

1. Bump version: `npm version patch|minor|major`
2. Creates tag matching `manifest.json` version (no `v` prefix)
3. Attach: `main.js`, `manifest.json`, `styles.css`

## TESTING

No automated tests. Manual testing:
1. Copy `main.js`, `manifest.json`, `styles.css` to vault
2. Reload Obsidian, enable plugin
3. Test `infographic` code blocks

## NOTES

- ResizeObserver handles Obsidian pane resizing
- Theme follows `body.theme-dark` class when set to "auto"
- AntV Infographic has ~200 built-in templates
- `isDesktopOnly: false` - should work on mobile
