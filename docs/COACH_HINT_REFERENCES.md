# 教练提示差异化设计参考

状态：2026-08-11。为修复“所有情境的教练提示内容相同”的问题，检索并参照以下 GitHub 项目后，新增 `src/core/coach-hints.ts` 生成引擎与 `scripts/coach-hint-audit.mjs` 全量回归审计。

## 参照项目

### 1. prabapro/decision-lab
- 地址：https://github.com/prabapro/decision-lab
- 模式：每个危机情境独立配置 `narrative / intel / options / reveal`，决策后给出情境专属的 `outcome`、`comparison`、`scoring`、`context`、`lesson` 六段反馈。
- 借鉴点：教练提示必须绑定具体情境文本与现场张力，而不是只按能力模板输出。

### 2. Kashee12345/coach-up
- 地址：https://github.com/Kashee12345/coach-up
- 模式：每个事件包含 `setup`（现场）、`choices`（选项）与逐选项 `feedback`，并用 `princ` 标明背后的教练原则；事件还挂载 `units` 映射到课程目标。
- 借鉴点：提示/反馈由“现场描述 + 选项后果 + 教练原则”组成；同一原则在不同情境里要落到该情境的具体对象与取舍。

### 3. kevnb40-art/Scenario-Coach
- 地址：https://github.com/kevnb40-art/Scenario-Coach
- 模式：HRM 与管理场景的分步教练引导，先读现场再给行动建议。
- 借鉴点：提示应引导玩家“先判断局面张力”，再落到该选什么能力、该守什么资源。

### 4. wAImlim/zheng-he-leadership-simulation
- 地址：https://github.com/wAImlim/zheng-he-leadership-simulation
- 模式：把领导力评估放进具体历史航程情境，由场景行为反推领导风格。
- 借鉴点：评估与提示都要以情境为单位，避免脱离现场只讲抽象能力。

## 本仓实现

- `src/core/coach-hints.ts`：输入当前节点、存档、语言与情境种子，输出由“情境标题与现场摘要 + 危机/章节追问 + 本局最考验的能力 + 角色视角”组成的差异化提示。
- 主线情境使用 `scenarioShellFor` 的行业/团队规模/危机类型生成具体追问；支线、分支、随机事件按章节焦点追问。
- `scripts/coach-hint-audit.mjs`：对 159 个情境 × 3 角色 × 中英双语生成 954 条提示，逐条断言非空、长度合规、包含情境标题且全量唯一。
