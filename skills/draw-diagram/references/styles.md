# 两种绘图风格

只读取当前要使用的风格；风格决定视觉语言，内容关系决定布局。

## blueprint：浅色工程蓝图

适用于系统架构、数据流、模块关系、工程原理和精确流程。采用浅色工程纸，不将它默认解释为深蓝背景。

| 角色 | 建议值 |
| --- | --- |
| 纸张 | `#FAF8F5` |
| 主文字 | `#24364B` |
| 次文字 | `#51647A` |
| 主线与强调 | `#2563EB` |
| 辅助线 | `#93A9C3` |
| 节点填充 | `#EDF3FC` |
| 警示 | `#A75512` |

- 使用低对比度细网格、对齐的几何形体、统一线宽和直角折线。必要时加入尺寸线、剖面或分区标记，装饰须帮助解释。
- 中文选清晰无衬线字体，技术编号和接口名可用等宽字体。
- 以蓝色建立主次，用虚线区分可选、异步或边界关系，并给出含义；不要只靠颜色区分语义。
- 留出充足空白。只在表达对象性质时使用立体投影，避免发光、玻璃和厚重阴影。

## chalkboard：课堂粉笔黑板

适用于教学、原理讲解、学习笔记和逐步推导。

| 角色 | 建议值 |
| --- | --- |
| 黑板 | `#1C2B25` |
| 粉笔白 | `#F2F0DF` |
| 次文字 | `#C4D0C3` |
| 主强调 | `#FFE08A` |
| 蓝粉笔 | `#96CBE8` |
| 粉粉笔 | `#F3ACB5` |
| 节点填充 | `#24372F` |

- 用深绿黑板、轻微擦痕和带颗粒感的轮廓建立风格。线条可有轻微不规则，用手画箭头、圈注和下划线辅助讲解。
- 手写字体仅在本机可用且中文覆盖完整时使用。正文优先清晰的中文字体，不伪造手写效果牺牲阅读。
- SVG 的轻量颗粒或位移滤镜只作用于图形笔画；正文、公式和箭头标签不加模糊或位移。
- 强调色通常不超过三种。用标注、编号和线型补充颜色；保留一块“板书结论”区域时让它服务于主题。
- 黑板风格须有笔画或圈注特征；仅把蓝图背景改成绿色不算完成。

## 设计参考

借鉴 [baoyu-skills](https://github.com/JimLiu/baoyu-skills) 在布局与视觉风格分离、离线 SVG 图层、浅纸蓝图和课堂粉笔上的设计思路。本 Skill 的流程、模板和导出器独立编写。

- [blueprint 规范，固定版本](https://github.com/JimLiu/baoyu-skills/blob/ca703c2d7c2c4399a1dc0cf82224f8551e05a96d/skills/baoyu-article-illustrator/references/styles/blueprint.md)
- [chalkboard 规范，固定版本](https://github.com/JimLiu/baoyu-skills/blob/ca703c2d7c2c4399a1dc0cf82224f8551e05a96d/skills/baoyu-article-illustrator/references/styles/chalkboard.md)
- [图层与布局参考，固定版本](https://github.com/JimLiu/baoyu-skills/blob/ca703c2d7c2c4399a1dc0cf82224f8551e05a96d/skills/baoyu-diagram/SKILL.md)
