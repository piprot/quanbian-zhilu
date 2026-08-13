# 领导力游戏中心设计参考

状态：2026-08-11。军棋推演因规则复杂、学习成本高被替换为「领导力游戏中心」：决策棋 + 博弈推演 + 资源分配 + 团队管理 + 危机指挥，共 5 个单机游戏，统一放在 `src/core/leadership-games.ts` 与 `src/ui/leadership-games.ts`。

## 参照项目

### 1. MilesFM/Cooperate
- 地址：https://github.com/MilesFM/Cooperate
- 模式：基于囚徒困境的 JavaScript 博弈游戏。
- 借鉴点：用清晰的得分矩阵解释合作/竞争，适合作为「博弈推演」教学与训练的基础。

### 2. Hhhpraise/prisoners-dilemma-tournament
- 地址：https://github.com/Hhhpraise/prisoners-dilemma-tournament
- 模式：交互式重复囚徒困境锦标赛。
- 借鉴点：重复回合的累计收益与对手策略回应，用于对战模式中的 AI 策略设计。

### 3. rbundock/executive-evasion
- 地址：https://github.com/rbundock/executive-evasion
- 模式：浏览器领导力情境模拟。
- 借鉴点：把职场压力转化为可操作的情境选择，适合「危机指挥」的交互方式。

### 4. prabapro/decision-lab
- 地址：https://github.com/prabapro/decision-lab
- 模式：限时团队领导力模拟，每个情境都有独立复盘。
- 借鉴点：教学/训练/对战三种模式都围绕“情境 → 选择 → 复盘”闭环，让玩家在玩的过程中得到领导力启发。

### 5. yx3728/wechat-roguelike-demo
- 地址：https://github.com/yx3728/wechat-roguelike-demo
- 模式：微信小游戏 roguelike，强调随机内容与反复重玩的循环。
- 借鉴点：训练模式每局使用随机种子，让练习不会每盘相同。

### 6. nobody174/Dungeon-clicker-9000
- 地址：https://github.com/nobody174/Dungeon-clicker-9000
- 模式：浏览器单机点击/放置游戏，通过成就与成长反馈驱动重复游玩。
- 借鉴点：为每个小游戏加入成就、路线分支与难度解锁，让玩家愿意反复挑战。

## 本仓实现

- 决策棋：5×5 棋盘竞速，移动即收集信任/影响力/资源，到达目标或回合结束比较得分。
- 博弈推演：合作/竞争重复博弈，用可预测的 AI 策略演示信任积累。
- 资源分配：四领域预算分配，均衡覆盖与重点倾斜都要取舍。
- 团队管理：成员能力与任务需求匹配，管理精力与得分。
- 危机指挥：高压事件中的专家/稳妥/冒险选择，实时反馈信任、精力与影响力变化。
- 每个游戏都有教学、训练、对战模式；对战模式结果写入存档并发放领导力成长奖励。
- 教学模式改为逐步新手引导：先讲胜利条件，再分步骤讲规则，最后引导试玩。
- 训练模式使用随机种子生成不同棋盘/倍率/事件顺序，每盘都不相同。
- 难度 1~3 逐级解锁，胜利后解锁下一难度并记录每个游戏的成就与路线分支。
- 对局结束后展示完整复盘：每回合行动、得分、路线与解锁成就。
