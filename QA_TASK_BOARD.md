# QA 任务书

## 负责人

- 制作人/项目经理：Codex
- 主策划：Codex
- 程序：Codex
- QA：Codex
- 验收：Codex

## 任务映射

| # | 问题 | 任务 | 状态 |
| --- | --- | --- | --- |
| 1 | 服务端未公网部署 | 完成部署文档、Render 配置、部署工作流 | 已部署 Railway：adaptive-ascent-server-production-018a.up.railway.app 健康检查通过 |
| 2 | 4 小时内容不稳 | 扩充随机事件、分支与挑战模式 | 已完成内容扩充：20 随机事件、27 手写角色分支、挑战模式；待长时间试玩稳定性验证 |
| 3 | 角色选项模板化 | 建立手写内容管线与重复度检测 | 已完成：第 1-9 章手写角色分支 |
| 4 | 随机事件太少 | 扩池、权重、前置、NPC/结局影响 | 已达成：20 个事件、权重、前置、结局影响 |
| 5 | 多语言不完整 | 扩展翻译与审计 | 已完成：content/i18n 审计全绿；真机读屏标注待真机验收 |
| 6 | 无新手引导 | 已加首局引导 | 已完成 |
| 7 | 主线无难度 | 增加高压模式 | 已完成 |
| 8 | 声音设置不持久 | 已持久化 | 已完成 |
| 9 | 云同步无条件覆盖 | 已加冲突选择 | 已完成 |
| 10 | 排行榜不公平 | 改为能力等级分 | 已完成 |
| 11 | Token 明文 | 已加 HMAC 签名 | 已完成 |
| 12 | 无剧情回顾 | 增加局势摘要 | 已完成 |
| 13 | 真机未验证 | 真机清单与截图脚本 | 部分完成：自动化矩阵全绿；真机人工验收待做 |
| 14 | 无障碍不完整 | 扩展 aria 与焦点 | 进行中：axe 与设备矩阵全绿；真机 VoiceOver / TalkBack 验收待做 |
| 15 | 数据模型混淆 | 支线/分支/随机已拆分 | 已完成 |
| 16 | 随机事件无后续 | 已加入报告与结局影响 | 已完成 |
| 17 | 奖励不吸引 | 增加成就/解锁/挑战奖励 | 已完成：成就解锁即时提示 |
| 18 | 重玩惊喜不足 | 增加挑战模式/随机序列 | 已完成：7 回合挑战赛、36 随机事件、角色分支、章节全 9 情境推进 |
| 19 | 无教练批量对比 | 报告导出已单人，批量待做 | 已完成：`npm run coach:export` |
| 20 | JSON 降级风险 | 生产强制 PostgreSQL | 已完成 |

## 验收

全部任务完成后执行：

```bash
npm run build
npm test
npm run audit
npm run content-audit
npm run test:server
```

## 2026-08-07 release status

- GitHub main pushed to `15a3764`; `gh` auth is valid; hosts file now bypasses the local GitHub DNS hijack.
- GitHub Pages is live at `https://piprot.github.io/quanbian-zhilu/`; Actions queue/OIDC deploy failures were transient and reruns are queued.
- Render service is not deployed yet. Import `piprot/quanbian-zhilu` with Render Blueprint to create `adaptive-ascent-server` + `adaptive-ascent-db`.
- New acceptance scripts: `npm run test:live` and `npm run test:rtc:public` cover public server health/account/rank/match and public dual-context WebRTC after deployment.
## 2026-08-06 GitHub incident

GitHub Status reported `Actions: major_outage` and `Pages: major_outage` at 2026-08-06 17:54 UTC. Queued runs are external and should be rerun after GitHub Status recovers. Git push/API remained operational after FastGithub restart.
After GitHub Status recovers, run `npm run recovery:github` from the repo root to rerun and watch the latest CI automatically.
## 2026-08-07 recovery

GitHub Actions/Pages recovered. CI run `31133005719` for `19edd53` completed success; Pages returns 200. Render was the remaining release blocker before this Railway deployment.

## 2026-08-07 Railway deployment

