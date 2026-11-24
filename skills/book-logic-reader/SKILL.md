---
name: book-logic-reader
description: Analyze, screen, and deeply read books using the 5-level reading model (L1-L5) and the 4-part book logic framework (B-A difference, A-to-B path with necessary vs. sufficient condition check, author's Constant C setting, and Set B expansion), with anti-hallucination checks, chapter ROI navigation, critical boundary testing, and actionable triggers. Use whenever the user asks to quickly evaluate if a book is worth reading, extract a book's core viewpoints or logic, screen a book before deep reading, or do a structured deep-dive into a book's architecture and underlying principles.
---

# Book Logic Reader

A structured reading and book-screening workflow that helps users quickly judge whether a book is worth deep reading (Stage 1: L3 Logic Scan) and, if worthwhile, systematically unpack its full architecture, failure boundaries, and actionable takeaways (Stage 2: L4-L5 Deep Dive).

## When to Use

- The user gives a book title, table of contents, or book text and wants to quickly see if it is worth reading deeply.
- The user wants to extract a book's core viewpoints, underlying logic, or author's central thesis without getting lost in scattered quotes.
- The user wants to turn a worthwhile book into structured, connected knowledge (L3-L5) with clear reading priorities and practical triggers.

## Core Framework

Books are information carriers with five reading levels: L1 Perception (vague impression), L2 Summary (scattered quotes, cases, definitions), L3 Logic (core thread connecting points), L4 Structure (interwoven complete map), and L5 Principles (hidden black boxes behind the logic). Building a reusable knowledge network starts at L3.

Every book's L3 logic is built from four components (most books lean heavily on 1-2 of them rather than all 4):

1. **B-A 差异 (Point A vs. Point B)**: Where the reader starts (A) and where the author wants to take them (B), framed as binary opposition (二元对立) or tiered levels (层级划分).
2. **A 到 B 的路径 (Path from A to B)**: Explicit steps/flows or a directional principle, filtered by necessary conditions (必要条件) vs. sufficient conditions / non-essential details (充分条件 / 非必要细节).
3. **常量 C / 核心设定 (Author's Setting / Constant C)**: The invariant rule, assumption, or lens driving the whole book:
   - **行为常量**: A stable action/rule applied repeatedly by the actor across situations (e.g. applying a Margin of Safety).
   - **起点常量**: A root underlying driver or human nature starting point (e.g. desire and fear).
   - **条件常量**: An external boundary condition or premise that governs the system (e.g. resource scarcity, Mr. Market's emotional swings).
   - **场景设定**: Core world-building or conflict premise (for fiction).
4. **B 点集合的展开 (Expansion of Set B)**: 列表式 (parallel list), 线路图式 (simple-to-complex route), or 层级结构式 (layered tree, the only type truly suited for mind maps).

## Cross-Agent Style & Fidelity Rules (CRITICAL)

To ensure consistent, high-clarity output across different AI models and agents:

- **Faithful Concept Extraction in Stage 1**: When defining Point A, Point B, and Constant C, **preserve the author's own core concepts and abstractions**. Explain what the author means clearly, but do NOT rewrite or narrow them into custom "verifiable behavioral tests" or invent hypothetical numerical examples in Stage 1. Save behavioral triggers for Stage 2.
- **Strict Logic on Necessary vs. Sufficient Conditions**:
  - **必要条件 (Necessary)**: Missing any one of these breaks the path from A to B.
  - **充分条件 / 非必要细节 (Sufficient / Non-essential)**: Helpful tips, era-specific metrics, or "useful nonsense" that are nice to have or context-dependent, but removing them does not break the core A-to-B logic. Do not confuse "insufficient on its own" with "sufficient condition."
- **Clean Scannable Format**: In Stage 1, use clean Markdown headings and structured bullet points. Avoid cramming Constant C into dense Markdown tables in Stage 1; reserve tables for the Stage 2 chapter navigation map.

## Information Boundary (Anti-Hallucination Guardrail)

Before starting Stage 1 or Stage 2, check how well you actually know the book's full text:

- If the book is niche, newly published, or you only have a title/table of contents without reliable knowledge of the full text, **state this upfront** (e.g. "以下仅基于现有目录/片段推断，未覆盖原文细节") and invite the user to paste the table of contents, preface, or core chapters.
- Never fabricate chapter numbers, specific quotes, or a fake Constant C just to fill the template.

## Workflow

Default to **Stage 1 (快速鉴书与逻辑扫描)** first so the user can decide in 2-3 minutes whether to invest time, unless the user explicitly asks for a full deep dive right away.

### Stage 1: 快速鉴书与逻辑扫描 (L3 Quick Screen)

1. **定位书籍重心**: Briefly state what type of book this is and which of the 4 logic components it primarily leans on (e.g. proving a Constant C vs. giving an A-to-B method vs. touring Set B). Keep it tight and scannable, letting the book's complexity dictate the length.

2. **拆解核心逻辑四要素**:

   - **起点 A 与终点 B (B-A 差异)**: Faithfully extract the author's own concepts for A and B, and note whether the contrast is binary (二元对立) or tiered (层级划分). Flag immediately if the author fails to clearly define B.
   - **核心设定 (常量 C)**: Extract the author's invariant rule or core premise, accurately tagging each as 行为常量 / 起点常量 / 条件常量 / 场景设定. Spend the most analytical effort here, because grasping C unlocks the entire book.
   - **A 到 B 的路径与含金量检验**: Summarize the path (steps or direction), then separate **必要条件** (true core requirements) from **充分条件 / 非必要细节** (optional tips or era-specific details that can be skipped).
   - **B 点集合的展开方式**: Identify whether the book expands B as 列表式, 线路图式, or 层级结构式, and explicitly state whether it is suited for a mind map.

3. **阅读决策与省流指南**:

   - **结论**：Give a candid verdict: **建议精读** / **选择性精读（或略读跳读）** / **建议放弃**, followed by a concise, high-signal rationale tailored to the user's goal.
   - **最高性价比读法**：Specify concrete reading priorities (e.g. which core chapters capture most of the value, and which sections can be skimmed or skipped). If exact chapters are unknown due to limited text, say so and tell the user what kind of chapters to look for in the table of contents.

4. **引导进入 Stage 2**: Ask if the user wants to proceed to Stage 2 deep reading on this book, or move on to screen the next book.

### Stage 2: 深度精读与知识入网 (L4-L5 Deep Dive)

Run this stage only when the user confirms they want to deep-read the book (or explicitly requested a deep dive from the start).

1. **L4 结构层：整书地图与章节导航**:

   - Map how the book's major logical threads interweave so the user sees the full architecture.
   - Provide a concise **章节省流导航表** (Markdown table) grouping chapters/sections into: **必读核心** / **按需选读** / **可直接跳过** (with a brief reason for each).

2. **L5 原理层：隐藏黑箱与失效边界**:

   - **隐藏黑箱**：Identify 1-2 deeper "why" questions hidden behind the author's Constant C or conclusions, and suggest 1-2 cross-disciplinary concepts or companion books to open that black box.
   - **失效边界（反方视角）**：Explicitly test where the author's Constant C breaks down, what era/context limitations it has, or what modern evidence challenges it.

3. **新旧知识连接（认知增量）**:

   - State clearly whether this book overturns common sense, fills a specific puzzle piece, or repackages existing ideas.
   - Briefly compare it against 1-2 well-known books in the same or adjacent domain, focusing on core differences or complementary value so it connects cleanly into a broader knowledge network.

4. **L2 高价值概要与最小落地动作**:

   - Extract only the highest-leverage reusable assets (core definitions, sharpest mental models, or self-check questions) tied directly back to the L3 logic.
   - **1 个最小落地动作**：Define one concrete behavioral trigger ("当你遇到 [具体场景] 时，立刻做 [具体小动作]") so the book translates into real-life action.

5. **理性 vs. 感性阅读提示**: Note briefly whether the book also rewards an emotional or experiential read (L1, e.g. literature, memoirs, or calming mindset classics) so rational dissection does not strip away its real value.

## Gotchas

- **Do not force all 4 components**: Many great books focus heavily on 1-2 components. If a component is weak or absent by design, say so briefly instead of padding it.
- **Keep terminology consistent**: Always use the exact framework terms (起点 A/终点 B, 常量 C, 必要条件/充分条件, L1-L5) so the structure remains unambiguous across different agents and sessions.
- **Never bluff on unfamiliar books**: Honesty about missing context beats a fluent hallucination every time.
- **Prioritize information density**: Keep explanations direct and clear; avoid padding or rigid word/sentence limits.