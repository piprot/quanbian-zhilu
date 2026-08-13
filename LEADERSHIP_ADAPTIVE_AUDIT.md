# 升维 · Ascend 领导力与自适应内容审查

## 审查范围与方法

从零开始逐项核对：

- 主线 18 节点、支线 9 节点、分支 27 节点、随机事件 20 个、选项 222 个的剧情与理论一致性。
- 每章“专家 / 部分有效 / 高风险”三档选项是否对应自适应领导力、技术性解决、权威或回避三种动作。
- 十项能力的训练是否真正做到“先教学、后测验”：公式、应用要点、举一反三例题、30 道测验题。
- 试炼 19 关是否具备能力门槛、精力消耗、计算题和失败代价。
- 自适应机制是否闭环：能力门槛、难度档、路线选择、随机事件权重、AI 对手强度、隐藏路线、对局快照、周常与无尽挑战。

自动化扫描：`npm run leadership-audit`（结构完整性与焦点能力错配检查）。

## GitHub 同类项目参照

本轮重新检索并参照：

- `nikkimehr/adaptiveleadership`：自适应领导力模拟，参照其“情境变化 → 诊断 → 干预”的分层。
- `Jonathan-Havener/LeadershipGame`：领导力决策游戏，参照“选择 → 后果 → 复盘”的闭环。
- `AndyFeegan/Situational-Leadership`：情境领导力四象限，用于校验“该指导还是该授权”的判断。
- `Abdulrahman-6811/leadership-assessment`：领导力自评，参照可迁移的测评与报告结构。

此前文档中已参照的 `coderogue`、`SENTENCE`、`CTAT`、`MathCog`、`masterylearning`、`LTP` 继续作为教学与成长循环的设计依据。

## 审计结论

### 领导力符合性

- 结构完整：74 节点、222 选项全部具备反馈与理论引用，无空效果、无缺失文案。
- 主线质量良好：专家项普遍符合“诊断、授权、把工作还回去、制度化”的自适应动作；部分项是技术性解决；风险项是权威或回避，符合 Heifetz 自适应领导力与《权经》九章框架。
- 发现 1 处结构性错配：第 6 章“越级汇报”的专家选项效果落在驭势/沟通上，与本章“掌权/结构”焦点不符。已修正为 `authority + structure`。

### 自适应特点

- 能力门槛按章节提高并灰显可见；难度档驱动资源缩放与回合时限；路线选择影响随机事件权重与结局复盘；AI 对手按玩家能力分布生成并按强度分级；训练包含公式与例题；对局快照支持续战。以上均已在代码与测试中确认。

## 本轮修改

1. `src/core/story.ts`：修正 `c6n2` 专家选项效果为 `authority:3, structure:2`。
2. `src/ui/App.ts`：
   - 每个选项结算新增“自适应领导力视角”，把专家/部分/风险显式翻译为“自适应动作 / 技术性解决 / 权威或回避”，并给出下一步建议。
   - 报告页新增领导力画像：自适应 / 技术性 / 权威·回避三档计数与解释。
3. `src/styles.css`：新增领导力视角与报告画像样式。
4. `scripts/leadership-audit.mjs`：新增可重复运行的领导力内容审计脚本（`npm run leadership-audit`）。

## 验证

- `npm run build` PASS
- `npm run leadership-audit` PASS（issueCount: 0）
- `npm run test:unit` PASS
- `npm run content-audit` PASS
- `npm run i18n-audit` PASS
- `npm test` PASS
- `npm run audit` PASS
- `npm run test:features` PASS
