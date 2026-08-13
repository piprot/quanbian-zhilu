# GitHub 参照项目评估

## 评估结论

在开始实现前，我搜索并评估了以下可直接下载运行或可复制的开源项目：

| 项目 | 地址 | 可运行性 | 可参照点 |
| --- | --- | --- | --- |
| NOT HERE | https://github.com/erichare/not-here | 可运行：`pnpm install` 后运行 web/CLI | 分支剧情引擎、事实账本、关系轴、多结局、无数字角色状态 |
| Wolfcha | https://github.com/oil-oil/wolfcha | 可运行：`pnpm install` + `.env.local` + `pnpm dev` | AI 狼人杀、阵营目标、隐藏角色、投票与局势变化 |
| OpenSuspect | https://github.com/opensuspect/opensuspect-legacy | 早期版本，需 Godot | 多人社交推理、任务/破坏/投票机制 |
| NEA | https://github.com/nusnlp/nea | 可训练但需 ASAP 数据集 | 自动作文评分，可用于开放摘要质量评分思路 |
| Game-Economy-Simulation | https://github.com/eddableheath/Game-Economy-Simulation | Python 脚本 | 资源生产/消耗/通胀控制建模 |

## 融入方式

1. **隐藏章节**：参照 NOT HERE 的确定性故事图与多结局，为能力隐藏路线增加真实节点和结局状态。
2. **阵营机制**：参照 Wolfcha 的阵营目标与隐藏信息，为试炼加入信任/怀疑数值和背叛选择。
3. **开放作答**：参照 NEA 的自动评分思路，使用轻量关键词、长度、结构、步骤评分，不引入重型模型依赖。
4. **资源经济**：参照 Game-Economy-Simulation，设计“生产/消耗/扩建”三阶段资源循环。
5. **远程对局**：保持轻量 WebSocket/WebRTC，自行扩展预判协议，不引入不可控的重型多人框架。

## 决策

- 不直接引入重型 AI 模型，避免让浏览器版失去离线可玩性。
- 不直接替换现有引擎，优先用这些项目的设计原则做本地化落地。

## 2026-08-09 补充检索（第二批次）

在进一步做分支、事件与中期分叉前，补充检索并参照以下开源项目：

| 项目 | 地址 | 可参照点 |
| --- | --- | --- |
| ChoiceScript | https://github.com/dfabulich/choicescript | 多选叙事语言、条件分支、持久存档与统计收集，适合参考“选项即数据”的表达方式 |
| Parchment | https://github.com/curiousdannii/parchment | 交互小说 Web 播放器，保存/恢复与跨页面状态一致性 |
| Undum | https://github.com/idmillington/undum | “情境（situation）”节点模型、可叠加特质（qualities）、存档格式，与当前主线/支线/分支节点模型同构 |
| Fungus | https://github.com/snozbot/fungus | 带立绘与音效的叙事流编排，佐证“章节背景 + 角色立绘 + 分轨音频”的呈现结构 |
| Jonathan-Havener/LeadershipGame | https://github.com/Jonathan-Havener/LeadershipGame | 领导力主题游戏仓库，用于对照同类题材的关卡与决策呈现 |

落地取舍：

- 分支手写化沿用 ChoiceScript 的“选项文本 + 条件效果”思路，但保留当前 `branchVariantFor` 按章节/品质回落机制，避免新增运行时依赖。
- 随机事件池参照 Undum 的“情境 + 特质”模型，把角色与难度档做成事件池过滤条件，并用事件周期计数制造二周目差异，而不是简单清空列表。
- 中期分叉采用“路线检查点节点”：第 4/7 章选择路线后进入专属分叉节点，分叉选项继续影响后续事件权重与结局复盘，落实 NOT HERE 的确定性故事图思想。

## 2026-08-09 第三批次补充检索（体验打磨）

针对难度档位、关系沙盘、角色试玩、成就墙与狼人/三国试炼五类问题，补充参照以下开源项目：

| 项目 | 地址 | 可参照点 |
| --- | --- | --- |
| relation-graph | https://github.com/relation-graph/relation-graph | 关系图节点的实时更新、选中高亮、图例与可交互编辑，用于把首页权力沙盘从静态装饰变成“看得懂、会变化、可操作”的图谱 |
| xiong35/werewolf | https://github.com/xiong35/werewolf | 线下狼人杀网页的角色行动、线索揭示与裁决流程，用于给试炼的“指认嫌疑人”补上场景、影响与真相揭晓闭环 |
| SteamAchievementManager | https://github.com/gibbed/SteamAchievementManager | 成就的稀有度、获取时间与完成进度管理，提示收藏感来自“可见状态 + 稀有度 + 记录” |
| GitHub-Achievements | https://github.com/drknzz/GitHub-Achievements | 成就有等级、说明与进度，解锁前后都有可收藏的视觉差异 |
| Trizbort | https://github.com/JasonLautzenheiser/trizbort | 交互叙事的地图/场景标注，用于把关系沙盘和试炼场景画成有地点、有局势的结构 |

落地取舍：

- 难度档位不再只写存档：选择后立即刷新状态说明、影响剧情回合计时/资源缩放，并同步到试炼精力与对决回合计时，让玩家在下一次决策前就能看到差异。
- 首页关系沙盘改为动态图：节点与连线由 `npcRelation` 实时生成，展示已建立/存在线索/尚未接触三种状态，并随最近决策显示变化摘要；点击节点可进入人物关系页。
- 首章试玩与角色选择强绑定：试玩按钮显示“将以当前角色开局”，默认选中第一个角色卡，切换角色后预览文本与章节角色变体同步更新。
- 成就墙升级为“成就图鉴”：增加稀有度、分类、解锁时间与收藏夹，未解锁成就显示可收集目标，解锁成就展示剧情钩子文案。
- 狼人/三国试炼补齐“场景 → 指认 → 影响 → 真相揭晓”：每个阶段增加场景与最终解答文案，指认结果写入试炼结算与局势条，避免选择后无反馈。
