---
name: install-mattpocock-skills
description: "为 Codex 添加 mattpocock/skills marketplace 并安装 mattpocock-skills 插件。适用于用户要求安装或补装 Matt Pocock 的 Codex Skills 插件；分析仓库、介绍用法或编写安装 Skill 时不执行安装。"
---

# 安装 Matt Pocock Skills

在当前机器的 Codex CLI 配置中注册指定 marketplace，并安装对应插件。用户明确要求安装或直接调用本安装 Skill 后执行；不重复询问已经授权的安装操作。

## 检查现有状态

1. 确认 `codex` 可用，查看 `codex plugin --help` 和 `codex plugin marketplace --help`。缺少 CLI 或相关子命令时，说明阻塞原因；不自行安装或升级 Codex。
2. 使用以下只读命令检查 marketplace 和插件：

   ```bash
   codex plugin marketplace list
   codex plugin list --json
   ```

3. 识别 `mattpocock` marketplace，以及 `installed` 列表中 `name` 为 `mattpocock-skills`、`marketplaceName` 为 `mattpocock` 的插件。只摘要报告目标条目。
4. 已完成的步骤直接跳过。同名 marketplace 的来源若不是 `mattpocock/skills`（或其等价 GitHub URL），保留配置并报告冲突；不覆盖或删除已有来源。状态无法确认时先解决查询错误，不把查询失败当成尚未安装。

## 按顺序安装

marketplace 尚未注册时执行：

```bash
codex plugin marketplace add mattpocock/skills
```

确认注册成功后，插件尚未安装时执行：

```bash
codex plugin add mattpocock-skills@mattpocock
```

两条命令有先后依赖，逐条检查退出状态和输出。任一步失败即停止依赖它的后续步骤，报告失败位置和原因；不自动卸载重装或反复重试。遇到网络或配置目录写权限限制，按当前环境的权限流程处理，不以手工修改配置或更换安装方式绕过。

## 验证与交付

再次运行 `codex plugin marketplace list` 和 `codex plugin list --json`，确认 marketplace 可发现，且目标插件出现在 `installed` 列表中。不能仅凭安装命令退出成功就宣称已验证。

简洁报告：marketplace 是新增还是复用，插件是新安装还是已存在，查询返回的版本、安装路径和启用状态（字段存在时），以及剩余问题。已安装但被禁用时明确说明，保留原启用设置。

安装只更新 Codex CLI 管理的配置与缓存，不将其描述为仅对当前项目生效。完成后可提示用户在目标项目调用 `setup-matt-pocock-skills` 进行项目初始化；本 Skill 不自动运行该初始化，也不修改项目的 `AGENTS.md`、创建 Issue、提交或推送代码。

## 依据

- [上游仓库的安装说明](https://github.com/mattpocock/skills#installation-30-second-setup)
- [OpenAI 官方插件命令说明](https://learn.chatgpt.com/docs/developer-commands#codex-plugin)
- [OpenAI 官方 marketplace 管理说明](https://developers.openai.com/plugins/build/plugins#add-a-marketplace-from-the-cli)
