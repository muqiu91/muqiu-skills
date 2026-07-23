---
name: code-review
description: >-
  Perform thorough code review. Use when user asks for
  code review, review PR, check code quality, or find bugs.
targets: [cursor, claude-code, gemini]
---

## 目标

对代码进行全面审查，发现潜在问题并提出改进建议。

## 审查维度

1. **正确性** - 逻辑是否正确，边界条件是否处理
2. **安全性** - 是否存在注入、泄露等安全隐患
3. **性能** - 是否有不必要的计算、内存泄漏、N+1 查询等
4. **可读性** - 命名是否清晰，结构是否合理
5. **可维护性** - 是否遵循 DRY、SOLID 等原则
6. **测试** - 关键路径是否有测试覆盖

## 输出格式

按严重程度分类输出：
- **Critical** - 必须修复的问题
- **Warning** - 建议修复的问题
- **Suggestion** - 可选的改进建议

每条反馈包含：文件位置、问题描述、修改建议。
