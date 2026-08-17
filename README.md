# 升维 · Ascend

面向高管教练业务的在线 1v1 领导力情境游戏。玩家在真实职场情境中做决策，通过主线剧情、支线任务和 1v1 对决，训练识人、用人、驭人、谋权、掌权、固权与自我进化能力。

[![CI](https://github.com/piprot/quanbian-zhilu/actions/workflows/ci.yml/badge.svg)](https://github.com/piprot/quanbian-zhilu/actions/workflows/ci.yml)

## 游戏特性

- 9 章权力架构、81 个主线情境（18 核心 + 63 扩展）、9 个支线任务、9 段章节复盘
- 章节推进需完成全部 9 个主线情境，星级门槛按章节规模缩放
- 3 条支线剧情弧：信任重建、韧性组织、权力边界，带连续解锁与结局
- 10 项领导力能力与 6 级成长体系
- 30 题能力基线测评，生成个性化初始能力档案
- 三套角色独立选项集：空降、创业、高潜各自拥有独立措辞、说明与反馈
- 能力基线报告：优势能力、待提升能力、角色开局建议
- 情境高尔夫式专家基准评分
- 章节经济曲线：难度 × 章节双重缩放，消耗随九章推进逐步收紧
- AI 陪练、本地双人、WebRTC 远程 1v1
- 1v1 押注情报：AI 画像风格倾向、对手历史回合分布与概率提示
- 程序化权力关系沙盘与情境局势图
- Web Audio 程序化音效与氛围声
- 本地存档、能力雷达图、复盘报告
- 跨设备存档链接：一键编码完整进度，打开链接即可恢复
- 复盘报告可导出 Markdown，便于教练归档与一对一复盘
- 段位认证：达到破局者及以上在报告中显示认证通过
- 近期对决记录：存档保存对手、比分、胜负与时间
- 情境教练提示、正反馈与连续专家判断反馈
- 当日行动任务：每日 3 个可领取奖励的成长目标
- 自适应 AI 难度与弱项针对性提示
- 随机事件：主线地图出现 20 个动态职场情境
- 多语言基础界面切换、移动端安全区与读屏状态
- 声音设置持久化、排行榜按能力等级计分、云端同步冲突保护
- 成就墙：章节、支线、测评、1v1 与段位目标追踪
- 人物关系图：主线与支线 NPC 的关系状态追踪
- GitHub Pages 自动部署
- PWA：应用图标、安装清单与离线缓存 Service Worker
- 服务端骨架：房间、自动匹配、账号、云存档、排行榜、WebSocket 信令
- 服务端生产化：PostgreSQL 存储、Dockerfile、Render 一键部署配置
- Render 自动部署：配置 `RENDER_DEPLOY_HOOK_URL` 后推送 main 自动触发
- 报告页云端同步/载入/排行榜：可直接连接本地或已部署房间服务器
- 1v1 大厅云端自动匹配：连接服务端后自动开房并转发回合
- 教练端批量对比：`npm run coach:export -- <存档文件...>`
- 角色数据级分支：关键选择可进入对应角色专属分岔节点

## 本地运行

```bash
npm install
npm run dev
```

打开 http://localhost:5173

## 构建与测试

```bash
npm run build
npm test
npm run audit
npm run content-audit
npm run i18n-audit
npm run test:i18n-browser
npm run test:device-screenshots
npm run test:rtc
npm run test:server
npm run deploy:check
```

`npm test` 会自动启动 Vite，并完成建档、主线情境、AI 1v1 全流程冒烟验证；`npm run audit` 会检查桌面/手机全页面布局与控制台错误；`npm run content-audit` 会检查章节、情境、选项、情报、角色变体与能力数据完整性；`npm run i18n-audit` 会检查全部剧情节点、NPC、成就、测评、能力与每日挑战的英文覆盖；`npm run test:i18n-browser` 会验证英文随机事件和角色分岔的真实渲染；`npm run test:device-screenshots` 会生成 720x1280 / 1080x2400 中英文关键页截图；`npm run test:rtc` 会在两个本地浏览器页面之间完成 WebRTC 远程对局；`npm run test:server` 会启动服务端并验证注册、云存档、排行榜、自动匹配与回合转发；`npm run deploy:check` 会检查 Render/Docker/CI 部署前置条件。

## 远程对战

1. 创建方点击“远程对战 > 创建房间”，复制邀请码
2. 对方点击“加入房间”，粘贴邀请码并生成应答码
3. 创建方粘贴应答码并点击“完成连接”
4. 双方通过 WebRTC 数据通道同步回合选择

## 启用在线能力

1. 部署服务端（`render.yaml` 或 `railway.toml`），确认 `/health` 返回 200。
2. 在 GitHub 仓库 Settings > Secrets and variables > Actions 设置 Variables：
   - `VITE_ENABLE_ONLINE=true`
   - `VITE_ROOM_SERVER_URL=https://your-server.example`
3. 推送 `main` 触发 CI 在线构建；1v1 大厅会自动探测 `/health`，服务端不可达时“开始匹配”显示为“未连接”并保持禁用。

## 项目结构

- `src/core/types.ts`：领域类型
- `src/core/abilities.ts`：能力谱系、角色、成长
- `src/core/story.ts`：九章剧情与情境数据
- `src/core/game.ts`：存档、决策、评分、进度
- `src/core/duel.ts`：1v1 引擎与 AI
- `src/net/rtc.ts`：WebRTC 手动信令
- `src/ui/App.ts`：游戏界面与状态路由
- `scripts/smoke.mjs`：端到端冒烟测试

## 文档

- [PRD.md](./PRD.md)
- [PROJECT_PLAN.md](./PROJECT_PLAN.md)
- [REQUIREMENTS_TRACEABILITY.md](./REQUIREMENTS_TRACEABILITY.md)
- [NARRATIVE_PLAN.md](./NARRATIVE_PLAN.md)
- [CONTENT_PIPELINE.md](./CONTENT_PIPELINE.md)
- [BACKEND_PLAN.md](./BACKEND_PLAN.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [TRANSLATION_STATUS.md](./TRANSLATION_STATUS.md)
- [DEVICE_QA.md](./DEVICE_QA.md)
- [CODEX_HANDOFF.md](./CODEX_HANDOFF.md)

## 当前状态

- 完整版开发中：不再按 P0/P1/P2/P3 划分最小闭环，目标是可发布、可长期运营的完整游戏
- 单机与本地双人闭环：主线、支线、随机事件、角色分支、能力成长、报告、成就、AI/本地 1v1 已可用
- 在线服务端：房间、自动匹配、账号、云存档、排行榜、WebSocket 信令已实现并通过本地测试；当前静态构建明确标注在线能力为锁定态，手动邀请码远程对战可用
- 内容与多语言：81 个主线情境、支线、随机事件、角色分岔、NPC、成就与测评均已通过 i18n 审计；少量边缘文案随迭代继续补充
- 发布验收：CI、GitHub Pages、PWA、Docker、Render 配置已就绪，仍待真机与公网双端验收