- Render API is blocked on this network, so deployment switched to Railway.
- Railway service is live at `https://adaptive-ascent-server-production-018a.up.railway.app/`; health returns `{"status":"ok","db":true}`.
- GitHub variable `VITE_ROOM_SERVER_URL` now points to `wss://adaptive-ascent-server-production-018a.up.railway.app`.
- CI run `31149524606` completed success; the deployed GitHub Pages JS was verified to contain the Railway URL.
- `npm run test:live` PASS.
- `npm run test:rtc:public` PASS.
- Railway support was added in commit `4ccae3d` (`railway.toml` + `RAILWAY_SETUP.md`).

## 2026-08-09 外部评估对账（pasted-text-1/2，重复）

外部评估基于仓库代码（未访问线上），评分 6/10。逐条对账见 `docs/REVIEW_RESPONSE_2026-08-09.md`。

### 已落地（本轮）
- AI 陪练人格原型：executor / builder / gambler，影响选项偏好并在大厅与对局中显示风格标签。
- 复盘报告“教练追问”：按决策画像与资源状态生成 2-3 条可带进教练对话的追问。
- 1.5.4：角色专属标签、报告“洞察时刻”、1v1 结算“复盘讨论”、资源危机提示、升级反馈动效。

### 待办（V2）
- 1v1 博弈深化：策略暗牌+揭示、资源下注、信息战（用影响力购买对手偏好情报）。
- AI 心理战：思考时间模拟、虚张声势、历史战绩与风格标签前置展示。
- 资源危机事件：某项资源跌破阈值时强制进入支线危机。
- 程序化情境生成与真实案例投稿（UGC 飞轮）。
- 教练端：小组对比雷达、决策盲区热力图、工作坊同步推演模式。
- 视觉/音乐升级：关键情境与 NPC 插画、章节主题音乐、东方管理哲学配色。
- 真机用户测试：3-5 位高管/教练体验一章主线 + 1v1，记录停顿点。

> 多数 V2 项已在 1.7.38-1.7.40 落地：程序化情境外壳与 UGC、教练工作坊与实时推演、1v1 押注情报、章节经济曲线、NPC SVG 立绘、主题音乐等。仍待真机与公网服务端部署验收。

### 第三轮评估（7.0/10）新增/确认
- 已落地 1.5.5：预判加成显性累计、小组讨论引导、本周聚焦。
- 真机高管用户测试（含“是否愿意用于团队培训”验证）为最高优先级 P0。
- 程序化情境外壳（行业/规模/危机类型参数）与教练端工作坊 MVP 为下一里程碑。
- 报告卡片分享场景、外部权威认证背书、NPC 肖像与主题音乐继续保留 V2。

### 第四轮线上评估（4.5/10）对账

评估者进入线上站点后仅观察首屏即判定“按钮无响应/内容未实装”。线上实测与仓库证据均表明该结论不成立；同时定位到两个真实工程问题（章节美术 404、旧 SW 被 CDN 缓存），已在本轮修复。

#### 已修复 1.5.6
- 章节美术 404：`--chapter-art` 相对路径被 CSS 解析到 `assets/art/`，改为页面绝对 URL。
- 老访客缓存：SW 注册带版本号并 `updateViaCache: none`，更新接管后自动刷新一次。
- 首屏引导：新增“新玩家从这里开始”按钮与脉动提示；未建档能力值标注“初始基线”。
- 加载状态：首屏显示“升维 · 正在加载”指示，不再空白等待。

#### 在线复验证据（Playwright 实测线上）
- 创建档案 → 测评跳过 → 能力基线报告 → 进入主线 → 章节决策 → 1v1 大厅与对局入口全部可操作。
- 声音/语言切换即时生效；能力值与通关章数随存档更新；权力沙盘 Canvas 非空。
- 章节美术请求从 404 修复为 200。

#### 仍为 V2
- 真机高管/教练用户测试、程序化情境外壳与 UGC、教练端工作坊、视觉/音乐升级、1v1 暗牌/下注/信息战。

### 第五轮线上评估（2.5/10）对账

评估环境未执行 JavaScript，只读到旧静态 HTML 的标题与加载文字，因而判定为“概念页”。已新增无 JS/挂载失败也可读的完整静态回退页。

#### 已修复 1.5.7
- 静态回退页：`index.html` 预置玩法说明、9 大模块、内容规模、目标用户、预计时长、开始步骤与设备支持。
- 无 JS（`<noscript>`）直接展示回退页；脚本挂载失败 5 秒后自动隐藏加载层。
- 版本号升级为 1.5.7。

