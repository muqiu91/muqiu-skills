# AI能力题库（40题）

## 一、AI理论基础

### 模型基础

**1. Transformer架构的核心组件是什么？**
- A: Self-Attention（自注意力机制）、Multi-Head Attention、FFN（前馈网络）、Layer Norm、Positional Encoding。Attention公式：softmax(QK^T/√d)V。
- 追问：为什么要除以√d？

**2. 什么是Attention机制？为什么重要？**
- A: 让模型动态关注输入的不同部分。Q(Query)、K(Key)、V(Value)三元组，通过QK相似度加权V。解决了RNN长距离依赖问题。
- 追问：Self-Attention和Cross-Attention的区别？

**3. 大模型的涌现能力（Emergent Abilities）是什么？**
- A: 模型规模达到一定阈值后突然出现的能力，如ICL（上下文学习）、CoT推理、指令遵循。小模型不具备，无法通过简单外推预测。
- 追问：为什么会有涌现能力？

**4. 什么是上下文学习（In-Context Learning）？**
- A: 模型通过Prompt中的示例学习任务模式，无需更新参数。Few-shot/One-shot/Zero-shot是ICL的不同形式。
- 追问：ICL的工作原理是什么？

### Prompt Engineering

**5. 如何写一个好的Prompt？**
- A: (1)明确角色设定 (2)清晰任务描述 (3)提供示例（Few-shot）(4)分步引导（CoT）(5)格式约束 (6)温度参数 (7)避免歧义。
- 追问：什么是Few-shot和Zero-shot？

**6. 什么是Chain of Thought（CoT）？**
- A: 让模型展示推理过程，逐步得出答案。变种：Zero-shot CoT（"Let's think step by step"）、Self-Consistency（多次采样取多数）、Tree of Thoughts。
- 追问：CoT在什么任务上效果好？

**7. 什么是Prompt注入？如何防范？**
- A: 恶意输入覆盖系统指令。防范：输入过滤、角色分离、输出验证、使用安全层、限制模型能力。
- 追问：举一个Prompt注入的例子？

**8. System Prompt和User Prompt的区别？**
- A: System Prompt定义模型角色和行为规范，对用户不可见，优先级更高。User Prompt是用户输入。
- 追问：如何设计一个好的System Prompt？

### Context Engineering（上下文工程）

**9. 什么是Context Engineering？和Prompt Engineering的区别？**
- A: Context Engineering是更广义的概念，包括如何组织、筛选、压缩、管理整个上下文（不仅是Prompt）。包括：Memory管理、知识检索、上下文窗口优化。
- 追问：上下文窗口有限时如何优化？

**10. 如何处理超长上下文？**
- A: (1)分块处理（Chunking）(2)摘要压缩 (3)滑动窗口 (4)检索增强（只取相关部分）(5)使用长上下文模型 (6)Map-Reduce模式。
- 追问：不同策略的优缺点？

**11. Memory（记忆）在AI系统中的作用？**
- A: 短期记忆：当前会话上下文。长期记忆：跨会话的持久化信息。实现：向量数据库、结构化存储、摘要压缩。
- 追问：如何设计Memory的更新和遗忘机制？

### RAG（检索增强生成）

**12. RAG的完整流程是什么？**
- A: 文档预处理→分块→Embedding→索引存储→查询Embedding→向量检索→重排序（Rerank）→上下文组装→LLM生成→后处理。
- 追问：每个环节有哪些优化点？

**13. RAG中的Chunking策略有哪些？**
- A: 固定大小切分、按句子/段落切分、递归切分、语义切分、基于结构切分（Markdown标题）。需考虑Chunk重叠。
- 追问：Chunk大小如何选择？

**14. 什么是Rerank？为什么需要Rerank？**
- A: 对初检结果用更精确的模型二次排序。向量检索是近似匹配，Rerank提高相关性。常用：Cohere Rerank、BGE-Reranker。
- 追问：Rerank的计算成本如何优化？

**15. Hybrid Search是什么？**
- A: 结合向量检索（语义相似）和关键词检索（精确匹配）。融合策略：RRF（倒数排名融合）、加权求和。
- 追问：什么场景适合Hybrid Search？

### Function Calling与MCP

**16. Function Calling的工作原理？**
- A: 模型根据用户意图选择函数并生成JSON参数→系统执行函数→结果返回模型→模型生成最终回答。支持并行调用、顺序调用。
- 追问：如何设计Function的schema？

**17. MCP（Model Context Protocol）是什么？**
- A: Anthropic提出的标准化协议，定义AI与外部工具/数据源的交互标准。三大原语：Resources（数据）、Tools（动作）、Prompts（模板）。
- 追问：MCP和传统Function Calling的区别？

**18. MCP的Resources和Tools有什么区别？**
- A: Resources是只读数据（文件、数据库查询结果），Tools是可执行动作（发邮件、写文件）。Resources用于上下文增强，Tools用于执行操作。
- 追问：设计MCP Server时如何划分？

### Agent架构

**19. Agent的核心架构组件？**
- A: LLM（推理引擎）、Tools（能力扩展）、Memory（状态管理）、Planning（任务分解）、Action（执行）、Observation（反馈）。
- 追问：ReAct模式是什么？

**20. 什么是Subagent？多Agent架构的设计？**
- A: Subagent是负责特定子任务的Agent。架构：主Agent协调→分发任务给Subagent→收集结果→综合决策。通信：消息传递、共享Memory。
- 追问：多Agent如何避免冲突？

