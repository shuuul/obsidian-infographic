# Obsidian Infographic Plugin - Development Plan

## Overview
Create an Obsidian plugin that renders AntV Infographic visualizations from fenced code blocks (```infographic ```) and provides a button to convert/view source code.

## Phase 1: Project Setup & Configuration

### 1.1 Update Project Metadata
- [x] Rename plugin ID from `sample-plugin` to `obsidian-infographic` in `manifest.json`
- [x] Update plugin name to "Obsidian Infographic"
- [x] Update description to reflect AntV Infographic support
- [x] Set appropriate `minAppVersion` (verify against Obsidian API features used)
- [x] Update `package.json` name and description

### 1.2 Install AntV Infographic Dependency
- [x] Research @antv/infographic package on npm
- [x] Add dependency to `package.json`
- [x] Update esbuild configuration if needed for external dependencies
- [x] Verify bundling works with esbuild

### 1.3 Restructure Source Code
- [x] Create `src/renderer/` directory for Infographic rendering logic
- [x] Create `src/parser/` directory for code block parsing
- [x] Create `src/ui/` directory for modals and controls
- [x] Keep `main.ts` minimal (plugin lifecycle only)
- [x] Move settings to appropriate module

## Phase 2: Core Implementation

### 2.1 Code Block Detection & Parsing
- [x] Implement MarkdownPostProcessor to detect ```infographic blocks
- [x] Extract content between fences (JSON/spec data)
- [x] Validate JSON syntax and provide error handling
- [x] Show error notice for malformed infographics
- [x] Store parsed specs for rendering

### 2.2 Infographic Rendering
- [x] Create `InfographicRenderer` class
- [x] Initialize AntV Infographic instance in container
- [x] Handle resize events and responsive rendering
- [x] Implement proper cleanup on document unload
- [x] Add error boundaries for failed renders
- [x] Support theme customization via settings

### 2.3 Source Code Conversion Feature
- [x] Add "Show Source" button on each rendered infographic
- [x] Create modal to display formatted source code
- [x] Implement "Copy to Clipboard" functionality
- [x] Add syntax highlighting for JSON display
- [x] Support toggling between rendered view and source view

### 2.4 Settings Panel
- [x] Rename settings to `InfographicSettings`
- [x] Add setting: enable/disable auto-render
- [x] Add setting: default theme (light/dark/custom)
- [x] Add setting: max width/height constraints
- [x] Add setting: show/hide source button
- [x] Add setting: error behavior (show code vs. hide block)

## Phase 3: UI/UX Enhancements

### 3.1 Enhanced Rendering
- [x] Add loading state while infographic initializes
- [ ] Implement smooth transitions between views
- [x] Add hover controls for the source button
- [ ] Support click-to-zoom functionality
- [ ] Add right-click context menu options

### 3.2 Modal Improvements
- [x] Create `SourceCodeModal` for viewing/editing
- [ ] Add "Edit" mode to modify and re-render
- [x] Implement "Export" functionality (PNG/SVG)
- [x] Add keyboard shortcuts (ESC to close, Ctrl+C to copy)

### 3.3 Error Handling
- [x] Show inline error messages in preview
- [ ] Provide "View Error Details" button
- [x] Log errors to console with helpful context
- [x] Fallback to displaying raw code block on failure

## Phase 4: Commands & Integration

### 4.1 Plugin Commands
- [ ] Add command: "Render all infographics in current note"
- [ ] Add command: "Open source code for current infographic"
- [ ] Add command: "Export infographic as image"
- [ ] Add command: "Toggle between rendered/source view"

### 4.2 Editor Integration
- [ ] Add syntax highlighting for ```infographic blocks
- [ ] Implement editor decorations for infographic blocks
- [ ] Support quick insert template for new infographics
- [ ] Add command palette integration

### 4.3 Workspace Events
- [ ] Handle file open/close events
- [ ] Re-render when note becomes active
- [ ] Clean up renderers when switching notes
- [ ] Support live preview and reading mode

## Phase 5: Testing & Quality Assurance

### 5.1 Local Testing
- [ ] Test with multiple Infographic specifications
- [ ] Verify cleanup on plugin disable
- [ ] Test error handling with invalid JSON
- [ ] Test resize behavior in different layouts
- [ ] Test dark/light mode transitions

### 5.2 Cross-Platform Testing
- [ ] Test on desktop (Windows/macOS/Linux)
- [ ] Test on mobile (iOS/Android)
- [ ] Verify `isDesktopOnly` setting is correct
- [ ] Test with large documents (performance)

### 5.3 Build Verification
- [ ] Run `npm run build` successfully
- [ ] Verify `main.js` size is reasonable
- [ ] Check for missing dependencies in bundle
- [ ] Test installation in fresh Obsidian vault

## Phase 6: Documentation & Release

### 6.1 README.md
- [ ] Update with plugin features and usage
- [ ] Document fence syntax: ```infographic ```
- [ ] Provide example Infographic specifications
- [ ] Document settings options
- [ ] Add screenshots/demos
- [ ] Include troubleshooting section

### 6.2 Release Preparation
- [ ] Bump version in `manifest.json` and `package.json`
- [ ] Update `versions.json` with min app version
- [ ] Run linting: `npm run lint`
- [ ] Run type checking: `npm run build`
- [ ] Test build artifacts locally

### 6.3 Community Integration
- [ ] Create GitHub release with version tag
- [ ] Upload `manifest.json`, `main.js`, `styles.css`
- [ ] Prepare pull request for Obsidian community plugins
- [ ] Add funding URL if applicable

## Technical Implementation Details

### File Structure
```
src/
├── main.ts                    # Plugin entry point, lifecycle
├── settings.ts                # Settings interface and tab
├── parser/
│   └── InfographicParser.ts  # Code block extraction/validation
├── renderer/
│   └── InfographicView.ts    # Rendering logic, DOM management
└── ui/
    ├── SourceModal.ts        # Source code display modal
    └── ExportModal.ts        # Export image functionality
```

### Key APIs to Use
- `MarkdownPostProcessor` for code block detection
- `MarkdownRenderer.render()` for inline rendering
- `this.registerDomEvent()` for cleanup
- `this.addCommand()` for commands
- `this.addSettingTab()` for configuration
- Modal classes for source code display

### AntV Infographic Integration
- Initialize from container element
- Pass spec/configuration object
- Handle resize with `chart.resize()`
- Clean up with `chart.destroy()`
- Support themes via configuration

## Example Usage

### Basic Infographic Block
```markdown
```infographic
{
  "type": "infographic",
  "data": {...},
  "config": {...}
}
```
```

### With Title
```markdown
```infographic title="My Chart"
{
  "type": "line",
  "data": [...],
  "config": {...}
}
```
```

## Success Criteria
- [ ] Infographic blocks render correctly in preview mode
- [ ] Source code button appears and works
- [ ] Settings panel provides useful options
- [ ] Plugin disables cleanly without leaks
- [ ] Error cases show helpful messages
- [ ] Build completes without warnings
- [ ] Documentation is clear and complete

## Timeline Estimate
- Phase 1: 2-4 hours (setup)
- Phase 2: 6-8 hours (core features)
- Phase 3: 4-6 hours (UI/UX)
- Phase 4: 2-4 hours (commands)
- Phase 5: 2-4 hours (testing)
- Phase 6: 2-4 hours (docs/release)

**Total Estimate: 18-30 hours**
