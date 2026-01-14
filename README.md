# Obsidian Infographic

An Obsidian plugin that renders [AntV Infographic](https://github.com/antvis/Infographic) visualizations from fenced code blocks.

## Features

- Render infographics directly in your notes using `infographic` code blocks
- View and copy source code with a single click
- Supports multiple predefined templates
- Works in both editing and reading modes

## Usage

Create an infographic by adding a fenced code block with the `infographic` language identifier:

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

## License

0-BSD
