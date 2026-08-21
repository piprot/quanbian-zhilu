# 自适应领导力游戏 · 版本迭代计划（V2.x）

> 前置研究：`docs/ADAPTIVE_GITHUB_RESEARCH_2026-08-21.md`
>
> 目标：把“升维 · Ascend”从当前规则型自适应，升级为用户所定义的“智能教练”——动态难度、动态情境、针对性反馈、个性化学习路径、可解释的心流体验。

## 0. 目标定义与可测量指标

“自适应”在本次迭代中定义为：系统根据玩家行为实时调整**难度、情境、反馈和练习路径**，并让玩家看得懂调整理由。

每个版本用同一组北极星指标验收：

| 指标 | 定义 | 工具 |
| --- | --- | --- |
| 心流区占比 | 决策质量处于“略高于当前水平”的时间占比（专家率 40%~75% 且未频繁重试/放弃） | `balance-sim`、`adaptive-sim` |
| 掌握度成长 | 10 项能力中，从“低频正确”到“稳定专家”的平均用时 | `learner-model.ts` + 报表 |
| 短板聚焦 | 训练/随机事件/推荐情境中，弱项被选中的比例 | `scenario-router.ts` |
| 反馈可信度 | 玩家对“教练为什么这样点评”的认可度 | 实测问卷 + 反馈导出 |
| 留存与挫败 | D1/D7、章节重试率、低能量连续失败率 | `analytics.ts` |

## 1. 现状盘点

已具备：

- 10 项能力、9 章权力架构、81 个主线情境、角色分支、随机事件、试炼、训练、1v1、教练工作坊。
- 离散难度档 `normal / pressure / extreme`，影响资源损耗、时间窗、AI 强度、恢复量。
- 能力门禁、随机事件轮换、隐藏路线、对局快照。
- `coach-plan.ts` 用最弱能力/最弱维度生成 90 天计划；`coach-hints.ts` 按最弱相关能力生成情境提示。
- SM-2 复习卡、双轴回练、能力复习看板。
- 本地匿名事件日志 `analytics.ts`；AI 动态叙事 `aiScenario.ts`；LLM 服务端 + 本地回退。

缺口：

- 没有能力级掌握度模型，`weakestAbility` 只是“当前等级最低”，不带置信度和证据分级。
- 难度是手工离散档，不是连续 PPS 驱动，也没有校准期与防死亡螺旋。
- 情境选择主要靠随机/章节顺序，没有按弱项、掌握度、前置关系选题。
- 反馈虽有针对性，但没有“证据 → 结论 → 下一步”的确定性链路，LLM 容易编造理由。
- 复习是节点级 SM-2，没有绑定能力掌握度和遗忘预测。
- 没有 A/B 实验框架，无法证明“自适应优于静态”。

## 2. 版本路线图

### V2.0 · 自适应底座：看得见的教练

**一句话**：让游戏能感知玩家状态、能连续调节难度、能解释为什么这样调。

**范围**

- 遥测升级：扩展 `src/core/analytics.ts` 事件模型，新增 `decision_started / decision_submitted / hint_opened / review_result / challenge_skipped`，记录节点、能力增量、资源前后、士气、耗时、是否提示/重试。
- 学习者模型：新增 `src/core/learner-model.ts`。
  - 每项能力维护证据：尝试次数、专家/部分/风险次数、最近决策时间、质量加权掌握度、置信度。
  - 参考 OATutor，提供可配置 BKT 参数（`probTransit / probSlip / probGuess`），先给默认值，后续用真实数据拟合。
  - 新增 `src/core/adaptive-config.ts` 集中管理阈值、校准次数、PPS 参数。
- 自适应难度：新增 `src/core/adaptive-dda.ts`。
  - 计算 PPS（0~5）：由最近 10~20 次决策质量、资源保留、耗时合理性、提示/重试使用、连续低质、士气合成。
  - 分档 `recovery / standard / stretch`，同时保留玩家手动难度档作为“上限偏好”。
  - 前 5 次决策为校准期，只观测不调难度；参考 Bathala 防死亡螺旋，低档位惩罚减半、成功给 comeback 加成。
  - 输出统一“压力调节器”：资源损耗、决策时间窗、能力门禁、每日恢复、随机事件权重、AI 强度、试炼难度。
