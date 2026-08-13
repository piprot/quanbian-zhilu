# 教练 90 天行动计划设计参考

状态：2026-08-11。教练工作坊在保留小组模式的基础上，新增「单人 90 天行动计划」，根据玩家存档生成自适应、可落地、可交互的成长计划。

## 参照项目

### 1. arayaconsulting/Araya-Leadership-Screening-Tool
- 地址：https://github.com/arayaconsulting/Araya-Leadership-Screening-Tool
- 模式：基于 John C. Maxwell 五级领导力模型做筛选与诊断。
- 借鉴点：行动计划要先做角色定位与能力诊断，再给分阶段行动。

### 2. prabapro/decision-lab
- 地址：https://github.com/prabapro/decision-lab
- 模式：领导力情境模拟与复盘。
- 借鉴点：把游戏决策轨迹作为诊断依据，让计划回应玩家真实行为。

### 3. rbundock/executive-evasion
- 地址：https://github.com/rbundock/executive-evasion
- 模式：高管压力模拟。
- 借鉴点：90 天计划要包含压力情境下的韧性/士气检查点。

## 本仓设计

- 交互流程：第 1 步选 90 天目标（业绩突破 / 团队升级 / 个人影响力）→ 第 2 步选核心挑战（时间不够 / 信任不足 / 方向模糊）→ 自动生成计划。
- 自适应输入：角色、能力短板、五维模型、决策风格、试炼/训练/领导力游戏进度、士气。
- 三阶段递进：诊断与微胜利（1~30 天）→ 系统与授权（31~60 天）→ 传承与复盘（61~90 天）。
- 每阶段包含：具体行动、每周动作、检查点、教练追问；行动项可交互勾选。
