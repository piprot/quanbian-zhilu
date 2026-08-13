# 团队管理训练营 · GitHub 参照与落地机制对照

状态：2026-08-13。在动手迭代前，先通过 GitHub 搜索同类项目，确认“决策模拟类管理训练”的成熟做法，再把这些机制落进本模块的可运行代码与自动化审计。

## 本次检索到的项目

| 项目 | 可借鉴机制 | 对应到本模块 |
| --- | --- | --- |
| [rsm-bgoyal/The-Strategy-Shuffle](https://github.com/rsm-bgoyal/The-Strategy-Shuffle) | 领导力与影响力卡片：选择响应情境、累积影响力 | 四维影响力（信任/连接/战略/传承）、情境决策 |
| [jaybi2008/ceo-simulator](https://github.com/jaybi2008/ceo-simulator) | 浏览器 CEO 模拟：难度决策、现金流、员工、声誉、随机事件 | 36 情境/角色、难度式关卡、随机情境顺序 |
| [Aatman1571/Soc-Simulation-Game](https://github.com/Aatman1571/Soc-Simulation-Game) | 训练模拟：资源管理、威胁优先级、评分、徽章 | 信用分、关卡完成度、练习/作业评分 |
| [Jooozen/basketball-iq-trainer](https://github.com/Jooozen/basketball-iq-trainer) | 5 领域系统化训练、错题复习、进度看板 | 9 关 × 4 情境、概念/公式/模型/练习/作业闭环、完成度看板 |
| [wAImlim/zheng-he-leadership-simulation](https://github.com/wAImlim/zheng-he-leadership-simulation) | 领导力评估游戏：情境选择即画像 | 角色专属课程、选择即获得维度增长 |
| [rbundock/executive-evasion](https://github.com/rbundock/executive-evasion) | 技术领导力情境模拟 | 空降角色“用专业破冰”课程 |
| [kerrishaus/supermarket](https://github.com/kerrishaus/supermarket) | 管理模拟、运营决策 | 资源有限下的取舍练习 |
| [tiptopparamaribo-byte/jci-unify-challenge](https://github.com/tiptopparamaribo-byte/jci-unify-challenge) | 浏览器多人项目管理模拟 | 无职权影响力、跨部门协作情境 |
| [TTMK7777/business-simulation-game-v2](https://github.com/TTMK7777/business-simulation-game-v2) | TypeScript + Vite 业务模拟 | 同技术栈下的情境数据驱动结构 |
| [Smart-Ink/cowboy-simulator](https://github.com/Smart-Ink/cowboy-simulator) | 管理模拟、资源分配 | 创业者角色的取舍与梯队建设 |

## 已有参照文档中的补充项目

- [prabapro/decision-lab](https://github.com/prabapro/decision-lab)：限时决策、情境反馈、评分复盘 → 本模块 36 情境“选择→结果→知识点→信用分”闭环。
- [Kashee12345/coach-up](https://github.com/Kashee12345/coach-up)：逐选项反馈 + 教练原则 → 每个情境 4 条路径逐项给出结果、原因与补救。
- [kevnb40-art/Scenario-Coach](https://github.com/kevnb40-art/Scenario-Coach)：分步教练引导 → “情境→概念→公式→模型→举一反三→练习→作业”七步教学。
- [SamirSaad786/the-hire-wire](https://github.com/SamirSaad786/the-hire-wire)：限预算组建团队 → 导师选择补短板机制。
- [PlanForwardTraining/Communication-Training-Simulator-Project-Manager](https://github.com/PlanForwardTraining/Communication-Training-Simulator-Project-Manager)：情境化训练验收标准 → 作业关键词自动评分。

## 借鉴原则

1. 只借鉴交互结构、反馈闭环与训练机制，不复刻任何仓库代码或文案。
2. 所有借鉴机制必须落在可运行代码与自动化测试里，而不是停留在文档。
3. 每类角色 36 个情境、9 个关卡，均采用“情境→概念→公式→模型→举一反三→落地清单→练习→作业”的完整学习路径。

## 本次迭代的落地机制

| 机制 | 来源项目 | 落地方式 |
| --- | --- | --- |
| 逐选项路径 | decision-lab、coach-up | 每个情境 4 条路径均含结果、原因、补救，答错也能学到最优路径 |
| 最佳答案均衡 | basketball-iq-trainer | 0/1/2/3 四档答案分布均衡，避免“永远选第二项”的套路化 |
| 防刷分评分 | Aatman1571/Soc-Simulation-Game | 情境/练习只在首次答对加分，作业与导师只计一次 |
| 落地清单 | Scenario-Coach | 每课新增 5 条本周动作清单，课程页可勾选执行 |
| 质量门禁 | basketball-iq-trainer 进度看板 | 新增 `test:academy` 专项审计并接入 CI |

## 内容来源与不重复原则

- 108 个情境均为本模块原创的通用团队管理训练场景，基于上述 GitHub 项目的训练结构重新编写，不直接复制 DeepSeek 分享文本。
- 空降、创业、高潜三个角色各自拥有独立的 36 个情境，不共用情境 ID，跨角色标题去重。
- 所有情境严格围绕“团队管理”主题：分工、目标、会议、反馈、冲突、激励、授权、梯队、绩效、文化、危机、交接。
- 每类角色课程均联结经典必读书：空降联结《格鲁夫给经理人的第一课》《上任第一年》《不懂说话，你怎么带团队？》《哈佛商学院最受欢迎的领导课》；创业联结《从0到1》《赋能》《这就是OKR》《驱动力》；高潜联结《领导梯队》《影响力》《卓有成效的管理者》。