- 透明面板：新增“教练调整面板”，展示当前 PPS、最近证据、难度变化原因、下一个被关注的能力。参考 Bathala debug overlay 与 Tutor MCP 开放学习者模型。
- 存档迁移：`types.ts` 增加 `adaptive` 状态字段，`game.ts` 提供 v1 → v2 迁移与 `save-roundtrip` 验证。

**借鉴来源**

OATutor（BKT/技能映射）、Bathala（PPS/校准/防螺旋/配置）、HussainAther DDA（指标-调节-循环三件套）。

**验收**

- 新增 `test:adaptive-core`：BKT 更新、PPS 计算、分档、校准、防螺旋、存档迁移单测通过。
- `balance-sim` 输出心流区占比，并对比固定难度档。
- `build / unit / audit / save-roundtrip / accessibility` 全绿。

### V2.1 · 情境路由：游戏跟着行为改变

**一句话**：让系统真正“换情境、换对手、换任务”，而不是只换数字。

**范围**

- 情境元数据：为 `story.ts` 的节点与生成情境补标签：能力焦点、危机类型、角色适配、难度适配、前置条件、是否已被训练；参考 OATutor `skillModel.json` 与内容源结构。
- 情境路由：新增 `src/core/scenario-router.ts`。
  - 候选池 = 主线/支线/随机/生成情境/复习卡/教练推荐。
  - 打分 = 能力缺口 × 难度适配 × 角色适配 × 新鲜度 × 用户目标，加种子噪声。
  - 参考 OATutor 最低掌握度启发式与 global-leaders 弱项加权；用 `(save, scenario, decisionIndex)` 做可复现随机。
  - 门禁：章节前置、角色路线、已完成防重复、会话预算（一局不超过 N 个同能力情境）。
- 动态后果规则：新增 `src/core/consequence-rules.ts`。
  - 连续风险型决策 → 触发“士气危机/权威挑战”类事件。
  - 连续授权/协作决策 → 触发“资源协调/跨部门任务”。
  - 能量过低 → 插入恢复型情境；能力掌握度足够 → 解锁掌握度挑战。
  - 与现有 `branchVariants.ts`、`hiddenRoutes.ts`、`randomEventEligibleCount`、`rotateRandomEventPool` 衔接。
- 反馈链路：新增 `src/core/adaptive-feedback.ts`。
  - 输出三件套：**展示了什么能力 → 证据是什么 → 下一步练什么**。
  - 证据由确定性引擎算，LLM 只负责措辞；沿用 Tutor MCP “引擎决策、LLM 表达”的边界。
- LLM 动态叙事：服务端提示词加入“学习者模型摘要 + 选定情境 + 最近决策”，返回结构必须通过 `validateAiScenario`；失败回退 `aiScenario.ts` 本地生成。

**借鉴来源**

OATutor（选题启发式）、global-leaders（弱项加权危机、可复现随机、LLM 叙述/裁判）、Tutor MCP（门禁与会话预算）。

**验收**

- 新增 `test:adaptive-router`：弱项聚焦比例、防重复、种子可复现、门禁正确。
- 扩充 `content-audit`：情境标签完整或存在可回退元数据。
- `role-campaign-sim / i18n-audit / system-audit` 全绿，AI 叙事失败回退路径有冒烟测试。

### V2.2 · 教练闭环：练在游戏外，复盘到证据

**一句话**：让玩家和教练都能看到成长、遗忘、下一步，并能对教练说“不”。

**范围**

- 记忆与复习：升级 `review-schedule.ts` 或新增 `src/core/fsrs-schedule.ts`。
  - 接入 FSRS 思想：稳定性、难度、可提取性；卡片绑定能力与节点。
  - 保留 SM-2 兼容层，新增“掌握度下降预警”和“到期复习”入口。
  - 参考 `open-spaced-repetition/fsrs4anki` 与 `noema` 的 FSRS 工程化。
- 教练警觉：新增 `src/core/coach-alerts.ts`。
  - 初始集合：`FORGETTING / PLATEAU / OVERLOAD / MASTERY_READY / DEPENDENCY_INCREASING / AFFECT_NEGATIVE`。
  - 每次会话最多 1 条主提醒，必须带证据；玩家可忽略，忽略会影响下次推荐。
- 开放学习者模型：报告页新增“能力证据阶段”视图。
  - 四档：`estimated / retained / demonstrated / transferred`。
  - 展示“为什么推荐这个情境”的决策重放；参考 Tutor MCP `get_olm_snapshot` 与 Serious-Game-Framework 的关卡级诊断。
