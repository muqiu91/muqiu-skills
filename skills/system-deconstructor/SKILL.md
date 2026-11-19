---
name: system-deconstructor
description: Deconstruct and analyze any complex codebase, technical system, programming language (such as Objective-C or Kotlin Multiplatform), micro-mechanism, discipline, business model, or dense book into a structured knowledge architecture built on core architectural anchors, operational interfaces, core operational mechanics, and static frameworks. Use ONLY when the user asks to analyze underlying architecture, build a knowledge system, deconstruct a subject, codebase, or technical mechanism from first principles, or map out core mechanisms and frameworks. Do NOT use for simple file/article summaries, quick Q&A, bug fixes, or basic definitions.
---

# System Deconstructor

Deconstruct any complex codebase, technical stack, programming language, micro-mechanism, industry, or dense book into a structured, visualizable knowledge system built on core architectural anchors, operational interfaces, causal connections, external structural frameworks, and core operational mechanics.

## When to Use & Trigger Boundaries

- **Trigger when:**
  - The user asks to analyze the architecture, runtime mechanics, or underlying logic of a repository, programming language, or framework (e.g., "Deconstruct the architecture of this codebase", "Analyze how Kotlin Multiplatform handles memory and interop").
  - The user asks to dissect a specific **micro-mechanism** or low-level technical principle from first principles (e.g., "Deconstruct Objective-C weak pointer zeroing", "Analyze Kotlin coroutine CPS state machine").
  - The user wants to build a structured knowledge system for an unfamiliar discipline, business model, or dense theoretical book from first principles.
- **Do NOT trigger when:**
  - The user simply asks to "summarize this file/article/video", "fix a bug", "write a unit test", or "answer a specific factual question" without requesting structural/architectural modeling.

## Methodology & Workflow

Follow this four-layer architectural workflow to transform raw, fragmented information into an actionable knowledge system:

### Step 1: Information Scoping & Adaptive Anchoring

Gather the authoritative baseline of the target domain or workspace before extracting concepts.

- **Distinguish Data, Information, and Knowledge:** Ignore isolated trivia (Data) and simple descriptive combinations (Information). Focus exclusively on **Knowledge**—the stable rules, functions, and causal relationships connecting information.
- **Environment-Adaptive Anchoring:**
  - *Mode A — Codebase / Local Workspace (when repository/file tools are available):* Inspect entry points, core interfaces/protocols, build configs (`build.gradle.kts`, `Package.swift`, `Cargo.toml`), and architectural docs first rather than surface UI/utility files.
  - *Mode B — Conceptual / Micro-Mechanism / Discipline (when analyzing abstract topics, runtime internals, or documents):* Base definitions on official specifications, runtime source semantics (`objc4`, LLVM, JDK, etc.), foundational papers, or primary standards rather than secondary tutorials.

### Step 2: Core Concept Extraction & Layer-Agnostic Two-Tier Curation

Distill the entire domain down to its structural building blocks and core measurement interfaces without falling into surface-vocabulary bias or bottom-up bias.

- **Layer-Agnostic Principle (Structural Centrality Over Depth):** A core concept does NOT have to sit at the lowest physical layer (e.g., memory pointers or kernel calls). Depending on the system's design center, the irreducible anchor may live at the **top/macro layer** (e.g., domain entities in Clean Architecture, `UI = f(State)` in declarative UI frameworks, or two-sided network effects in platform business models) just as often as at the bottom layer. Judge every concept solely by **Structural Centrality and Irreplaceability**, regardless of abstraction height.
- **Frequency-Neutral Rule (Neither Worship Nor Reject High Frequency):** Do NOT include a concept merely because it appears frequently, and do NOT automatically discard a high-frequency term as "superficial." Pure rhetorical buzzwords without formal definitions or causal roles (e.g., "hype", "synergy", "narrative") are noise; high-frequency operational metrics or high-level abstractions (e.g., `PE`, `PB`, `Dividend Yield`, `State`, or core public protocols) are vital system instruments if they govern state evaluation or architectural boundaries.
- **Two-Tier Curation & Structural Deletion Test:** Classify candidate concepts into two legitimate tiers rather than binary keep/drop:
  - **Tier 1 — Core Architectural Anchors (Irreducible Hubs):** Apply the Deletion Test: *"If this concept is removed, does the remaining architecture collapse or lose its defining identity?"* If YES—whether it is a low-level mechanism (`isa` pointer, `SideTable`) or a high-level design axiom (`FCF`, `ROIC`, `Declarative State Tree`, `Domain Aggregate`)—promote it as a **Core Architectural Anchor**.
  - **Tier 2 — Operational Interfaces & Measurement Gauges:** If a concept is derived from or sits atop Tier 1 anchors, check whether it serves as an indispensable **measurement gauge, screening threshold, or public contract** during real-world execution (e.g., `PE = Price / Earnings`, `PB`, `Dividend Yield`, or public API facades). If YES, preserve it explicitly as an **Operational Interface / Gauge** and state its derivation or mapping from Tier 1 anchors. Only demote purely redundant synonyms or ungrounded buzzwords.
- **Flow-Driven Node Discovery:** Trace the system's primary control flow, data flow, or value/capital flow from input to output. Any node that acts as a state-transition gatekeeper or bottleneck constraint must be included regardless of abstraction layer or term frequency.
- **Granularity-Adaptive Pruning & Clustering:**
  - *Macro-System / Whole Discipline / Codebase:* Prune to **15–25 core concepts** (combining Tier 1 Anchors + Tier 2 Interfaces/Gauges) clustered into 3 to 5 functional dimensions:
    - *Technical Stacks:* Memory & Lifecycle, Type & Object Model, Execution & Dispatch, Concurrency & Interop, Tooling & Compilation.
    - *Business / Economics / Social Sciences:* Value Creation & Supply, Valuation Dashboards & Pricing Metrics, Governance & Risk Constraints, Capital & Resource Flows.
  - *Micro-Mechanism / Single Technical Principle:* Prune to **6–12 microscopic anchors** focusing on concrete data structures, pointer/bitfield flags, state transitions, and synchronization barriers.