#### 复验要求
- 浏览器（启用 JS）：完整菜单与建档→测评→主线→决策→1v1 闭环不受影响。
- 无 JS/静态抓取：回退页包含完整模块与开始指引，不再是“只有标题和简介文字”。

### 刷新循环热修复（1.5.8）

线上用户反馈页面无限刷新/抖动。复现确认是 SW 注册每次加载带新时间戳导致 `controllerchange` → reload 循环。

#### 已修复
- SW 注册改为固定 `./sw.js` 地址并 `updateViaCache: none`，不再每次加载更换脚本 URL。
- 只有 SW 内容真正变化时才触发一次自动刷新。

#### 复验
- Playwright 持久化上下文连续 reload 3 次，无额外导航。
- 建档 → 测评 → 主线 → 决策 → 1v1 完整流程继续通过。

### 第六轮线上评估（1.5.9）

评估者仍以未交互/未执行 JS 的方式查看首屏，判定“无法操作”。本轮完成部署与控制台核验，并新增一键试玩入口。

#### 已落地 1.5.9
- 首屏「立即试玩第一章」：未建档时一键以空降管理者进入第一章。
- AudioContext 仅在首次用户手势后恢复，消除加载阶段控制台警告刷屏。
- 静态回退页补充一键试玩说明。

#### 复验证据
- 线上引用最新构建产物，部署无滞后。
- F12 控制台无报错；Playwright 全流程（建档→测评→主线→决策→1v1）可操作。

### 第三轮评估补强（1.5.10）

本轮处理第三轮 7.0/10 评估的 P0 项“1v1 博弈机制重构”，并按任务要求从 GitHub 检索同类项目参照。

#### 已落地
- 1v1 风格押注：押对手本轮风格（专家/稳健/冒险），命中 +20% 分数加成（至少 +2），结算页累计显示。
- 本地双人按当前出手玩家结算；远程对战在揭示后结算。
- GitHub 参照：OpenSuspect、prisoners-dilemma、free-prisoners、decision-lab，写入 `docs/RESEARCH_REFERENCE.md`。

#### 复验要求
- AI 1v1：押注命中时分数增长约 20%，结算页预判加成累计正确。
- 本地双人：玩家二押注命中加成计入玩家二分数。
- 远程 1v1：揭示后按双方风格结算，无重复加分。

### 完整通关评估（8.3/10，1.5.11）

评估者完整实测建档 → 测评 → 主线 → 试炼 → 修炼 → 1v1 → 能力图谱。本轮处理 P0 三项。

#### 已落地
- 修炼任务评分反馈：提交后 toast 显示得分/命中关键词/奖励，未达标提示补写。
- 1v1 回合揭晓：新增本回合比分面板（双方选项、得分、当前总分），停留约 2 秒。
- 章节通关说明：地图与首页明确“完成本章全部主线情境后才 +1”，章节详情显示主线进度 X/2。
- 支线锁定原因：显示具体前置节点标题或主线完成进度。
- 认证引导：报告页新增“认证点如何获得”按钮。

#### 复验要求
- 修炼提交：高分通过时 toast 含得分与命中关键词；低分时提示具体方向且不发放奖励。
- 1v1：每回合揭晓后先显示比分面板，再进入下一回合；最终结算页正确。
- 地图：完成 1 个主线情境后仍显示 0/9，但章节进度明确为 1/2；完成 2 个后首页 +1。

### 美术与音乐持续迭代（1.5.12）

#### 已落地
- 生成式环境音乐：场景专属和弦/低音/琶音/随机旋律层，音乐音量通道独立生效。
- 章节背景图整批重绘 + `npm run generate:art` 再生成管线。
- 页面低对比网格纹理与段位面板金色顶边。

#### 复验要求
- 设置中音乐音量调整真实影响环境音乐。
- 地图/剧情页章节背景图正常加载（200），生成器可重复执行。
- 页面无横向溢出、axe 无违规、控制台无报错。

### 美术与音乐第二轮迭代（1.5.13）