- 错误银行：把“自信但选错/快速选风险项”记为误念，生成专门拆误念的题目；参考 noema。
- 教练看板：聚合能力分布、难度档变化、复习预测、流失风险；`coach:export` 支持 CSV/Markdown 决策重放。
- 学习协商：玩家可以选择“换一个挑战”“跳过本推荐”“调高一档”，系统记录并校准；参考 Tutor MCP `learning_negotiation`。

**借鉴来源**

FSRS（记忆参数）、noema（错误银行/教练模式）、Tutor MCP（警觉/协商/开放模型）、Serious-Game-Framework（教练双端分析）。

**验收**

- `save-roundtrip / coach:export / test:system / test:accessibility / i18n-audit` 全绿。
- 新增 `test:coach-alerts`：每种警觉的触发条件、去重、可忽略逻辑。
- 实测：教练推荐理由与存档证据一致，无“无来源建议”。

### V2.3 · 数据驱动游戏大师：用数据优化，不牺牲解释

**一句话**：用真实数据训练“何时给什么情境/压力”，但规则兜底与可解释性仍是硬约束。

**范围**

- 离线管线：
  - 新增 `scripts/adaptive-export.mjs` 与 `scripts/adaptive-sim.mjs`。
  - 导出匿名事件，计算掌握度成长、心流区占比、留存、误念命中率、DDA 档位稳定性。
  - 用真实数据拟合 BKT 参数、FSRS 参数、IRT 能力 θ。
- 可选模型 A：上下文老虎机游戏大师。
  - 动作 = “目标能力 + 压力动作（放休息/保持/加压）”。
  - 奖励 = 学习增益 + 心流代理 − 挫败惩罚；参考 NTRL 的 REINFORCE 奖励设计。
  - 先用 `balance-sim` 仿真数万局离线训练，再开放 A/B。
- 可选模型 B：小型遥测 transformer。
  - 参考 space-base-bomb-run：20 维特征、滚动窗口、13 类离散难度动作、权重随包发布。
  - 运行时用 TypeScript/WASM 推理，无 Python 依赖；保留 debug overlay。
- A/B 实验：新增 `src/core/experiment.ts`，按用户 id 哈希分流，比较静态/规则/ML 策略、提示策略、复习策略；参考 OATutor `config.js` 的实验开关。
- 伦理与安全：
  - 数据本地优先，上云需匿名 + 同意；不采集身份与生物信息。
  - 所有 ML 推荐必须带规则理由，黑箱决策不得直接进入反馈页。
  - 按角色、语言、难度档做偏见审计；检测“某种玩家被反复加压/减压”。

**借鉴来源**

RL DDA 引擎（DQN/PPO/REINFORCE）、NTRL（仿真奖励）、space-base-bomb-run（小型模型端到端）、OATutor（A/B 与日志）、eduadapt-ai（分层与知识追踪）。

**验收**

- `adaptive-sim` 对比规则策略：心流区占比、掌握度用时、挫败率至少持平或更优。
- 离线训练脚本在 CI 中以小规模数据集跑通；真实训练不阻塞发布。
- `test:server / test:unit / balance-sim / system-audit` 全绿。

## 3. 建议落地顺序

1. 先做 V2.0：不新增大量内容，只加模型、遥测、DDA 与透明面板，风险最低。
2. V2.1 与内容团队并行：给已有情境补标签时用“自动推导 + 人工抽查”，避免一次性手改 81 个节点。
3. V2.2 在 V2.1 的推荐链路上做反馈与复习，不要先做报表。
4. V2.3 必须等到有足够真实数据（建议 500+ 完整用户路径）再启动模型训练；仿真只用于预研。

## 4. 风险与取舍

| 风险 | 应对 |
| --- | --- |
| 数据不足导致 ML 过拟合 | 规则 DDA 始终为默认策略，ML 只做推荐 |
| 玩家觉得被“测试” | 难度调节走情境/资源/叙事，不阻止推进；校准期不调难度 |
| 黑箱反馈不可信 | 确定性证据先于 LLM 措辞；无证据不提示 |
| 内容标签工作量大 | 自动从 `option.effects` 推导 + 审计脚本抽查，而非逐节点手写 |
| 存档结构升级破坏旧档 | 迁移 + `save-roundtrip` + 旧档兼容测试 |
| 自适应把游戏变得不公平 | 种子随机 + 可复现回放，平衡仿真纳入 CI |

