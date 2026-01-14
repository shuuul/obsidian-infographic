<h1 align="center">📊 Obsidian 信息图表插件</h1>

<p align="center">
  <a href="README_CN.md">简体中文</a> ·
  <a href="README.md">English</a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/downloads/shuuul/obsidian-infographic/total" alt="GitHub 下载量">
  <img src="https://img.shields.io/github/license/shuuul/obsidian-infographic" alt="许可证">
  <img src="https://img.shields.io/github/v/release/shuuul/obsidian-infographic" alt="GitHub 版本">
  <img src="https://img.shields.io/github/last-commit/shuuul/obsidian-infographic" alt="GitHub 最后提交">
</p>

在 Obsidian 笔记中直接渲染 [AntV Infographic](https://github.com/antvis/Infographic) 可视化图表，使用 fenced 代码块。✨

## ✨ 功能特性

- 🎨 **200+ 内置模板** - 流程图、时间线、层次结构、图表等
- 📝 **双语法支持** - 使用 JSON 配置或 AntV 声明式 DSL
- 🖼️ **导出选项** - 保存为 SVG 或 PNG
- 🌓 **主题支持** - 自动检测或强制亮/暗色模式
- 📐 **响应式设计** - 自动调整大小
- 🔄 **实时刷新** - 单个命令刷新所有信息图表

## 📦 安装

### 🧪 通过 BRAT 安装（测试版）

使用 [BRAT](https://github.com/TfTHacker/obsidian42-brat) 安装测试版/开发版：

1. 从社区插件安装 [BRAT](https://github.com/TfTHacker/obsidian42-brat)
2. 进入 **设置** → **BRAT** → **添加测试插件**
3. 输入仓库 URL：
   ```
   https://github.com/shuuul/obsidian-infographic
   ```
4. BRAT 将下载并保持插件更新
5. 从社区插件中启用 **Infographic**

### 从 Obsidian 社区插件安装

1. 打开 **设置** → **社区插件**
2. 搜索 "Obsidian Infographic"
3. 选择 **安装**，然后 **启用**

### 手动安装

1. 从 [GitHub Releases](https://github.com/shuuul/obsidian-infographic/releases) 下载最新版本：
   - `main.js`
   - `manifest.json`
   - `styles.css`
2. 创建文件夹：`Vault/.obsidian/plugins/obsidian-infographic/`
3. 将下载的文件放入文件夹
4. 重新加载 Obsidian 并启用插件

## 🚀 使用方法

使用 `infographic` 语言创建信息图表：

### JSON 格式

```infographic
{
  "template": "list-row-simple-horizontal-arrow",
  "data": {
    "items": [
      { "label": "步骤 1", "desc": "开始" },
      { "label": "步骤 2", "desc": "进行中" },
      { "label": "步骤 3", "desc": "完成" }
    ]
  }
}
```

### DSL 格式

```infographic
infographic list-row-simple-horizontal-arrow
data
  items
    - label 步骤 1
      desc 开始
    - label 步骤 2
      desc 进行中
    - label 步骤 3
      desc 完成
```

## 📋 模板示例

### 时间线

```infographic
{
  "template": "sequence-timeline",
  "data": {
    "items": [
      { "label": "Q1", "desc": "规划" },
      { "label": "Q2", "desc": "开发" },
      { "label": "Q3", "desc": "测试" },
      { "label": "Q4", "desc": "发布" }
    ]
  }
}
```

### 层次结构

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

### 对比

```infographic
{
  "template": "compare-binary",
  "data": {
    "items": [
      { "label": "选项 A", "desc": "优势" },
      { "label": "选项 B", "desc": "权衡" }
    ]
  }
}
```

### 图表

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

### 带图标

```infographic
{
  "template": "list-row-simple-horizontal-arrow",
  "data": {
    "items": [
      { "icon": "ref:search:computer network", "label": "网络", "desc": "连接" },
      { "icon": "ref:search:cloud", "label": "云", "desc": "存储" },
      { "icon": "ref:search:security", "label": "安全", "desc": "保护" }
    ]
  }
}
```

## ⚙️ 配置

通过 **设置** → **社区插件** → **Infographic** 访问设置。

| 设置 | 描述 | 默认值 |
|---------|-------------|---------|
| **自动渲染** | 在预览模式中自动渲染 | `true` |
| **主题** | 自动 / 亮色 / 暗色 | `auto` |
| **错误行为** | show-code / show-error / hide | `show-code` |
| **最大宽度** | 最大宽度 (px) | `800` |
| **最大高度** | 最大高度 (px) | `600` |

### 工具栏操作

每个渲染的信息图表显示一个工具栏：
- **复制** - 将源代码复制到剪贴板
- **导出** - 保存为 SVG 或 PNG

## 🤖 Agent 技能

此插件也可作为 **Agent 技能**使用，用于在 Obsidian 中创建 AntV 信息图表可视化。

### 技能位置

```
skills/obsidian-infographics/
├── SKILL.md              # 技能定义和使用指南
└── reference/
    └── GALLERY.md        # 完整模板目录和示例
```

### 在 Agent 中的使用

作为技能使用时，AI Agent 可以通过在 Obsidian markdown 中输出 `infographic` 代码块来生成 AntV 信息图表可视化：

```infographic
{
  "template": "list-row-simple-horizontal-arrow",
  "data": {
    "items": [
      { "label": "步骤 1", "desc": "开始" },
      { "label": "步骤 2", "desc": "进行中" },
      { "label": "步骤 3", "desc": "完成" }
    ]
  }
}
```

### 可用模板（200+）

| 类别 | 模板 |
|----------|-----------|
| **列表** | list-row-simple-horizontal-arrow, list-row-simple-horizontal, list-column, list-grid, list-pyramid |
| **序列** | sequence-horizontal, sequence-timeline, sequence-roadmap, sequence-steps |
| **对比** | compare-binary, compare-swot |
| **层次结构** | hierarchy-tree, hierarchy-structure |
| **图表** | chart-bar, chart-column, chart-line, chart-pie |
| **象限** | quadrant-simple, quadrant-quarter |
| **关系** | relation-circle, relation-dagre |

查看[模板画廊](skills/obsidian-infographics/reference/GALLERY.md)获取完整示例。

## 🛠️ 开发

```bash
# 安装依赖
npm install

# 开发构建（监听模式）
npm run dev

# 生产构建
npm run build

# 代码检查
npm run lint
```

## 📄 许可证

根据 Apache License 2.0 授权。详情请参阅 [LICENSE](LICENSE)。

---

[English](README.md) | 简体中文