**21. 什么是Skill（技能）？和Tool的区别？**
- A: Skill是可复用的能力模块，包含Prompt模板+工具组合+工作流。Tool是单一函数。Skill更抽象，可以组合多个Tool完成复杂任务。
- 追问：如何设计可复用的Skill？

**22. 什么是Spec（规格约束）？**
- A: 对Agent行为的形式化约束，包括：输入输出格式、安全边界、能力范围、质量标准。用于确保Agent行为可控可预测。
- 追问：如何验证Agent是否符合Spec？

### Hook与Command

**23. 什么是Hook？在AI系统中的应用？**
- A: Hook是在特定事件触发时执行的回调。AI系统中：pre_process（输入预处理）、post_process（输出后处理）、on_tool_call（工具调用前后）、on_error（错误处理）。
- 追问：如何用Hook实现审计日志？

**24. 什么是Command？和自然语言指令的区别？**
- A: Command是结构化的指令（如/search、/code），可精确触发特定功能。自然语言指令需要LLM理解和路由。Command更可靠但灵活性低。
- 追问：如何设计Command和自然语言的混合系统？

---

## 二、AI工程实践

### 成本与性能优化

**25. 如何优化LLM API调用成本？**
- A: (1)Prompt压缩 (2)缓存（语义缓存、精确缓存）(3)选择合适模型（简单任务用小模型）(4)批处理 (5)减少输出token (6)及时停止生成。
- 追问：如何实现语义缓存？

**26. 如何降低LLM响应延迟？**
- A: (1)流式输出 (2)并行调用 (3)预热请求 (4)边缘部署 (5)模型量化 (6)KV Cache (7)Speculative Decoding。
- 追问：流式输出的实现原理？

**27. Token限制问题如何解决？**
- A: (1)摘要压缩历史 (2)滑动窗口 (3)检索相关上下文 (4)分块处理后合并 (5)使用长上下文模型 (6)设计更简洁的Prompt。
- 追问：不同方案对效果的影响？

### 评估与测试

**28. 如何评估LLM应用的效果？**
- A: 定量指标：准确率、召回率、BLEU/ROUGE、延迟、成本。定性：人工评估、LLM-as-Judge。建立评估数据集，定期回归测试。
- 追问：LLM-as-Judge的局限性？

**29. 如何评估RAG系统？**
- A: 检索评估：Precision@K、Recall@K、MRR、NDCG。生成评估：忠实度（是否基于检索内容）、相关性、完整性。端到端评估。
- 追问：如何构建RAG的评估数据集？

**30. 如何评估Agent系统？**
- A: 任务完成率、步骤效率、工具调用准确率、响应延迟、成本、安全性、用户满意度。难点：评估非确定性行为。
- 追问：Agent评估的benchmark有哪些？

### 可靠性与安全

**31. 如何处理LLM的幻觉问题？**
- A: (1)RAG增强事实基础 (2)自我反思（让模型检查自己的回答）(3)多模型交叉验证 (4)置信度评估 (5)引用来源 (6)人工审核兜底。
- 追问：如何检测幻觉？

**32. AI系统的错误处理策略？**
- A: (1)重试机制（指数退避）(2)降级方案（换小模型）(3)人工兜底 (4)错误分类和告警 (5)Graceful degradation (6)用户反馈循环。
- 追问：如何设计重试策略？

**33. 如何保证AI系统的输出安全？**
- A: (1)输入过滤（敏感词、注入检测）(2)输出过滤（PII脱敏、有害内容检测）(3)Guardrails (4)内容分级 (5)审计日志。
- 追问：Guardrails如何实现？

### 工程架构

**34. LLM应用的典型架构？**
- A: 前端→API Gateway→应用层（Prompt管理、上下文组装）→LLM层（调用、缓存、负载均衡）→Tool层→存储层（向量库、关系库）。
- 追问：如何设计高可用架构？

**35. 如何实现LLM调用的负载均衡？**
- A: (1)多Provider轮询/加权 (2)根据延迟动态路由 (3)Rate Limit管理 (4)Fallback机制 (5)按任务类型路由不同模型。
- 追问：如何处理Provider故障？

**36. 向量数据库的选型考虑？**
- A: 考虑：规模（百万/亿级）、查询延迟、过滤能力、成本、运维复杂度。常见：Pinecone（托管）、Milvus（自建）、Qdrant、Weaviate、pgvector。
- 追问：向量数据库的索引原理？

### 实际问题处理

**37. 用户问题超出AI能力范围怎么办？**
- A: (1)能力边界检测 (2)诚实告知无法回答 (3)引导到人工服务 (4)推荐相关可回答问题 (5)记录用于后续改进。
- 追问：如何检测能力边界？

**38. 如何处理多轮对话的上下文管理？**
- A: (1)完整历史（成本高）(2)最近N轮 (3)摘要历史 (4)重要信息提取 (5)用户画像持久化 (6)会话状态机。
- 追问：如何判断哪些信息需要保留？

**39. AI应用如何做A/B测试？**
- A: 定义指标（CTR、完成率、满意度）、流量分配、统计显著性检验、分析Prompt/模型/策略的差异效果。注意：LLM输出非确定性带来的噪声。
- 追问：如何处理LLM输出的非确定性？

**40. 生产环境常见问题及解决？**
- A: (1)API超时：重试+降级 (2)成本飙升：限流+监控 (3)效果下降：评估+告警 (4)内容不当：过滤+审核 (5)用户滥用：频控+检测。
- 追问：如何建立AI应用的监控体系？
