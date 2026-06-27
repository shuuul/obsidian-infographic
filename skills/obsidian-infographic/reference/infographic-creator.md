# Infographic Creator

Create AntV Infographic visualizations from text content.

`Infographic = Information Structure + Visual Expression`

This skill uses [AntV Infographic](https://infographic.antv.vision/) to create visual infographics.

## AntV Infographic Syntax

AntV Infographic Syntax is a mermaid-like DSL for describing infographic rendering configuration. It uses indentation to describe information, has strong robustness, and makes it easy to render infographics through AI streaming output.

### Syntax Components

1. **template**: Use template to express text information structure
2. **data**: The infographic data containing title, desc, and the primary data field matching the template
3. **theme**: Theme contains palette, font, and other styling options

### Syntax Rules

- First line: `infographic <template-name>`
- Use blocks to describe data/theme with two-space indentation
- Key-value pairs: `"key value"`
- Arrays: `-` items
- Icon value: direct icon name (e.g., `mdi/chart-line`) or semantic keywords (e.g., `rocket launch`)
- `data` can include: `relations`, `illus`, `attributes`
- Mermaid-style `A -> B` supported for relation graphs
- `data` should contain only **one** primary data field that matches the template

### Primary Data Field Selection

Use the data field that matches the template category. Only fall back to `items` when the structure is ambiguous.

| Template | Primary data field | Notes |
|----------|-------------------|-------|
| `list-*` | `lists` | Array of items with `label`, `desc`, `value`, `icon`, `children` |
| `sequence-*` (non-interaction) | `sequences` | Steps with `label`, `desc`, `icon`, optional `order asc\|desc` |
| `sequence-interaction-*` | `sequences` + `relations` | Swim-lanes; each lane has `label` + `children` nodes; use `relations` between node `id`s |
| `compare-binary-*` / `compare-hierarchy-left-right-*` | `compares` | Exactly two root nodes, each with `children` |
| `compare-swot` | `compares` | Multiple root nodes with optional `children` |
| `compare-quadrant-*` | `compares` | Exactly four quadrant root nodes |
| `hierarchy-structure` | `items` | Top-to-bottom hierarchy, up to 3 levels |
| `hierarchy-tree-*` / `hierarchy-mindmap-*` | `root` | Single root with recursive `children` |
| `relation-*` | `nodes` + `relations` | Nodes with `id`/`label`; relations via `from -> to` or `relations` array |
| `chart-*` | `values` | Data points with `label` and `value` |

### Data Field Examples

**List templates** (`list-*`):
```plain
infographic list-row-horizontal-icon-arrow
data
  title Feature List
  lists
    - label Fast
      icon mdi/flash
    - label Secure
      icon mdi/shield-check
```

**Sequence templates** (`sequence-*`):
```plain
infographic sequence-ascending-steps
data
  title Release Process
  sequences
    - label Requirement
      icon mdi/clipboard-check
    - label Development
      icon mdi/code-tags
    - label Release
      icon mdi/rocket
  order asc
```

**Interaction templates** (`sequence-interaction-*`):
```plain
infographic sequence-interaction-default-badge-card
data
  title Login Flow
  sequences
    - label User
      icon mdi/account
      children
        - label Initiate Login
          id user-login
          step 0
          icon mdi/login
        - label Receive Result
          id user-result
          step 2
          icon mdi/inbox-check
    - label Server
      icon mdi/server
      children
        - label Verify Credentials
          id server-verify
          step 1
          icon mdi/shield-check
        - label Return Result
          id server-return
          step 2
          icon mdi/send
  relations
    user-login - submit credentials -> server-verify
    server-verify - generate result -> server-return
    server-return - return result -> user-result
```

**Comparison templates** (`compare-binary-*`):
```plain
infographic compare-binary-horizontal-simple-fold
data
  title Price Comparison
  compares
    - label Original Price
      icon mdi/tag
      children
        - label Original
          value 500
          icon mdi/tag
    - label Actual Payment
      icon mdi/wallet
      children
        - label Actual
          value 450
          icon mdi/check-bold
```

**SWOT template** (`compare-swot`):
```plain
infographic compare-swot
data
  title Product SWOT
  compares
    - label Strengths
      icon mdi/trophy
      children
        - label High brand awareness
          icon mdi/star
    - label Weaknesses
      icon mdi/alert-circle
      children
        - label High cost pressure
          icon mdi/wallet
```

**Quadrant templates** (`compare-quadrant-*`):
```plain
infographic compare-quadrant-quarter-simple-card
data
  title Task Priority
  compares
    - label High Value Low Cost
    - label High Value High Cost
    - label Low Value Low Cost
    - label Low Value High Cost
```

**Hierarchy templates** (`hierarchy-tree-*` / `hierarchy-mindmap-*`):
```plain
infographic hierarchy-tree-curved-line-rounded-rect-node
data
  title Org Chart
  root
    label Company
    children
      - label Product
      - label Engineering
      - label Operations
```

**Chart templates** (`chart-*`):
```plain
infographic chart-line-plain-text
data
  title Model Accuracy
  desc Week 4 saw the biggest improvement
  values
    - label Week1
      value 86.5
    - label Week2
      value 87.3
    - label Week3
      value 89.1
    - label Week4
      value 91.2
```

### Comparison Templates

For templates starting with `compare-binary-*`, construct exactly two root nodes and place comparison items as children.

### Hierarchy Templates

For `hierarchy-structure`, `data.items` renders top-to-bottom (first item at top), supports up to 3 levels (root → group → item).

## Theme Customization

```plain
infographic list-row-simple-horizontal-arrow
theme dark
  palette
    - #61DDAA
    - #F6BD16
    - #F08BB4
data
  items
    - label Step 1
      desc Start
    - label Step 2
      desc In Progress
    - label Step 3
      desc Complete
```

### Theme Options

- **Themes**: `light`, `dark`, `hand-drawn`
- **Stylization**: `rough`, `pattern`, `linear-gradient`, `radial-gradient`
- **Font**: `theme.base.text.font-family` (e.g., `851tegakizatsu`)

## TypeScript Definitions

```ts
interface Data {
  title?: string;
  desc?: string;
  items: ItemDatum[];
  relations?: RelationDatum[];
  illus?: Record<string, string | ResourceConfig>;
  attributes?: Record<string, object>;
  [key: string]: any;
}

interface BaseDatum {
  id?: string;
  icon?: string | ResourceConfig;
  label?: string;
  desc?: string;
  value?: number;
  attributes?: Record<string, object>;
  [key: string]: any;
}

interface ItemDatum extends BaseDatum {
  illus?: string | ResourceConfig;
  children?: ItemDatum[];
  group?: string;
  [key: string]: any;
}

interface RelationDatum extends BaseDatum {
  from: string;
  to: string;
  label?: string;
  direction?: 'forward' | 'both' | 'none';
  showArrow?: boolean;
  arrowType?: 'arrow' | 'triangle' | 'diamond';
  [key: string]: any;
}
```

## Icon and Illustration Resources

### Icons (from Iconify)

- Format: `<collection>/<icon-name>`, e.g., `mdi/rocket-launch`
- Popular collections:
  - `mdi/*` - Material Design Icons
  - `fa/*` - Font Awesome
  - `bi/*` - Bootstrap Icons
  - `heroicons/*` - Heroicons
- Browse at: https://icon-sets.iconify.design/

### Illustrations (from unDraw)

- Format: illustration filename (without .svg), e.g., `coding`
- Browse at: https://undraw.co/illustrations

### Usage Tips

- For `sequence-*` and `list-*` templates → use `icon`
- For larger illustration needs → use `illus`
- Not all templates support both icon and illus

## Available Templates

### Sequences
- sequence-zigzag-steps-underline-text
- sequence-horizontal-zigzag-underline-text
- sequence-horizontal-zigzag-simple-illus
- sequence-circular-simple
- sequence-filter-mesh-simple
- sequence-mountain-underline-text
- sequence-cylinders-3d-simple
- sequence-color-snake-steps-horizontal-icon-line
- sequence-pyramid-simple
- sequence-funnel-simple
- sequence-roadmap-vertical-simple
- sequence-roadmap-vertical-plain-text
- sequence-zigzag-pucks-3d-simple
- sequence-ascending-steps
- sequence-ascending-stairs-3d-underline-text
- sequence-snake-steps-compact-card
- sequence-snake-steps-underline-text
- sequence-snake-steps-simple
- sequence-stairs-front-compact-card
- sequence-stairs-front-pill-badge
- sequence-timeline-simple
- sequence-timeline-rounded-rect-node
- sequence-timeline-simple-illus
- sequence-interaction-default-badge-card
- sequence-interaction-default-animated-badge-card
- sequence-interaction-default-compact-card
- sequence-interaction-default-capsule-item
- sequence-interaction-default-rounded-rect-node

### Comparison
- compare-binary-horizontal-simple-fold
- compare-hierarchy-left-right-circle-node-pill-badge
- compare-swot
- compare-binary-horizontal-badge-card-arrow
- compare-binary-horizontal-underline-text-vs
- compare-quadrant-quarter-simple-card
- compare-quadrant-quarter-circular

### Quadrant
- quadrant-quarter-simple-card
- quadrant-quarter-circular
- quadrant-simple-illus

### Relations
- relation-circle-icon-badge
- relation-circle-circular-progress
- relation-dagre-flow-tb-simple-circle-node
- relation-dagre-flow-tb-animated-simple-circle-node
- relation-dagre-flow-tb-badge-card
- relation-dagre-flow-tb-animated-badge-card
- relation-network-simple-circle-node

### Hierarchy
- hierarchy-tree-tech-style-capsule-item
- hierarchy-tree-curved-line-rounded-rect-node
- hierarchy-tree-tech-style-badge-card
- hierarchy-structure
- hierarchy-mindmap-branch-gradient-capsule-item
- hierarchy-mindmap-level-gradient-compact-card

### Charts
- chart-column-simple
- chart-bar-plain-text
- chart-line-plain-text
- chart-pie-plain-text
- chart-pie-compact-card
- chart-pie-donut-plain-text
- chart-pie-donut-pill-badge
- chart-wordcloud

### Lists
- list-grid-badge-card
- list-grid-candy-card-lite
- list-grid-ribbon-card
- list-row-horizontal-icon-arrow
- list-row-simple-illus
- list-sector-plain-text
- list-column-done-list
- list-column-vertical-icon-arrow
- list-column-simple-vertical-arrow
- list-waterfall-badge-card
- list-waterfall-compact-card
- list-zigzag-down-compact-card
- list-zigzag-down-simple
- list-zigzag-up-compact-card
- list-zigzag-up-simple

## Template Selection Guidelines

| Category | Templates | Use For |
|----------|-----------|---------|
| **Sequences** | `sequence-*` | Processes, steps, development trends |
| **Timelines** | `sequence-timeline-*` | Timeline layouts |
| **Staircases** | `sequence-stairs-*` | Staircase diagrams |
| **Roadmaps** | `sequence-roadmap-vertical-*` | Milestone roadmaps |
| **Zigzags** | `sequence-zigzag-*` | Zigzag steps |
| **Pyramids** | `sequence-pyramid-simple` | Pyramid diagrams |
| **Lists** | `list-row-*`, `list-column-*`, `list-grid-*`, `list-waterfall-*` | Viewpoints, bullet points, masonry |
| **Comparison** | `compare-binary-*`, `compare-quadrant-*` | Pros/cons analysis, matrix |
| **SWOT** | `compare-swot` | SWOT analysis |
| **Hierarchy** | `hierarchy-tree-*`, `hierarchy-structure`, `hierarchy-mindmap-*` | Tree diagrams, org charts, mind maps |
| **Charts** | `chart-*` | Data visualization |
| **Quadrant** | `quadrant-*` | Matrix analysis |
| **Relations** | `relation-*`, `relation-dagre-*`, `relation-network-*` | Relationship display, flow charts, networks |
| **Interactions** | `sequence-interaction-*` | Multi-role/system interaction |
| **Word Cloud** | `chart-wordcloud` | Word clouds |

## Examples

### Example 1: Timeline

```plain
infographic sequence-timeline-rounded-rect-node
data
  title Internet Technology Evolution
  desc From Web 1.0 to AI era, key milestones
  items
    - time 1991
      label Web 1.0
      desc Tim Berners-Lee published the first website
      icon mdi/web
    - time 2004
      label Web 2.0
      desc Social media and user-generated content
      icon mdi/account-multiple
    - time 2023
      label AI Large Model
      desc ChatGPT ignites the generative AI revolution
      icon mdi/brain
theme
  palette antv
```

### Example 2: With Illustrations

```plain
infographic sequence-horizontal-zigzag-simple-illus
data
  title Product Development Phases
  desc Key stages in our development process
  items
    - label Research
      desc Understanding user needs
      illus user-research
    - label Design
      desc Creating user experience
      illus design-thinking
    - label Development
      desc Building the product
      illus coding
    - label Launch
      desc Going to market
      illus launch-day
theme
  palette antv
```

### Example 3: Hierarchy

```plain
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

## Creation Process

### Step 1: Understanding User Requirements

1. Extract key information structure (title, description, items)
2. Identify required data fields (labels, values, icons, etc.)
3. Select an appropriate template
4. Use AntV Infographic Syntax to describe the content

**CRITICAL**: Respect the language of user's input content. If input is in Chinese, output syntax must be in Chinese.

### Step 2: Output the Infographic

Output the syntax in a `plain` code block. The user's system will handle rendering.

```plain
infographic <template-name>
data
  title Title
  desc Description
  items
    - label Item 1
      value 12.5
      desc Explanation
      icon mdi/rocket-launch
theme
  palette antv
```
