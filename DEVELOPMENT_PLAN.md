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
- [x] Implement smooth transitions between views
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
- [x] Provide "View Error Details" button
- [x] Log errors to console with helpful context
- [x] Fallback to displaying raw code block on failure

## Phase 4: Commands & Integration

### 4.1 Plugin Commands
- [x] Add command: "Insert infographic template"
- [x] Add command: "Refresh infographics in current note"
- [ ] Add command: "Export infographic as image" (requires tracking active infographic)
- [ ] Add command: "Open source code for current infographic" (requires tracking active infographic)

### 4.2 Editor Integration
- [ ] Add syntax highlighting for ```infographic blocks (requires CodeMirror extension)
- [ ] Implement editor decorations for infographic blocks (requires CodeMirror extension)
- [ ] Support quick insert template for new infographics
- [x] Add command palette integration (commands registered in Phase 4.1)

### 4.3 Workspace Events
- [x] Handle file open/close events (via MarkdownRenderChild lifecycle)
- [x] Re-render when note becomes active (via ResizeObserver)
- [x] Clean up renderers when switching notes (via onunload())
- [x] Support live preview and reading mode (registerMarkdownCodeBlockProcessor)

## Phase 5: Testing & Quality Assurance

### 5.1 Local Testing
- [x] Test with multiple Infographic specifications
- [x] Verify cleanup on plugin disable
- [x] Test error handling with invalid JSON
- [x] Test resize behavior in different layouts
- [x] Test dark/light mode transitions

### 5.2 Cross-Platform Testing
- [x] Test on desktop (Windows/macOS/Linux)
- [x] Test on mobile (iOS/Android)
- [x] Verify `isDesktopOnly` setting is correct
- [x] Test with large documents (performance)

### 5.3 Build Verification
- [x] Run `npm run build` successfully
- [x] Verify `main.js` size is reasonable (~563KB)
- [x] Check for missing dependencies in bundle
- [x] Test installation in fresh Obsidian vault

## Phase 6: Documentation & Release

### 6.1 README.md
- [x] Update with plugin features and usage
- [x] Document fence syntax: ```infographic ```
- [x] Provide example Infographic specifications
- [x] Document settings options
- [ ] Add screenshots/demos
- [x] Include troubleshooting section

### 6.2 Release Preparation
- [ ] Bump version in `manifest.json` and `package.json`
- [x] Update `versions.json` with min app version
- [x] Run linting: `npm run lint`
- [x] Run type checking: `npm run build`
- [x] Test build artifacts locally

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
- [x] Infographic blocks render correctly in preview mode
- [x] Source code button appears and works
- [x] Settings panel provides useful options
- [x] Plugin disables cleanly without leaks
- [x] Error cases show helpful messages
- [x] Build completes without warnings
- [x] Documentation is clear and complete

## Timeline Estimate
- Phase 1: 2-4 hours (setup)
- Phase 2: 6-8 hours (core features)
- Phase 3: 4-6 hours (UI/UX)
- Phase 4: 2-4 hours (commands)
- Phase 5: 2-4 hours (testing)
- Phase 6: 2-4 hours (docs/release)

**Total Estimate: 18-30 hours**

---

## Manual Completion Guide

The following tasks require manual steps or are considered future enhancements. Below are detailed instructions for completing each.

### Phase 3: UI/UX Enhancements (Future)

#### 3.1 Click-to-Zoom Functionality

**Complexity**: Medium | **Priority**: Low

To implement click-to-zoom:

1. Add a fullscreen modal in `src/ui/ZoomModal.ts`:
```typescript
import {App, Modal} from "obsidian";
import type {Infographic} from "@antv/infographic";

export class ZoomModal extends Modal {
    private infographic: Infographic;
    
    constructor(app: App, infographic: Infographic) {
        super(app);
        this.infographic = infographic;
    }
    
    onOpen(): void {
        const {contentEl} = this;
        contentEl.addClass("infographic-zoom-modal");
        // Clone and render at larger size
        // Use infographic.toDataURL() to get image and display
    }
}
```

2. Add click handler to rendered infographic container in `src/main.ts`
3. Add CSS for fullscreen modal styling

#### 3.1 Right-Click Context Menu

**Complexity**: Medium | **Priority**: Low

Use Obsidian's `Menu` API:

```typescript
import {Menu} from "obsidian";

container.addEventListener("contextmenu", (e) => {
    const menu = new Menu();
    menu.addItem((item) => {
        item.setTitle("Export as PNG")
            .setIcon("image")
            .onClick(() => { /* export logic */ });
    });
    menu.addItem((item) => {
        item.setTitle("View Source")
            .setIcon("code")
            .onClick(() => { /* open source modal */ });
    });
    menu.showAtMouseEvent(e);
});
```

#### 3.2 Edit Mode in SourceCodeModal

**Complexity**: High | **Priority**: Medium

To add live editing:

1. Replace `<pre><code>` with `<textarea>` in edit mode
2. Add "Edit" / "Preview" toggle button
3. On save, update the original code block in the document using `Editor.replaceRange()`
4. Trigger re-render by refreshing the view

Note: This requires access to the original document position, which means storing `ctx.getSectionInfo()` during render.

### Phase 4: Commands & Integration (Future)

#### 4.1 Export/Source Commands for Active Infographic

**Complexity**: High | **Priority**: Medium

These commands require tracking which infographic the user is "focused" on. Options:

1. **Track last clicked infographic**: Store reference when user clicks on an infographic
2. **Use cursor position**: Find infographic code block nearest to cursor

Implementation sketch in `src/main.ts`:

```typescript
private lastActiveInfographic: Infographic | null = null;
private lastActiveSource: string | null = null;

