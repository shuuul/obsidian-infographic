# Obsidian Infographic

An Obsidian plugin that renders [AntV Infographic](https://github.com/antvis/Infographic) visualizations from fenced code blocks.

## Features

- Render infographics directly in your notes using `infographic` code blocks
- Supports both JSON configuration and AntV's declarative syntax
- View and copy source code with a single click
- ~200 built-in templates from AntV Infographic
- Responsive rendering with automatic resize handling
- Theme support (auto/light/dark)
- Works in both editing and reading modes

## Usage

Create an infographic by adding a fenced code block with the `infographic` language identifier.

### JSON Format

````markdown
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
````

### AntV Infographic Syntax

You can also use AntV's declarative syntax directly:

````markdown
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
````

### More Examples

#### Timeline

````markdown
```infographic
{
  "template": "sequence-stairs",
  "data": {
    "title": "Project Timeline",
    "items": [
      { "label": "Q1", "desc": "Planning" },
      { "label": "Q2", "desc": "Development" },
      { "label": "Q3", "desc": "Testing" },
      { "label": "Q4", "desc": "Launch" }
    ]
  }
}
```
````

#### Hierarchy

````markdown
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
````

## Settings

Access settings via **Settings** → **Community plugins** → **Obsidian Infographic**.

| Setting | Description | Default |
|---------|-------------|---------|
| **Auto render** | Automatically render infographic blocks in preview mode | `true` |
| **Show source button** | Display a button to view the source code | `true` |
| **Theme** | Color theme: Auto (follows Obsidian), Light, or Dark | `auto` |
| **Error behavior** | What to show on error: source code, error message, or hide | `show-code` |
| **Max width** | Maximum width for rendered infographics (px) | `800` |
| **Max height** | Maximum height for rendered infographics (px) | `600` |

## Templates

This plugin uses AntV Infographic which includes ~200 built-in templates. Some popular ones:

- `list-row-simple-horizontal-arrow` - Horizontal arrow list
- `list-zigzag` - Zigzag list layout
- `sequence-stairs` - Staircase timeline
- `hierarchy-structure` - Organization chart
- `word-cloud` - Word cloud visualization

For a complete list, visit the [AntV Infographic Gallery](https://infographic.antv.vision/gallery).

## Installation

### From Obsidian Community Plugins

1. Open **Settings** → **Community plugins**
2. Search for "Obsidian Infographic"
3. Select **Install**, then **Enable**

### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release
2. Create a folder `obsidian-infographic` in your vault's `.obsidian/plugins/` directory
3. Copy the downloaded files into the folder
4. Reload Obsidian and enable the plugin in **Settings** → **Community plugins**

## Development

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

## Troubleshooting

### Infographic not rendering

1. Check that your JSON is valid (use a JSON validator)
2. Ensure the `data` field contains an `items` array
3. Verify the template name exists

### Blank or small infographic

- Try adjusting the `maxWidth` and `maxHeight` settings
- Or specify `width` and `height` directly in your JSON config

### Theme issues

- Set the theme to "Auto" to follow Obsidian's theme
- Or force "Light" or "Dark" in settings

## License

0-BSD