### Step 3: Dual-Structure Architecture & Smart Diagram Routing

Organize the curated concepts into two complementary views:

1. **External Structural Framework (Static Skeleton):**
   - Build a classification matrix, hierarchy pyramid, memory layout diagram, or layered architecture view showing where every Tier 1 anchor and Tier 2 interface sits and how static boundaries are drawn.
   - Define the core axes or layers adapted to the scope:
     - *Macro Technical Systems:* `Compile-time vs. Runtime`, `Shared Module vs. Platform Native`, or `Abstraction Layers`.
     - *Micro-Mechanisms:* **Physical Memory Layout** (Stack vs. Heap vs. Global SideTable), **Struct/Bitfield Map**, or **Boundary Isolation Matrix**.
     - *Social/Business Systems:* `Macro-institutional vs. Micro-behavioral`, `2x2 Strategic Matrix`, or `Stakeholder Hierarchy`.

2. **Core Operational Mechanics (核心运转机制 + Core Trade-offs & Boundaries):**
   - Identify 2 to 4 **Core Mechanism Flows** (核心运转机制 — end-to-end execution workflows, feedback cycles, or state transitions) and **Core Trade-offs & Boundaries** (核心取舍与边界 — fundamental design compromises the system makes, what it gains vs. sacrifices, and the boundary conditions where it breaks down).
   - **Smart Diagram Routing (Select the best Mermaid diagram for the 1–2 most critical/complex flows):**
     - *Multi-thread / Cross-runtime / Cross-module interaction & lock contention:* Use **`mermaid` `sequenceDiagram`** (with `autonumber`, `par`, or `alt` blocks) to expose lifelines, lock scopes, and race barriers.
     - *Branching pipelines, fast/slow paths, or feedback loops:* Use **`mermaid` `flowchart TD/LR`** to highlight decision diamonds and loop-back edges.
     - *Single entity lifecycle or state machine transitions:* Use **`mermaid` `stateDiagram-v2`** to define states and guard conditions.
     - *Simple linear chains (`A -> B -> C` without branching or concurrency):* Keep as concise directional text without forcing a diagram.
   - **Mermaid Syntax Hygiene:** Keep diagrams focused (**6–12 nodes max**) and quote labels containing special characters (`()`, `[]`, `*`, `:`) so they render cleanly across terminals, web UIs, and Obsidian.
   - **Demand Mechanism Proof & Complementarity:** Do NOT repeat diagram steps in prose. Use the prose beneath each flow/diagram strictly to explain the **Mechanism Proof** (how and why the transition works, citing exact classes/symbols/file paths for codebases, or runtime structs/causal proofs for conceptual/micro topics).

### Step 4: Progressive Output & Card-Based Synthesis

Follow a **Two-Stage Progressive Disclosure** strategy:

#### Stage 1: Global Architectural Blueprint (Default First Response)
Always output these four sections first:
1. **System Essence (Crisp Anchor Block):** Start with **one punchy, plain-language sentence (strictly <= 30 Chinese characters or <= 20 English words)** that nails the system's core paradigm and the fundamental contradiction it solves. Follow with **clean, short sentences** explaining its core operating leverage, inputs/outputs, and boundaries. **BANNED:** Do NOT stack multi-layer subordinate clauses into bloated sentences.
2. **Core Concept Map (Categorized Table):** Present the curated concepts grouped by dimension, explicitly distinguishing **Tier 1 (Core Architectural Anchors)** and **Tier 2 (Operational Interfaces / Measurement Gauges, with derivation formulas)**, alongside concise definitions and systemic roles.
3. **External Framework (Static Architecture):** Provide a layered diagram, memory layout, or matrix view showing structural boundaries.
4. **Core Operational Mechanics & Trade-offs (核心运转机制与取舍边界):** Trace 2–4 critical end-to-end execution workflows or feedback mechanisms, embedding targeted Mermaid diagrams for complex interactions alongside mechanism proofs and **Core Trade-offs & Boundaries (核心取舍与边界)**.

#### Stage 2: On-Demand Deep-Dive & Atomic Cards (Follow-Up)
At the end of Stage 1, offer clear next steps to either:
- **Drill down into a specific subsystem or edge case** (unpacking a single mechanism, struct layout, or failure mode to implementation detail), OR
- **Generate & Save Atomic Knowledge Cards** formatted as modular `Concept -> Mechanism -> Concrete Example` blocks (saving them to a local Markdown/Obsidian directory if file tools are available, or outputting ready-to-copy Markdown blocks otherwise).

## Gotchas

- **Avoid Encyclopedic Listing, Bottom-Up Bias & Frequency Bias:** Do not list every minor API or ungrounded buzzword, do not assume core concepts must live at the lowest physical layer, and do not blindly discard high-frequency operational metrics. Judge every concept by *structural centrality and causal role*.
- **Separate Static from Operational:** Always distinguish between what the system *is* (static framework/layout) and how the system *runs* (core operational mechanics).
- **Demand Mechanism Proof:** Every connection between two concepts must explain the underlying mechanism (e.g., in Objective-C, instead of saying "Objects connect to Methods", explain "Message passing resolves selectors dynamically via the `isa` pointer and `objc_msgSend` dispatch table").