# GitHub 参照项目借鉴落地矩阵

状态：2026-08-11。本文把此前调研过的 GitHub 项目、可直接借鉴的机制、落地位置与验证方式汇总成一张矩阵，便于后续迭代时快速判断“这条参照是否已经吸收、证据在哪里”。仅借鉴设计思路与交互模式，不复制代码或文案。

| 参照项目 | 借鉴机制 | 落地位置 | 验证方式 |
| --- | --- | --- | --- |
| basketball-iq-trainer | SM-2 间隔复习、错题回练、每日挑战、连续天数、徽章、领域进度 | `src/core/review-schedule.ts`、`src/core/challenges.ts`、`src/core/achievements.ts`、报告页「间隔复习 / 按能力复习看板」 | `test:unit`、`save-roundtrip`、Playwright 到期回练流程 |
| situational-judgement | JSON 驱动情境、选择即 outcome、倒计时、进度指示 | `src/core/story.ts`、`src/core/trials.ts`、`src/ui/App.ts` 回合计时 | `test:features`、`audit` |
| judgement_tests | best/worst 双轴选择、aria 标注、原生进度 | `src/core/review-schedule.ts`、`src/ui/App.ts` 双轴回练页 | `test:unit` 覆盖 `scoreDualAxis/worstOptionIndex`、Playwright 双轴流程 |
| zheng-he-leadership-simulation | 选择即画像、领导力人格 | 三角色路线、结局、复盘报告 | `role-audit`、`role-campaign-sim` |
| h5p-branching-scenario | 动态分支、多语言、内容与运行时分离 | `src/core/story.ts` 分支节点、`src/core/translations.ts` | `content-audit`、`i18n-audit` |
| claude-tutor | plan → study → quiz → review → repeat、90 天计划、复习看板 | `src/core/coach-plan.ts`、`src/core/review-schedule.ts` | `test:unit`、`coach` 页面 |
| Decision-Duel | 同时出牌、同时揭示、按结果计分 | 1v1 引擎 `src/core/duel-v2.ts`、预判揭示 | `test:features`、1v1 smoke |
| coach-platform | 教练交付层、学员数据与对话素材 | `src/core/coach-workshop.ts`、教练工作坊 | `test:system` |
| OpenSuspect | 隐藏信息、读人 | 1v1 风格押注与预判加成 | 1v1 结算面板、`test:features` |
| prisoners-dilemma / free-prisoners | 重复博弈、报复策略、同时结算 | 领导力游戏中心「博弈推演」、1v1 引擎 | `test:unit`、`test:features` |
| decision-lab | 危机情境、六段反馈、时间压力 | `src/core/leadership-games.ts` 危机指挥、结果页「六段式复盘」 | `test:unit`、Playwright 六段复盘流程 |
| Neural Essay Assessor / Automated Essay Scoring | 可解释评分、写作→评分→改进 | 修炼任务 `scoreOpenText`、textare 即时反馈 | `test:unit`、feature smoke |
| diminished-fifth / MarkovMusic | 程序化音乐、状态转移旋律 | `src/core/music-climax.ts`、`src/core/theme-music.ts` | `test:music` |
| procedural-svg-art | 参数化种子美术 | `scripts/generate-chapter-art.mjs` | `generate:art`、章节图片 200 |
| Arcade Design System / AETHER-HUD | 设计令牌、高端 HUD | `src/ui/visual-upgrade-v2.css`、`src/eastern-theme.css` | `audit`、axe |
| Procedural Narrative Generator / flask-madlibs | 模板化情境外壳、完整程序化叙事 | `src/core/scenarioShell.ts` 的 `proceduralNarrativeFor`、剧情页「程序化叙事」 | `test:unit` 叙事断言、Playwright 剧情页检查 |
| local hot-seat references | 本地双人回合归属与移交 | 1v1 本地模式 `hotSeatTurn/localPassed` | 3 回合双人 smoke |
| Communication-Training-Simulator | 可见验收标准 | 修炼失败 toast 缺失关键词 | `test:features` |
| dialogue-forge / if-player-react | 分支可维护、选项文案结构 | 分支节点与选项卡片 | `content-audit`、`leadership-audit` |
| Wordly | localStorage 持久化 | `src/core/game.ts` 存档系统 | `save-roundtrip` |
| scroll-restore example | SPA 滚动复位 | `App.show()` | `audit`、移动端检查 |
| coach-up / Scenario-Coach | 情境原则、分步引导 | `src/core/coach-hints.ts`、理论引用 | `test:coach-hints` |
| MilesFM/Cooperate、Hhhpraise tournament | 合作/竞争得分矩阵、重复回合 | `src/core/leadership-games.ts` 博弈推演 | `test:unit` |
| executive-evasion | 职场压力情境 | `src/core/leadership-games.ts` 危机指挥 | `test:features` |
| wechat-roguelike-demo | 随机种子与重玩 | `src/core/leadership-games.ts` 训练随机种子 | `test:unit` |
| Dungeon-clicker-9000 | 成就、难度解锁、成长反馈 | 领导力游戏中心成就/难度 1-3 | `test:features` |
| adaptive-mastery-learning-system | 按错误类型自适应、学习路径 | `src/core/coach-plan.ts`、个人教练卡 | `test:system` |
| 六维质量审计参照 | schema 校验、状态机、内容去重 | `scripts/content-audit.mjs`、`scripts/leadership-audit.mjs` | `content-audit`、`leadership-audit` |
| 外部评估 V2 建议（UGC） | 玩家/教练自定义情境、本地保存与试玩 | `src/core/custom-scenarios.ts`、主菜单「情境工坊」 | `test:unit`、Playwright 情境工坊流程 |
| UGC 回传 / 备份 | 自定义情境批量导出与导入 | `src/core/custom-scenarios.ts` 的 `export/importCustomScenarios`、情境工坊导出/导入按钮 | `test:unit`、Playwright 导出后重新导入 |
| coach-platform / decision-lab | 教练工作坊实时推演、小组同步决策与分布对比 | `src/core/coach-workshop.ts` 的 `LiveScenarioRunner`、教练工作坊「实时情境推演」 | Playwright 实时推演流程 |
| 上线前验收 | 12 视图导航、情境工坊创建、实时推演揭示 | `scripts/system-audit.mjs` | `test:system` |

## 使用原则

1. 借鉴的是机制与交互结构，不复制原仓库代码或受版权保护的文案。
2. 每项借鉴都有落地文件与自动化验证；没有验证的机制不计入“已落地”。
3. 后续迭代若发现某个机制仍只有文档没有实现，应回到本矩阵并补齐代码与测试。
