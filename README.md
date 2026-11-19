# ryan-skills

Useful AI skills

## Codex 全局规则

[`rules/AGENTS.md`](rules/AGENTS.md) 保存了一份可重复使用的 Codex 全局规则，用于统一沟通方式、修改边界、安全约束和验证要求。

在仓库根目录运行以下命令即可应用：

```bash
mkdir -p ~/.codex
cp ./rules/AGENTS.md ~/.codex/AGENTS.md
```

该命令会覆盖已有的全局 `AGENTS.md`，如有自定义内容请先备份或合并。新建 Codex 任务后规则生效；项目特有的约定仍应放在对应仓库的 `AGENTS.md` 中。

## 绘制图解

[`skills/draw-diagram`](skills/draw-diagram/SKILL.md) 将文字、代码或材料绘制为架构图、流程图或知识图解，首版支持浅色工程蓝图 `blueprint` 和粉笔黑板 `chalkboard`。

默认先生成可编辑、离线可用的 HTML，展示预览并等待确认，再导出 2 倍分辨率 PNG。PNG 导出需要 Node.js 22.4+ 与本机 Chrome/Chromium/Edge，无额外 npm 包依赖。

使用示例：

> 用 draw-diagram 把缓存读取流程画成 chalkboard 风格，先给我 HTML 预览，确认后再导出 PNG。

## 管理 Skills 的方式

### 一、Skills 只装在项目里，不装全局

Agent 的 Skills 可以装在全局（所有项目共享），也可以装在项目内（只有当前项目能用）。我选择只装在项目内，最主要的原因是节约上下文空间。

Agent 在工作时有一个上下文窗口，你可以把它想象成 Claude 的工作台——台面大小是有限的。虽然 Skill 默认只会加载名称、描述等摘要信息，不会把完整内容全部摊开，但积少成多：全局装了几十个 Skill，光是这些摘要加在一起也会占掉不少工作台空间。而且一旦 Claude 判断某个 Skill 与当前任务相关，就会把它的完整内容加载进来。全局 Skill 越多，被误触发的概率也越大，可能白白浪费空间。

只在项目内安装真正需要的 Skills，工作台上就只摆当前用得到的资料，把宝贵的空间留给更重要的内容，Claude 干活也会更高效。

### 二、用软链接来安装 Skills

这是这套管理方式的核心。先解释一下什么是软链接。

你可以把软链接理解成 Windows 的快捷方式：文件本体只有一份，但你可以在很多地方创建快捷方式指向它。修改本体后，所有快捷方式指向的内容都会同步变化。

具体做法分三步。

#### 第一步：把开源 Skills 项目下载到统一目录

我在电脑上有一个专门存放 GitHub 项目的文件夹 `~/GitHub`，所有下载的开源项目都放在这里，例如：

```text
~/GitHub/ryan-skills    ← 存放各种 Skills 的开源项目
~/GitHub/AITools       ← 另一个开源项目
```

这个文件夹就像一个仓库，所有 Skills 的原件都保存在这里。

#### 第二步：在自己的项目中创建软链接

假设我有一个写作项目 `~/GitHub/ryan-writing`，里面需要用到好几个 Skills。我不会把 Skills 复制进去，而是创建软链接，让项目指向仓库里的原件：

| 项目内的路径 | 实际指向的位置（原件） |
| --- | --- |
| `.agents/skills/ryan-comic` | `~/GitHub/ryan-skills/skills/ryan-comic` |

#### 第三步：给 Claude Code 建一个入口

最后再创建一个软链接，让 Claude Code 能找到这些 Skills：

```text
.claude/skills  →  .agents/skills
```

这样 Claude Code 就能顺着这条链找到所有需要的 Skills 了。

### 三、不用记命令，让 Agent 帮你干

看到这里你可能会想：软链接的命令记不住怎么办？

完全不用记。直接用自然语言告诉 Codex 或 Claude Code 你要做什么就行，例如：

> 帮我把 `~/GitHub/ryan-skills/skills/ryan-comic` 软链接到 `.agents/skills/ryan-comic`

甚至可以更简单：

> 帮我把 ryan-skills 项目里的 ryan-comic 这个 Skill 链接到当前项目

Agent 会自动帮你创建软链接，后续的维护、添加和删除也都可以交给它。你只需要说清楚要把哪个 Skill 链到哪里，剩下的工作让 Agent 完成即可。

### 四、为什么值得这么折腾？

初次设置确实比直接复制粘贴多花几分钟，但后续维护会非常省心，主要有两个好处：

1. **更新只需一次。** 因为所有项目都是通过软链接指向同一份原件，所以当开源项目有更新时，只需要在 `~/GitHub/ryan-skills` 拉取最新代码，所有用到这个 Skill 的项目就会自动更新到最新版本。
2. **修复可以直接反哺开源项目。** 比如在写作项目里使用漫画 Skill 时发现了一个问题，可以直接让 Agent 修复。因为使用的是软链接，Agent 修改的其实是仓库里的原件（`~/GitHub/ryan-skills/skills/ryan-comic`），之后可以直接把修复提交到开源项目，相当于顺手为开源社区做了贡献。
