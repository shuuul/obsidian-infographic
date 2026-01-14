---
name: obsidian-infographics
description: |
  Create AntV Infographic visualizations in Obsidian using fenced `infographic` code blocks.
  Use when the user wants to render process flows, timelines, hierarchies, charts, or comparison matrices
  within Obsidian markdown documents.

  Supports JSON and DSL syntax formats.
metadata:
  author: obsidian-infographic
  version: "0.1.0"
---

# Infographics

Render AntV Infographic visualizations in Obsidian markdown using fenced code blocks.

## Basic Usage

```infographic
{
  "template": "list-row-simple-horizontal-arrow",
  "data": {
    "items": [
      { "label": "Step 1", "desc": "Start here" },
      { "label": "Step 2", "desc": "Continue" },
      { "label": "Step 3", "desc": "Complete" }
    ]
  }
}
```

## Syntax Options

### JSON Format

```json
{
  "template": "list-row-simple-horizontal-arrow",
  "theme": { "colorPrimary": "#FF356A" },
  "data": {
    "title": "My Infographic",
    "items": [
      { "label": "Item 1", "desc": "Description" }
    ]
  }
}
```

### DSL Format

```infographic
infographic list-row-simple-horizontal-arrow
theme
  colorPrimary #FF356A
data
  title My Infographic
  items
    - label Item 1
      desc Description
```

## Common Templates

| Template | Description |
|----------|-------------|
| `list-row-simple-horizontal-arrow` | Horizontal steps with arrows |
| `list-row-simple-horizontal` | Simple horizontal list |
| `list-grid` | Grid card layout |
| `list-pyramid` | Pyramid hierarchy |
| `sequence-horizontal` | Horizontal process |
| `sequence-timeline` | Timeline layout |
| `sequence-roadmap` | Milestone roadmap |
| `hierarchy-tree` | Tree structure |
| `compare-binary` | Pros/cons comparison |
| `chart-bar` | Bar chart |
| `chart-pie` | Pie chart |
| `quadrant-simple` | 4-quadrant matrix |

See [gallery examples](reference/GALLERY.md) for complete template catalog with code.

## Data Fields

```json
{
  "data": {
    "title": "Title text",
    "desc": "Description",
    "items": [
      {
        "label": "Item label",
        "desc": "Item description",
        "value": 100,
        "icon": "ref:search:keywords",
        "children": []
      }
    ]
  }
}
```

## Icon Resources

Use AntV icon search service:

```json
{
  "data": {
    "items": [
      { "icon": "ref:search:computer network", "label": "Network" }
    ]
  }
}
```

## Toolbar

Each rendered infographic shows a toolbar with:
- **Copy**: Copy source code to clipboard
- **Export**: Save as SVG or PNG

## Examples

### Timeline

```infographic
{
  "template": "sequence-timeline",
  "data": {
    "items": [
      { "label": "2023", "desc": "Launch" },
      { "label": "2024", "desc": "Grow" },
      { "label": "2025", "desc": "Scale" }
    ]
  }
}
```

### Hierarchy

```infographic
{
  "template": "hierarchy-tree",
  "data": {
    "items": [
      {
        "label": "Root",
        "children": [
          { "label": "Child 1" },
          { "label": "Child 2" }
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