#### 已落地
- 音乐情绪段落：明亮/沉暗交替 + 滤波器扫频 + 高音 shimmer。
- 角色立绘重绘并纳入 `npm run generate:art`。
- 按钮/卡片/沙盘/场景边框交互质感，`prefers-reduced-motion` 支持。

#### 复验要求
- 生成器幂等：连续运行两次产物一致（内容仅依赖常量模板）。
- 角色立绘与章节背景图 200；页面悬停/按下状态不改变布局尺寸。
- 开启“减少动态效果”时动画被禁用且无横向溢出。

### 程序化情境外壳 MVP（1.5.14）

评估 7.5/10 的 P0 项：主线情境一次性消费。已实现“外壳可变、决策结构不变”的 MVP。

#### 已落地
- `src/core/scenarioShell.ts`：行业 × 团队规模 × 危机类型参数化外壳。
- 剧情页显示中英双语“情境外壳”条；外壳随章节与游玩种子轮换。
- 单元测试覆盖确定性、跨章差异、双语非空。

#### 复验要求
- 同一种子/同章节外壳一致；不同章节外壳不同。
- 剧情页外壳条正常显示且不改变选项结构、评分与存档。
- 构建与全部审计通过，线上部署后外壳条可见。

### 第七轮完整性验证修复（1.5.15，2026-08-10）

针对 7.9/10 评审的 20 项短板完成 P0/P1 处理，并补充 GitHub 同类项目参照（见 `docs/RESEARCH_REFERENCE.md`）。

#### 已落地
- 本地双人每回合重置轮转；新增玩家一/玩家二移交提示与 3 回合双人 smoke 测试。
- 整局 `scenarioSeed`：建档时生成，情境外壳按章节稳定。
- 音量旧值归一化；视图切换滚动复位；EN 首页与段位名补齐。
- 条件成就写入存档；支线收集者文案修正为 9 节点。
- 高压/极限计时随文本长度动态加时；修炼任务失败提示缺失关键词。
- 章节路线即时预览；选项文案去重；移动端难度/随机事件不再折叠。
- 事件簿锁定标注、每日恢复说明、本地双人押注说明、成就墙补测直达、1v1 再来一局。

#### 验证
- `npm run build` PASS（TypeScript + Vite + SW）。
- `npm run test:unit` PASS（含 scenarioSeed/音量/动态时长/成就落档断言）。
- `npm test` PASS（含新增本地双人 3 回合流程）。
- `npm run audit` / `npm run test:features` / `npm run test:accessibility` / `npm run i18n-audit` / `npm run balance-sim` PASS。

#### 1.5.16 平衡调优
- 章节通过线 80 → 70；balance-sim 整局通关率 19.4% → 34.8%，中后期通过率回升到 88-89%。
- 星级阈值保持 200/150 不变，仅放宽一星门槛。

### V2 音频与位图美术正式接入（1.5.17，2026-08-10）

#### 已落地
- `GameAudioV2` 替换 `GameAudio`：五场景环境音乐、多层 SFX、动态过渡与混响/延迟/立体声生效。
- `ThemeMusic` 四乐章主题曲接入结局页，离开结局停止。
- `bg-main-menu.jpg`、`bg-victory.jpg`、`npc-*.jpg` 位图分别接入主菜单、结局页与人物关系卡。
- `eastern-theme.css` + `visual-upgrade-v2.css` 在 `main.ts` 中于现有样式之后加载。

#### 复验要求
- `npm run test:device-screenshots` 与 `npm run test:accessibility` 通过。
- 主菜单/结局背景图与 NPC 位图请求 200，控制台无报错。
- 移动端无横向溢出，动画在 `prefers-reduced-motion` 下关闭。

### 1.5.18 位图回退与实验模块处置
- NPC 位图失败自动回退首字头像，`npc-tang.jpg` / `npc-fang.jpg` 缺图不再裂图。
- `docs/V2_MODULES.md` 记录四个未接线模块的处置结论与复验命令。

### 教练工作坊正式接入（1.5.19，2026-08-10）
- 主菜单「教练工作坊」：演示小组 / JSON 存档导入 → 小组雷达、盲区、讨论引导、共识/分歧、成长轨迹、工作坊流程。
- 新增 `renderGroupRadar`、教练引擎单元测试与 smoke 工作坊流程。
- 验收：build/unit/smoke/audit/device-screenshots/a11y 全绿后推送部署。
