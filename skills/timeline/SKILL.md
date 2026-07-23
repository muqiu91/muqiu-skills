---
name: timeline
description: >-
  水平时间轴图表生成工具。根据用户提供的时间节点和事项，生成专业的水平时间轴 HTML 图表，
  支持转换为 PNG。适用于项目规划、路线图、里程碑展示、版本发布计划等场景。
  当用户需要创建时间轴、路线图、规划图、里程碑图时使用此技能。
targets: [cursor, claude-code, gemini]
---

# 水平时间轴生成技能

## 概述

根据用户提供的时间节点和事项数据，生成专业的水平时间轴 HTML 图表。支持转换为 PNG 图片。

## 工作流程

### 1. 理解用户数据

从用户输入中提取：
- **标题**：时间轴整体标题
- **时间范围**：起止时间区间
- **节点数据**：每个时间点对应的事项列表
- **持续性事项**：跨越多个时间段的长期任务（用横跨条展示）

### 2. 设计时间轴

#### 布局结构

```
[标题]
[持续性事项横跨条]
────●──────────●──────────●──────────●──── (时间轴主线)
  月份A       月份B       月份C       月份D
  ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐
  │事项1│    │事项1│    │事项1│    │事项1│
  │事项2│    │事项2│    │事项2│    │事项2│
  └─────┘    └─────┘    └─────┘    └─────┘
```

#### 视觉规范

- **时间轴主线**：水平线 + 圆形节点标记
- **时间标签**：节点下方，显示月份/日期
- **事项卡片**：节点下方的圆角矩形卡片，包含事项列表
- **持续性事项**：时间轴上方的横跨渐变条

#### 配色方案（专业蓝色系）

参考 `references/design_guidelines.md`：

- 主色：#2563EB（蓝色）- 时间轴线、节点
- 辅助色：#3B82F6（浅蓝）- 卡片背景
- 强调色：#10B981（绿色）- 高亮/完成状态
- 渐变色：#EFF6FF → #DBEAFE - 卡片填充
- 文字色：#1F2937（深灰）- 正文
- 次要文字：#6B7280（中灰）- 标签
- 背景色：#FFFFFF

### 3. 生成 HTML

使用 HTML + SVG 生成时间轴图表：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>时间轴标题</title>
    <style>
        :root {
            --primary: #2563EB;
            --primary-light: #3B82F6;
            --accent: #10B981;
            --text: #1F2937;
            --text-secondary: #6B7280;
            --bg: #FFFFFF;
            --card-bg: #EFF6FF;
            --card-border: #BFDBFE;
        }
        body {
            margin: 0;
            padding: 40px;
            font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
            background: var(--bg);
        }
    </style>
</head>
<body>
    <svg width="..." height="..." viewBox="...">
        <!-- 时间轴内容 -->
    </svg>
</body>
</html>
```

**关键要点**：
- 使用 SVG 矢量绘制，确保缩放清晰
- 时间轴等间距排列各节点
- 卡片高度根据事项数量自适应
- 圆角矩形 rx=8，添加阴影效果
- 持续性事项用半透明渐变条横跨对应时间段

### 4. SVG 绘制要素

#### 时间轴主线
```svg
<line x1="100" y1="200" x2="1100" y2="200"
      stroke="#2563EB" stroke-width="3" />
```

#### 节点标记
```svg
<circle cx="200" cy="200" r="8" fill="#2563EB" stroke="#fff" stroke-width="3" />
```

#### 事项卡片
```svg
<rect x="150" y="230" width="180" height="auto" rx="8"
      fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1.5" />
<text x="170" y="255" font-size="13" fill="#1F2937">• 事项内容</text>
```

#### 持续性事项横跨条
```svg
<rect x="100" y="140" width="1000" height="30" rx="15"
      fill="url(#spanGradient)" opacity="0.9" />
<text x="600" y="160" text-anchor="middle" fill="#fff">持续性事项标题</text>
```

### 5. 转换为 PNG（可选）

使用共享的 html_to_png.py 脚本：

```bash
python3 scripts/html_to_png.py timeline.html output.png --fit --scale 2
```

## 设计准则

### 间距规则
- 节点间距：根据总宽度和节点数量等分
- 卡片与时间轴间距：30px
- 卡片内事项行间距：22px
- 卡片内边距：15px

### 字体大小
- 标题：24px, font-weight: 700
- 时间标签：15px, font-weight: 600
- 事项文字：13px, font-weight: 400
- 持续性事项标签：13px, font-weight: 600

### 自适应宽度
- 默认画布宽度：1200px
- 节点数 ≤ 4 时：间距放大
- 节点数 ≥ 8 时：压缩间距或换行
- 最小节点间距：120px

## 示例场景

### 场景 1：项目规划时间轴

用户提供各月份的任务安排，生成水平时间轴展示项目规划。

### 场景 2：版本发布路线图

展示产品各版本的发布计划和核心功能。

### 场景 3：里程碑展示

展示项目关键里程碑节点及完成状态。

## 资源文件

### scripts/
- `html_to_png.py`：HTML 转 PNG 转换脚本（与 architecture-diagram 共用）

### references/
- `design_guidelines.md`：设计指南和配色方案