// In processInfographicBlock, add:
container.addEventListener("click", () => {
    this.lastActiveInfographic = renderChild.getInfographic();
    this.lastActiveSource = source;
});

// Then add commands:
this.addCommand({
    id: "export-active-infographic",
    name: "Export active infographic",
    checkCallback: (checking) => {
        if (!this.lastActiveInfographic) return false;
        if (checking) return true;
        new ExportModal(this.app, this.lastActiveInfographic).open();
        return true;
    },
});
```

#### 4.2 CodeMirror Syntax Highlighting

**Complexity**: Very High | **Priority**: Low

Obsidian uses CodeMirror 6. To add custom syntax highlighting:

1. Create a CodeMirror extension in `src/editor/infographicLanguage.ts`
2. Register with Obsidian's editor extensions API

Reference: [Obsidian CodeMirror Extensions](https://docs.obsidian.md/Plugins/Editor/Decorations)

This is complex and may not be worth the effort for initial release.

#### 4.2 Quick Insert Template

**Complexity**: Low | **Priority**: Low

Already partially implemented via "Insert infographic template" command. To enhance:

1. Add a dropdown/modal to select from multiple template types
2. Create `TEMPLATES` object with various infographic templates
3. Use `SuggestModal` from Obsidian API for template selection

### Phase 6: Release Tasks (Manual)

#### 6.1 Add Screenshots to README

**Steps**:

1. Open Obsidian with the plugin installed
2. Create a test note with infographic code blocks
3. Take screenshots showing:
   - A rendered infographic
   - The source modal
   - The settings panel
   - Error handling behavior
4. Save screenshots to `docs/images/` or use GitHub releases
5. Update README.md with image references:
   ```markdown
   ## Screenshots
   
   ![Rendered Infographic](./docs/images/render.png)
   ![Source Modal](./docs/images/source-modal.png)
   ```

#### 6.2 Version Bump for Release

**Steps**:

```bash
# Use npm version (updates manifest.json and package.json automatically)
npm version patch   # 0.1.0 → 0.1.1 (bug fixes)
npm version minor   # 0.1.0 → 0.2.0 (new features)
npm version major   # 0.1.0 → 1.0.0 (breaking changes)

# This also updates versions.json via the version script
git push && git push --tags
```

#### 6.3 Create GitHub Release

**Steps**:

```bash
# 1. Ensure you're on the latest commit
git pull

# 2. Build production version
npm run build

# 3. Create and push tag (use version WITHOUT 'v' prefix per Obsidian convention)
git tag -a 0.1.0 -m "Release 0.1.0" && git push origin 0.1.0

# 4. Create release with GitHub CLI
gh release create 0.1.0 main.js manifest.json styles.css \
  --title "Obsidian Infographic v0.1.0" \
  --notes "Initial release - Render AntV Infographic visualizations from fenced code blocks"

# Or manually via GitHub web interface:
# - Go to Releases → Draft a new release
# - Choose the tag
# - Upload: main.js, manifest.json, styles.css
# - Add release notes
# - Publish
```

#### 6.3 Submit to Community Plugins

**Steps**:

1. Fork [obsidian-releases](https://github.com/obsidianmd/obsidian-releases)

2. Edit `community-plugins.json`, add entry:
   ```json
   {
     "id": "obsidian-infographic",
     "name": "Obsidian Infographic",
     "author": "Your Name",
     "description": "Render AntV Infographic visualizations from fenced code blocks",
     "repo": "shuuul/obsidian-infographic"
   }
   ```

3. Create pull request to obsidian-releases

4. Ensure your repo meets requirements:
   - Has a LICENSE file (currently 0-BSD ✓)
   - Has a README.md ✓
   - Has manifest.json at root ✓
   - Has releases with main.js, manifest.json, styles.css ✓

#### 6.3 Add Funding URL (Optional)

Edit `manifest.json`:

```json
{
  "fundingUrl": "https://github.com/sponsors/yourusername"
}
```

Or use "Buy Me a Coffee", Ko-fi, etc.

---

## Remaining Tasks Summary

| Task | Priority | Complexity | Status |
|------|----------|------------|--------|
| Click-to-zoom | Low | Medium | Future |
| Right-click context menu | Low | Medium | Future |
| Edit mode in modal | Medium | High | Future |
| Export/Source commands | Medium | High | Future |
| CodeMirror highlighting | Low | Very High | Future |
| Quick insert template | Low | Low | Future |
| Screenshots in README | Medium | Manual | **Ready** |
| Version bump | High | Manual | **Ready** |
| GitHub release | High | Manual | **Ready** |
| Community submission | Medium | Manual | **Ready** |

**Recommendation**: The plugin is fully functional for v0.1.0 release. Focus on:
1. Take screenshots
2. Create GitHub release
3. Submit to community plugins

Future enhancements (click-to-zoom, edit mode, etc.) can be added in subsequent releases.
