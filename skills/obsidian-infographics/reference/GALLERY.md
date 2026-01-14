# Gallery Examples

Common AntV Infographic template examples for use in Obsidian.

## List Templates

### list-row-simple-horizontal-arrow
Horizontal list with arrows connecting items.

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

### list-row-simple-horizontal
Simple horizontal list.

```infographic
{
  "template": "list-row-simple-horizontal",
  "data": {
    "items": [
      { "label": "Item 1", "desc": "Description" },
      { "label": "Item 2", "desc": "Description" },
      { "label": "Item 3", "desc": "Description" }
    ]
  }
}
```

### list-column
Vertical column layout.

```infographic
{
  "template": "list-column",
  "data": {
    "items": [
      { "label": "Feature A" },
      { "label": "Feature B" },
      { "label": "Feature C" }
    ]
  }
}
```

### list-grid
Grid layout for multiple items.

```infographic
{
  "template": "list-grid",
  "data": {
    "items": [
      { "label": "Card 1", "desc": "Content" },
      { "label": "Card 2", "desc": "Content" },
      { "label": "Card 3", "desc": "Content" },
      { "label": "Card 4", "desc": "Content" }
    ]
  }
}
```

### list-pyramid
Pyramid hierarchical layout.

```infographic
{
  "template": "list-pyramid",
  "data": {
    "items": [
      { "label": "Level 1" },
      { "label": "Level 2" },
      { "label": "Level 3" }
    ]
  }
}
```

## Sequence Templates

### sequence-horizontal
Horizontal process flow.

```infographic
{
  "template": "sequence-horizontal",
  "data": {
    "items": [
      { "label": "Phase 1" },
      { "label": "Phase 2" },
      { "label": "Phase 3" },
      { "label": "Phase 4" }
    ]
  }
}
```

### sequence-timeline
Timeline layout.

```infographic
{
  "template": "sequence-timeline",
  "data": {
    "items": [
      { "label": "2020", "desc": "Started" },
      { "label": "2021", "desc": "Growth" },
      { "label": "2022", "desc": "Scale" },
      { "label": "2023", "desc": "Mature" }
    ]
  }
}
```

### sequence-roadmap
Roadmap with milestones.

```infographic
{
  "template": "sequence-roadmap",
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

### sequence-steps
Step-by-step process.

```infographic
{
  "template": "sequence-steps",
  "data": {
    "items": [
      { "label": "1. Research" },
      { "label": "2. Design" },
      { "label": "3. Implement" },
      { "label": "4. Review" }
    ]
  }
}
```

## Comparison Templates

### compare-binary
Binary comparison (pros/cons).

```infographic
{
  "template": "compare-binary",
  "data": {
    "title": "Decision Matrix",
    "items": [
      { "label": "Option A", "desc": "Pros" },
      { "label": "Option B", "desc": "Cons" }
    ]
  }
}
```

### compare-swot
SWOT analysis.

```infographic
{
  "template": "compare-swot",
  "data": {
    "items": [
      { "label": "Strengths" },
      { "label": "Weaknesses" },
      { "label": "Opportunities" },
      { "label": "Threats" }
    ]
  }
}
```

## Hierarchy Templates

### hierarchy-tree
Tree structure visualization.

```infographic
{
  "template": "hierarchy-tree",
  "data": {
    "items": [
      {
        "label": "Root",
        "children": [
          { "label": "Child 1" },
          {
            "label": "Child 2",
            "children": [
              { "label": "Grandchild 1" },
              { "label": "Grandchild 2" }
            ]
          },
          { "label": "Child 3" }
        ]
      }
    ]
  }
}
```

### hierarchy-structure
Organization chart structure.

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

## Chart Templates

### chart-bar
Bar chart visualization.

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

### chart-column
Column chart visualization.

```infographic
{
  "template": "chart-column",
  "data": {
    "items": [
      { "label": "Jan", "value": 100 },
      { "label": "Feb", "value": 150 },
      { "label": "Mar", "value": 120 }
    ]
  }
}
```

### chart-line
Line chart visualization.

```infographic
{
  "template": "chart-line",
  "data": {
    "items": [
      { "label": "Q1", "value": 10 },
      { "label": "Q2", "value": 25 },
      { "label": "Q3", "value": 40 },
      { "label": "Q4", "value": 55 }
    ]
  }
}
```

### chart-pie
Pie chart visualization.

```infographic
{
  "template": "chart-pie",
  "data": {
    "items": [
      { "label": "A", "value": 35 },
      { "label": "B", "value": 25 },
      { "label": "C", "value": 40 }
    ]
  }
}
```

## Quadrant Templates

### quadrant-simple
Simple 4-quadrant grid.

```infographic
{
  "template": "quadrant-simple",
  "data": {
    "items": [
      { "label": "High Impact" },
      { "label": "Low Impact" },
      { "label": "Quick Wins" },
      { "label": "Long Term" }
    ]
  }
}
```

### quadrant-quarter
Four-quarter layout.

```infographic
{
  "template": "quadrant-quarter",
  "data": {
    "title": "Matrix",
    "items": [
      { "label": "Q1", "desc": "Important" },
      { "label": "Q2", "desc": "Urgent" },
      { "label": "Q3", "desc": "Both" },
      { "label": "Q4", "desc": "Neither" }
    ]
  }
}
```

## Relation Templates

### relation-circle
Circular relationship.

```infographic
{
  "template": "relation-circle",
  "data": {
    "items": [
      { "label": "Item 1" },
      { "label": "Item 2" },
      { "label": "Item 3" },
      { "label": "Item 4" }
    ]
  }
}
```

### relation-dagre
Dagre hierarchical relation.

```infographic
{
  "template": "relation-dagre",
  "data": {
    "items": [
      {
        "label": "A",
        "children": [
          { "label": "B" },
          { "label": "C" }
        ]
      }
    ]
  }
}
```

## With Customization

### With Theme

```infographic
{
  "template": "list-row-simple-horizontal-arrow",
  "theme": {
    "colorPrimary": "#FF356A",
    "colorBg": "#FFFFFF",
    "palette": "antv"
  },
  "data": {
    "items": [
      { "label": "Step 1", "desc": "Start" },
      { "label": "Step 2", "desc": "Middle" },
      { "label": "Step 3", "desc": "End" }
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
      {
        "icon": "ref:search:computer network",
        "label": "Network",
        "desc": "Connect"
      },
      {
        "icon": "ref:search:cloud",
        "label": "Cloud",
        "desc": "Store"
      },
      {
        "icon": "ref:search:security",
        "label": "Security",
        "desc": "Protect"
      }
    ]
  }
}
```

### With Hierarchical Data

```infographic
{
  "template": "hierarchy-tree",
  "data": {
    "items": [
      {
        "label": "Project",
        "children": [
          {
            "label": "Phase 1",
            "children": [
              { "label": "Task A" },
              { "label": "Task B" }
            ]
          },
          {
            "label": "Phase 2",
            "children": [
              { "label": "Task C" },
              { "label": "Task D" }
            ]
          }
        ]
      }
    ]
  }
}
```
