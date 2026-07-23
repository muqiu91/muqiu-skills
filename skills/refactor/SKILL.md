---
name: refactor
description: >-
  Refactor code for better quality. Use when user asks to
  refactor, clean up, improve code structure, or reduce duplication.
targets: [cursor, claude-code, gemini]
---

## 目标

重构代码以提升质量，同时保持功能不变。

## 步骤

1. 分析当前代码结构，识别坏味道（code smells）
2. 列出重构计划，说明每步的目的
3. 逐步执行重构，每步保证可验证
4. 确保重构后功能完全等价

## 常见重构手法

- 提取函数/方法 - 过长函数拆分
- 提取变量 - 复杂表达式命名
- 内联临时变量 - 消除无意义中间变量
- 移动函数 - 职责归位
- 以多态取代条件表达式
- 引入参数对象 - 过多参数聚合

## 约束

- 不改变外部可观测行为
- 重构前确认有测试覆盖，或先补充测试
- 每次提交只做一种重构
