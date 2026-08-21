# 自适应领导力游戏 · GitHub 参照研究（2026-08-21）

> 用途：为“升维 · Ascend”的下一轮版本迭代做前置调研。本文件只借结构、思维方式与做法，不复制任何开源代码或受版权保护的文案。
>
> 与本仓既有参照的关系：`docs/REFERENCE_ADOPTION_MATRIX.md`、`docs/QUALITY_AUDIT_REFERENCES.md` 已覆盖决策训练、间隔复习、分支剧情、UGC 等方向；本轮重点补四类缺口：**学习者建模、动态难度、情境路由、AI 教练反馈**。

## 一句话结论

成熟项目的共同做法是：**规则与可解释模型先行，数据后补；学习模型、内容选择、难度调节、反馈生成分层解耦；玩家和教练都要能看见“为什么”**。ML/RL 是优化层，不是第一版的依赖。

## 参照总览

| 仓库 | 类型 | 一句话做法 | 我们借鉴什么 |
| --- | --- | --- | --- |
| [CAHLR/OATutor](https://github.com/CAHLR/OATutor) | 开源智能导学系统 | 用 BKT 估计技能掌握度，按“最低掌握度”启发式选题 | 能力掌握模型、题干→技能映射、提示路径、A/B 实验 |
| [ArnaudGuiovanna/tutor-mcp](https://github.com/ArnaudGuiovanna/tutor-mcp) | 自适应教练运行时 | 确定性引擎管学习状态与调度，LLM 只负责表达 | 七段式决策管线、警觉引擎、开放学习者模型 |
| [devlocke-acsad/bathala](https://github.com/devlocke-acsad/bathala) | 规则型 DDA 游戏 | 用 PPS 衡量表现质量，分档调节敌人与经济 | PPS、校准期、防死亡螺旋、透明难度面板 |
| [HussainAther/dynamic-difficulty-adjustment-engine](https://github.com/HussainAther/dynamic-difficulty-adjustment-engine) | DDA 引擎骨架 | 指标采集 + 难度调节 + 游戏循环三件套 | 极简 DDA 模块拆分与单元测试 |
| [itsluckysharma01/RL-based_Adaptive_Game_Difficulty_Engine](https://github.com/itsluckysharma01/RL-based_Adaptive_Game_Difficulty_Engine) | RL 难度引擎 | DQN/PPO 学“何时升/降难度” | 奖励函数、状态特征、离线训练与评估 |
| [ghasifs/adaptive-game-ai](https://github.com/ghasifs/adaptive-game-ai) | 对抗式自适应 | 平台 agent 与玩家 agent 互相学习 | “环境持续跟随玩家表现”的对抗循环 |
| [CarloRomeo427/NTRL](https://github.com/CarloRomeo427/NTRL) | RL 遭遇生成 | REINFORCE 上下文老虎机生成战斗，奖励兼顾胜利、时长、伤亡 | 把“难度目标”变成可仿真奖励 |
| [theprint/space-base-bomb-run](https://github.com/theprint/space-base-bomb-run) | 小型游戏大师模型 | 遥测→人工标注→小 transformer→运行时推理 | 离散难度动作、嵌入式推理、可解释开关 |
| [mwasifanwar/eduadapt-ai](https://github.com/mwasifanwar/eduadapt-ai) | 自适应学习平台 | 交互→特征→知识追踪→推荐→RL 优化 | 分层架构、学习路径生成、评估生成 |
| [open-spaced-repetition/free-spaced-repetition-scheduler](https://github.com/open-spaced-repetition/free-spaced-repetition-scheduler) | 间隔复习算法 | FSRS 用稳定性/难度/可提取性建模记忆 | 替代/增强现有 SM-2 复习卡 |
| [aislamsilvalol-ctrl/noema](https://github.com/aislamsilvalol-ctrl/noema) | 自适应学习平台 | 概念图 + 掌握度 + 错误银行 + FSRS | 概念前置、自信错误、教练模式、误念检测 |
| [rwth-acis/Serious-Game-Framework](https://github.com/rwth-acis/Serious-Game-Framework) | 严肃游戏框架 | 玩家/设计师双端分析，按错误率标出最差关卡 | 教练看板、关卡级诊断、规则化评估 |
| [sirawin/leadership-simulation-mvp](https://github.com/sirawin/leadership-simulation-mvp) | 领导力 AI 对话模拟 | 定时对话 + AI 评分反馈，prompt 独立成文档 | 场景 prompt、限时对话、结构化反馈 |
| [build-small-hackathon/global-leaders](https://huggingface.co/spaces/build-small-hackathon/global-leaders) | LLM 领导力叙事（补充参照） | 危机抽取朝玩家弱项加权，LLM 叙述/裁判/扮演 | 弱项加权选题、可复现随机、LLM 只做表达 |

## 重点拆解

### 1. OATutor：把“掌握度”变成选择题的依据

**结构与内容**

- `src/models/BKT/BKT-brain.js`：标准 BKT 更新，输入 `probMastery / probSlip / probGuess / probTransit` 与一次正误，输出新的掌握概率。
- `src/models/BKT/problem-select-heuristics/*.js`：可插拔选题启发式；默认选“所有知识组件平均掌握度最低”的题目。
- `src/content-sources/*/skillModel.json`：题目→技能映射，一个题目可打多个技能标签。
- `src/content-sources/*/bkt-params/`：每个技能的 `mastery / transit / slip / guess` 参数。
- `tutoring/`：每个步骤下的提示路径，支持逐步揭晓、到底给出答案（bottom-out hint）。
- `src/config/config.js`：A/B 实验、日志开关、提示策略集中配置。

**思维方式**

不把“答对/答错”当作知识本身，而是当作一次带噪声的观测；用模型估计“这个能力到底有没有掌握”，再决定下一题。

**做法**

内容与运行时分离：题目、技能映射、BKT 参数、提示路径都是数据；引擎只负责更新掌握度并选择下一题。同一套平台可接多个内容源。

**借鉴点**

- 本仓 `story.ts` 的每个选项已有 `effects`，可据此建立“节点/选项→能力”映射表，替代手写映射。
- 在 `coach-hints.ts`、`adaptiveRoute.ts` 之上补一层“能力掌握度估计”，让“最弱能力”从单点最低值升级为带置信度的模型。
- 为随机事件、试炼、训练题目补技能标签和难度标签，形成可被选题器查询的题库元数据。

### 2. Tutor MCP：教练不是聊天机器人，而是一个“调度运行时”

**结构与内容**

- 确定性引擎与生成式教练分离：引擎拥有认知信号、阶段控制、证据门禁、会话历史、审计轨迹；LLM 只拥有内容生成、措辞、苏格拉底式追问。
- 学习循环：`get_next_activity` → `record_interaction` → 更新 BKT / FSRS / IRT / PFA。
- 七段式调节管线：`阈值解析 → 目标分解 → 阶段状态机(DIAGNOSTIC/INSTRUCTION/MAINTENANCE) → 概念选择 → 门禁(防重复/会话预算/禁止逃逸) → 动作选择 → 淡出控制器`。
- 警觉引擎：`FORGETTING / PLATEAU / ZPD_DRIFT / OVERLOAD / MASTERY_READY / DEPENDENCY_INCREASING / CALIBRATION_DIVERGING / AFFECT_NEGATIVE / TRANSFER_BLOCKED`。
- 开放学习者模型：按 `estimated / retained / demonstrated / transferred` 四档展示证据，而不是一个总分数。
- 动机循环：每次练习给出一个动机角度（里程碑、能力价值、成长心态、情绪重构、平台期重构、效用价值），LLM 负责措辞。

**思维方式**

“缺的不是内容，而是连续性。”系统要记得玩家掌握了什么、忘记什么、误解什么、接下来该做什么；LLM 负责解释，不负责拍板。

**做法**

所有教育决策都可审计、可重放：记录决策前后快照，离线能解释“为什么选中这个概念、为什么拦住这个概念”。

**借鉴点**

- 本仓 `coach-workshop.ts`、`coach-plan.ts` 已经有教练交互层，可把“教练”升级为上述“引擎 + 表达”两层。
- 把 `scenarioCoachHint` 的产出拆成“证据（确定性）+ 措辞（可生成）”，LLM 只润色不编造依据。
- 用警觉引擎替代目前一次性弹提示：一局最多给一条、必须带理由、可被玩家驳回。

### 3. Bathala：透明、规则化、可仿真的 DDA

**结构与内容**

- `src/core/dda/RuleBasedDDA.ts`：核心 PPS 计算、分档、校准、防死亡螺旋。
- `src/core/dda/DDAConfig.ts`：所有可调参数集中在一份配置，方便 A/B。
- `src/core/dda/DDATypes.ts`：`CombatMetrics / PlayerPerformanceScore / DifficultyAdjustment / FlowStateMetrics / DDAEvent`。
- `src/game/scenes/combat/CombatDDA.ts`：战斗初始化时套用敌人血量/伤害/AI 复杂度倍率。
- `src/utils/analytics/DDAAnalyticsManager.ts`：PPS 历史、档位变化、经济调节、CSV 导出。

**思维方式**

难度只看“赢/输”会制造死亡螺旋；所以用表现质量（血量保留、回合效率、手牌质量、资源管理、逆境表现、连败后的反弹）算 PPS，而不是胜率。

**做法**

- 前 3 场为校准期：只观测，不调难度。
- PPS 0~5 分档：`struggling / learning / thriving / mastering`。
- 难度影响多个通道：敌人 HP/伤害 ±15~20%、商店价格 ±20%、金币奖励 ∓20%、地图休息点概率。
- 防死亡螺旋：低档位惩罚减半、成功时给 comeback 加成；高分档奖励收敛，避免难度来回横跳。

**借鉴点**

- 本仓 `difficulty` 目前是离散三档（normal/pressure/extreme），可改为“手动档 + 自适应档”双层：手动档保留玩家选择，自适应档输出连续压力系数。
- PPS 的输入可映射为本仓指标：选项质量、资源保留、决策耗时是否合理、是否用提示/重试、士气、连续低质选择。
- 难度调节通道可映射为：资源损耗系数、决策时间窗、能力门禁、每日恢复、随机事件权重、AI 对手强度、试炼难度。
- 在 UI 上增加“教练调整面板”：显示当前 PPS、最近证据、为什么升/降难度。这也正好回应用户目标里的“黑箱问题”。

### 4. 三款 DDA/RL 引擎：从规则到训练

**结构**

- `HussainAther/dynamic-difficulty-adjustment-engine`：`metrics_tracker.py → difficulty_adjuster.py → dda_manager.py`，游戏循环内采集成功率、耗时、错误类型，按阈值升/降难度。
- `itsluckysharma01/RL-based_Adaptive_Game_Difficulty_Engine`：`agent/dqn.py + ppo.py`、`game/difficulty_manager.py + metrics.py`、`config/hyperparameters.yaml`、`train.py / evaluate.py`。
- `ghasifs/adaptive-game-ai`：`AdverseGame.py` 中平台 agent 与玩家 agent 构成对抗循环，平台改关卡参数，玩家学通关。
- `CarloRomeo427/NTRL`：`simulate.py + reinforce.py + dm_policy.py`，把遭遇生成建模为上下文老虎机；奖励 = 胜率×1000 + 时长×5 + 承伤 + 阵亡风险 - TPK×10000。

**思维方式**

先把“玩家表现”抽象成状态特征和奖励，再把“调难度”抽象成动作；RL 学的是动作策略，不是学游戏内容本身。

**做法**

- 规则引擎先做可解释基线；RL 用仿真环境预训练，再上真实玩家。
- 奖励要同时惩罚“太简单”和“太难”：既要胜率，也要时长、承压、风险；全灭是重大负奖励。

**借鉴点**

- V2.0 先实现规则 DDA；V2.3 再把“选哪个能力情境、升还是降压力”做成上下文老虎机，用 `balance-sim` 充当仿真器。
- AI 对手强度可以走同样思路：`duel.ts` 的 `strength` 已影响专家选择概率，后续把它接到 PPS 而非固定档位。

### 5. space-base-bomb-run：小型“游戏大师”模型的端到端闭环

**结构与内容**

- `gm_ai/model.py / train.py / dataset.py / export_weights.py`：小 transformer 训练与权重导出。
- `scenes/telemetry.gd`：采集玩家位置、敌人数、威胁量、滚动击杀/命中、分数、刷怪预算、弹幕数。
- `scenes/gm_controller.gd / gm_inference.gd`：运行时推理，13 个离散难度动作（hold、增减预算/速率、强制 swarm/elite/chase、放休息、清屏、surge、ease）。
- 模型权重以 JSON 随游戏发布，运行时不需要 Python。

**思维方式**

把“游戏大师”当成一个可训练的输入输出函数：输入最近 8 个快照的特征，输出离散难度动作；先人工标注“这种情况下该怎么做”，再让模型模仿。

**做法**

- 特征要少而可解释：20 个输入特征、4 秒采样、8 帧滚动窗口。
- 保留 debug overlay：实时显示模型动作概率和上一次决策，玩家/研究员能看见它在想什么。

**借鉴点**

- 本仓可用 `analytics.ts` 升级为“遥测层”，导出行为快照；先用规则引擎做同一个动作接口（降压力/升压力/放休息/推弱项），后续再替换成模型。
- 如果要引入 ML，优先做“离散难度动作”的监督/强化模型，而不是让模型直接生成剧情或判分。

### 6. eduadapt-ai 与 noema：完整学习平台的分层与记忆

**结构与内容**

- `eduadapt-ai`：`models/knowledge_tracer.py`（LSTM 知识追踪）、`models/rl_agent.py`、`core/learning_optimizer.py`、`core/content_recommender.py`、`assessment/quiz_generator.py`、`api/endpoints.py`；分层为“交互 → 特征 → 知识追踪 → 个性化 → RL 优化”。
- `noema`：`engines/mastery.py`（0-100 掌握度）、`engines/fsrs.py`、`engines/path.py`、`engines/scheduler.py`、`knowledge/graph.py`、`prompts/`；强调概念图、错误银行、自信错误、费曼/苏格拉底/考官等教练模式、本地优先与 RAG 引用。

**思维方式**

内容系统负责“有什么可学”，学习模型负责“现在学到哪”，路径引擎负责“下一步学什么”。三者不要揉在一个 UI 或一个文件里。

**做法**

- 每个概念有前置依赖；新概念要被前置掌握度门禁。
- 自信错误比普通错误更重要：答错且很自信说明存在误念，应该生成专门拆误念的题目。
- 时间预算优先：给 30 分钟，就排 30 分钟能学完的内容，而不是全量列表。

**借鉴点**

- 本仓能力之间可建立“前置/相邻”关系（例如 structure → strategy → authority），在情境路由中做门禁。
- `decisionHistory` 已有决策记录，可加“信心/耗时”字段来识别“自信但选错”的误念型短板。
- 教练卡已有 30/90 天计划，可升级为“时间预算输入 → 自适应学习计划输出”。

### 7. FSRS：把复习从“间隔表”升级为“记忆参数”

**结构**

- `open-spaced-repetition/free-spaced-repetition-scheduler`：FSRS 算法说明与多语言实现，TypeScript 可用 `ts-fsrs`。
- 核心变量：稳定性（stability）、难度（difficulty）、可提取性（retrievability），随个人复习历史优化参数。

**思维方式**

固定间隔表假设所有人记忆曲线相同；FSRS 为每个学习者和每张卡拟合记忆参数，允许提前/延后复习。

**做法**

每张卡记录稳定性、难度、下一次到期时间；每次复习结果回写，再预测未来召回概率。

**借鉴点**

- 本仓 `review-schedule.ts` 的 SM-2 可保留兼容层，新增 FSRS 卡模型。
- 把“错过专家项”的复习卡绑定到能力，让到期复习与“掌握度下降”同时触发，而不只是节点级复习。

## 汇总：四层目标架构

综合以上项目，本仓的自适应系统应长成四层：

```text
行为遥测层
  analytics.ts 升级：决策、耗时、提示、重试、资源、士气、来源
        ↓
学习者模型层
  learner-model.ts：能力掌握度 + 置信度 + 误念 + FSRS 记忆 + 前置图
        ↓
教学决策层
  adaptive-dda.ts：PPS + 难度档 + 校准 + 防螺旋
  scenario-router.ts：选题、门禁、防重复、种子随机
  coach-alerts.ts：警觉、推荐理由、玩家驳回
        ↓
内容与表达层
  story.ts / aiScenario.ts / LLM 叙事 / adaptive-feedback.ts
  UI：开放学习者模型、教练调整面板、决策重放
```

## 落地原则

1. 只借鉴机制与交互结构，不复制代码与文案。
2. 每一项借鉴都要有落地文件和自动化验证，否则不计入“已借鉴”，沿用本仓 `REFERENCE_ADOPTION_MATRIX.md` 的规则。
3. 规则模型先做，ML/RL 后做；ML 输出只是推荐，最终教学决策仍由确定性引擎负责。
4. 玩家能看见“为什么”：难度调整、选题推荐、反馈依据都要可解释。
5. 数据本地优先、匿名化、可导出；上云必须明示并取得同意。

