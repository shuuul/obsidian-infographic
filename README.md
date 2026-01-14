<h1 align="center">📊 Obsidian Infographic Plugin</h1>

<p align="center">
  <img src="https://img.shields.io/github/downloads/shuuul/obsidian-infographic/total" alt="GitHub Downloads">
  <img src="https://img.shields.io/github/license/shuuul/obsidian-infographic" alt="License">
  <img src="https://img.shields.io/github/v/release/shuuul/obsidian-infographic" alt="GitHub release">
  <img src="https://img.shields.io/github/last-commit/shuuul/obsidian-infographic" alt="GitHub last commit">
</p>

Render [AntV Infographic](https://github.com/antvis/Infographic) visualizations directly in your Obsidian notes using fenced code blocks. ✨

## ✨ Features

- 🎨 **200+ Built-in Templates** - Process flows, timelines, hierarchies, charts, and more
- 📝 **Dual Syntax Support** - Use JSON configuration or AntV's declarative DSL
- 🖼️ **Export Options** - Save infographics as SVG or PNG
- 🌓 **Theme Support** - Auto-detect or force light/dark mode
- 📐 **Responsive Design** - Automatic resize handling
- 🔄 **Live Reload** - Refresh all infographics with a single command

## 📦 Installation

### 🧪 Install via BRAT (Beta)

For beta/development versions, install using [BRAT](https://github.com/TfTHacker/obsidian42-brat):

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) from Community Plugins
2. Go to **Settings** → **BRAT** → **Add Beta Plugin**
3. Enter the repository URL:
   ```
   https://github.com/shuuul/obsidian-infographic
   ```
4. BRAT will download and keep the plugin updated
5. Enable **Obsidian Infographic** from Community Plugins

### From Obsidian Community Plugins

1. Open **Settings** → **Community plugins**
2. Search for "Obsidian Infographic"
3. Select **Install**, then **Enable**

### Manual Installation

1. Download the latest release from [GitHub Releases](https://github.com/shuuul/obsidian-infographic/releases):
   - `main.js`
   - `manifest.json`
   - `styles.css`
2. Create folder: `Vault/.obsidian/plugins/obsidian-infographic/`
3. Place the downloaded files in the folder
4. Reload Obsidian and enable the plugin

## 🚀 Usage

Create an infographic using a fenced code block with the `infographic` language:

### JSON Format

```infographic
{
  "template": "list-row-simple-horizontal-arrow",
  "data": {
    "items": [
      { "label": "Step 1", "desc": "Start" },
      { "label": "Step 2", "desc": "In Progress" },
      { "label": "Step 3", "desc": "Complete" }
    ]
  }
}
```

### DSL Format

```infographic
infographic list-row-simple-horizontal-arrow
data
  items
    - label Step 1
      desc Start
    - label Step 2
      desc In Progress
    - label Step 3
      desc Complete
```

## 📋 Template Examples

### Timeline

```infographic
{
  "template": "sequence-timeline",
  "data": {
    "items": [
      { "label": "Q1", "desc": "Planning" },
      { "label": "Q2", "desc": "Development" },
      { "label": "Q3", "desc": "Testing" },
      { "label": "Q4", "desc": "Launch" }
    ]
  }
}
```

### Hierarchy

```infographic
{
  "template": "hierarchy-structure",
  "data": {
    "items": [
      {
        "label": "CEO",
        "children": [
          { "label": "CTO" },
          { "label": "CFO" },
          { "label": "COO" }
        ]
      }
    ]
  }
}
```

### Comparison

```infographic
{
  "template": "compare-binary",
  "data": {
    "items": [
      { "label": "Option A", "desc": "Benefits" },
      { "label": "Option B", "desc": "Trade-offs" }
    ]
  }
}
```

### Chart

```infographic
{
  "template": "chart-bar",
  "data": {
    "items": [
      { "label": "A", "value": 30 },
      { "label": "B", "value": 50 },
      { "label": "C", "value": 40 }
    ]
  }
}
```

### With Icons

```infographic
{
  "template": "list-row-simple-horizontal-arrow",
  "data": {
    "items": [
      { "icon": "ref:search:computer network", "label": "Network", "desc": "Connect" },
      { "icon": "ref:search:cloud", "label": "Cloud", "desc": "Store" },
      { "icon": "ref:search:security", "label": "Security", "desc": "Protect" }
    ]
  }
}
```

## ⚙️ Configuration

Access settings via **Settings** → **Community plugins** → **Obsidian Infographic**.

| Setting | Description | Default |
|---------|-------------|---------|
| **Auto render** | Automatically render in preview mode | `true` |
| **Theme** | Auto / Light / Dark | `auto` |
| **Error behavior** | show-code / show-error / hide | `show-code` |
| **Max width** | Maximum width (px) | `800` |
| **Max height** | Maximum height (px) | `600` |

### Toolbar Actions

Each rendered infographic shows a toolbar:
- **Copy** - Copy source code to clipboard
- **Export** - Save as SVG or PNG

## 🛠️ Development

```bash
# Install dependencies
npm install

# Development build (watch mode)
npm run dev

# Production build
npm run build

# Lint
npm run lint
```

## 📄 License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.