---
name: obsidian-infographic
description: |
  Create AntV Infographic visualizations in Obsidian using fenced `infographic` code blocks.
  Use when the user wants to render process flows, timelines, hierarchies, charts, or comparison matrices
  within Obsidian markdown documents.

  Supports JSON and DSL syntax formats.
metadata:
  author: shuuul
  version: "0.1.0"
---

# Infographics

Render AntV Infographic visualizations in Obsidian markdown using fenced code blocks.

## Quick Start

```infographic
infographic list-row-simple-horizontal-arrow
data
  title My Infographic
  desc A brief description
  items
    - label Step 1
      desc Start here
    - label Step 2
      desc Continue
    - label Step 3
      desc Complete
theme
  palette antv
```

## Syntax Format

### DSL Format (Recommended)

```
infographic <template-name>
data
  title Title
  desc Description
  items
    - label Item 1
      desc Description
      value 100
      icon mdi/rocket-launch
theme
  palette antv
```

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

## Reference Documents

| Document | Description |
|----------|-------------|
| [infographcs-creator.md](reference/infographcs-creator.md) | Complete syntax spec, templates, and examples |
| [prompt.md](reference/prompt.md) | AntV Infographic syntax generation rules |
| [item-prompt.md](reference/item-prompt.md) | Item component design guidelines |
| [structure-prompt.md](reference/structure-prompt.md) | Structure component design guidelines |

## Template Selection Guide

| Category | Templates | Use For |
|----------|-----------|---------|
| **Sequences** | `sequence-*` | Processes, steps, timelines |
| **Lists** | `list-row-*`, `list-column-*`, `list-grid-*` | Bullet points, viewpoints |
| **Comparison** | `compare-binary-*`, `compare-swot` | Pros/cons, SWOT |
| **Hierarchy** | `hierarchy-tree-*`, `hierarchy-structure` | Trees, org charts |
| **Charts** | `chart-*` | Data visualization |
| **Quadrant** | `quadrant-*` | Matrix analysis |
| **Relations** | `relation-*` | Relationships |

## Common Templates

| Template | Description |
|----------|-------------|
| `list-row-simple-horizontal-arrow` | Horizontal steps with arrows |
| `list-row-horizontal-icon-arrow` | Steps with icons and arrows |
| `sequence-timeline-rounded-rect-node` | Timeline layout |
| `sequence-roadmap-vertical-simple` | Vertical roadmap |
| `hierarchy-structure` | Organization chart |
| `compare-binary-horizontal-badge-card-arrow` | Pros/cons comparison |
| `compare-swot` | SWOT analysis |
| `chart-bar-plain-text` | Bar chart |
| `chart-pie-donut-plain-text` | Donut chart |

## Data Structure

```typescript
interface Data {
  title?: string;
  desc?: string;
  items: ItemDatum[];
  relations?: RelationDatum[];
}

interface ItemDatum {
  id?: string;
  label?: string;
  desc?: string;
  value?: number;
  icon?: string;
  illus?: string;
  children?: ItemDatum[];
}

interface RelationDatum {
  from: string;
  to: string;
  label?: string;
  direction?: 'forward' | 'both' | 'none';
}
```

## Icons and Illustrations

### Icons (Iconify)

- Format: `<collection>/<icon-name>`, e.g., `mdi/rocket-launch`
- Collections: `mdi/*`, `fa/*`, `bi/*`, `heroicons/*`
- Browse: https://icon-sets.iconify.design/

### Illustrations (unDraw)

- Format: filename without `.svg`, e.g., `coding`
- Browse: https://undraw.co/illustrations

## Theme Customization

```infographic
infographic list-row-simple-horizontal-arrow
theme light
  palette
    - #61DDAA
    - #F6BD16
    - #F08BB4
data
  items
    - label Step 1
      desc Start
    - label Step 2
      desc Progress
    - label Step 3
      desc Complete
```

### Theme Options

- `light`, `dark`, `hand-drawn`
- Stylization: `rough`, `pattern`, `linear-gradient`, `radial-gradient`
- Font: `theme.base.text.font-family`

## Toolbar

Each rendered infographic shows a toolbar with:
- **Copy**: Copy source code to clipboard
- **Export**: Save as SVG or PNG

## Examples

### Timeline

```infographic
infographic sequence-timeline-rounded-rect-node
data
  title Internet Technology Evolution
  desc From Web 1.0 to AI era
  items
    - time 1991
      label Web 1.0
      desc First website published
      icon mdi/web
    - time 2004
      label Web 2.0
      desc Social media emerges
      icon mdi/account-multiple
    - time 2023
      label AI Era
      desc Generative AI revolution
      icon mdi/brain
theme
  palette antv
```

### Hierarchy

```infographic
infographic hierarchy-structure
data
  title Company Structure
  items
    - label CEO
      children
        - label CTO
        - label CFO
        - label COO
theme
  palette antv
```

### Comparison

```infographic
infographic compare-binary-horizontal-badge-card-arrow
data
  title Decision Matrix
  items
    - label Option A
      children
        - label Strength 1
        - label Strength 2
    - label Option B
      children
        - label Weakness 1
        - label Weakness 2
theme
  palette antv
```

### Chart

```infographic
infographic chart-bar-plain-text
data
  title Annual Revenue Growth
  items
    - label 2021
      value 120
      icon lucide/sprout
    - label 2022
      value 150
      icon lucide/zap
    - label 2023
      value 190
      icon lucide/brain-circuit
    - label 2024
      value 240
      icon lucide/trophy
theme
  palette antv
```
