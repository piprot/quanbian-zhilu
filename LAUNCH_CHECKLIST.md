# 上线前 Checklist ·《权变之路》

> 2026-08-07 更新：公网服务已部署到 Railway，地址 `https://adaptive-ascent-server-production-018a.up.railway.app/`；以下 Render 流程保留为备选，当前部署步骤见 `RAILWAY_SETUP.md`。

> 目标：把 WebSocket 服务端部署到 Render，让 GitHub Pages 公网前端连上它。
> 本清单区分 **「仓库侧（已就绪，已核对）」** 与 **「需在 GitHub / Render 控制台操作」** 两类。
> 仓库侧全部完成后，剩下的只是控制台点击；找不点击项，公网闭环就差最后一步。

---

## 一、仓库侧（已就绪，已逐项核对 ✅）

| # | 项目 | 文件 | 状态 | 说明 |
|---|------|------|------|------|
| 1 | Render Blueprint | `render.yaml` | ✅ | 定义 web 服务 `adaptive-ascent-server` + Postgres `adaptive-ascent-db` + 自动生成 `JWT_SECRET`；注入 `DATABASE_URL` / `DATABASE_SSL=true` |
| 2 | 服务端镜像 | `Dockerfile` | ✅ | Render 用 `runtime: docker` 构建 |
| 3 | CI 注入房间地址 | `.github/workflows/ci.yml` → `build` | ✅ | 新增 `Inject room server URL` 步骤：优先读仓库 Variable `VITE_ROOM_SERVER_URL`，缺省兜底 `wss://adaptive-ascent-server.onrender.com` |
| 4 | 前端兜底地址 | `src/net/roomClient.ts:33` | ✅ | `import.meta.env.VITE_ROOM_SERVER_URL \|\| "ws://127.0.0.1:8080"`，构建时被 CI 注入覆盖为公网 `wss://` |
| 5 | CI 测试门禁 | `.github/workflows/ci.yml` → `test` + `deploy.needs` | ✅ | 新增 `test` job 跑 `test:server` / `test:unit` / `npm test`；`deploy` 改为 `needs: [build, test]`，测试不过不部署 |
| 6 | Pages 部署工作流 | `.github/workflows/ci.yml` → `deploy` | ✅ | 使用 `actions/deploy-pages@v4`，Source 须设为 *GitHub Actions*（见下） |
| 7 | Render 重新部署钩子 | `.github/workflows/render-deploy.yml` | ✅ | 监听 push `main` 触发 `RENDER_DEPLOY_HOOK_URL`（需填 Secret，见下） |
| 8 | 部署说明文档 | `DEPLOYMENT.md` | ✅ | 完整步骤说明 |

**核对结论**：仓库代码侧已无阻塞项。唯一会让公网前端连不上服务端的历史缺陷（CI 未注入 `VITE_ROOM_SERVER_URL`）已修复。

---

## 二、GitHub 仓库控制台（A/B 已完成 ✅，C 待 Render）

> 2026-08-06 已通过 GitHub API（`gh`）直接落地 A、B 两项，无需再手动点控制台。

### 0. GitHub CLI 重新授权（本机未登录时）

```powershell
gh auth login -h github.com -p https -w --skip-ssh-key --clipboard
```

完成后确认：

```powershell
gh auth status
```

### A. GitHub Pages 来源（必须）
1. 打开 `https://github.com/piprot/shengwei-game-starter/settings/pages`
2. **Source** 设为 **GitHub Actions**
3. 未设置时，`deploy` job 会跳过/失败，Pages 不会更新。

✅ **2026-08-06 已确认**：`gh api /repos/.../pages` 返回 `"build_type":"workflow"`，即 Source 已是 GitHub Actions，无需再操作。

### B. 仓库变量（推荐，可改 URL 无需改代码）
1. `Settings → Secrets and variables → Actions → Variables`
2. 新增：`VITE_ROOM_SERVER_URL` = `wss://adaptive-ascent-server.onrender.com`
3. 不设也能跑（CI 有兜底默认值），但设了之后换域名/服务名不用改 `ci.yml`。

✅ **2026-08-06 已写入**：`gh variable set VITE_ROOM_SERVER_URL --repo piprot/shengwei-game-starter --body "wss://adaptive-ascent-server.onrender.com"` 执行成功，`gh variable list` 已可见。

### C. 仓库 Secrets（Render 自动重部署用）
1. `Settings → Secrets and variables → Actions → Secrets`
2. 新增：`RENDER_DEPLOY_HOOK_URL` = <Render 控制台 Deploy Hooks 复制的 URL>
3. 不填则 `render-deploy.yml` 不会触发 Render 重部署（首次部署仍由 Blueprint 完成）。

⏳ **待 Render 导入 Blueprint 并创建 Deploy Hook 后回填**（见三·6）。此 Secret 的值只能从 Render 控制台拿到，无法用 API 预填。你复制好 Hook URL 后可直接贴给我，我用 `gh secret set RENDER_DEPLOY_HOOK_URL --repo piprot/shengwei-game-starter --body "<URL>"` 写入；或你自己填也行。

---

## 三、需在 Render 控制台操作（你来做 ⏳）

1. 登录 Render → **New → Blueprint** → 连接 `piprot/shengwei-game-starter` 仓库。
2. Render 读取 `render.yaml`，自动创建：
   - Web 服务 `adaptive-ascent-server`（Docker）
   - PostgreSQL `adaptive-ascent-db`
   - `JWT_SECRET`（自动生成）
3. 在 Web 服务 **Environment** 确认：
   - `DATABASE_URL` 已自动从数据库注入 ✅
   - `DATABASE_SSL` = `true` ✅
   - `JWT_SECRET` 已生成 ✅
4. **Manual Deploy** 触发首次构建（或用 Blueprint 自动部署）。
5. 部署完成后复制服务地址：`wss://adaptive-ascent-server.onrender.com`（与 CI 兜底一致）。
6. **Deploy Hooks** 页复制 Hook URL → 回填到 GitHub Secret `RENDER_DEPLOY_HOOK_URL`（见二·C）。

---

## 四、本地验收（已执行 ✅）

```bash
cd D:/Backup/Documents/shengwei/game-starter
npm ci
npm run test:server   # 服务端：register/cloud_save/leaderboard/match 往返
npm test              # 端到端：Playwright + Edge 走完整主线→1v1
npm run deploy:check  # Render/Docker/CI 部署前置条件自检
```

- `npm run test:server` 通过 = 服务端逻辑绿。
- `npm run deploy:check` 通过 = Render Blueprint、Dockerfile、CI 注入与生产守卫均就绪。
- `npm test` 通过 = 前端完整闭环绿。
- 另：`npm run test:unit` 为核心逻辑单测，`npm run audit` / `npm run content-audit` 为质量审计。

---

## 五、上线后注意（评审暴露的已知项）

- **Render Free 会休眠**：冷启动首个 ws 连接可能延迟数秒或短暂失败。生产建议升 **Starter** 计划，或加保活 ping。
- **公网服务端尚未真正部署**：以上步骤完成后才是「可用」，在此之前云端 1v1 / 云存档 / 排行榜对真实玩家不可用。
- **后端上线前必补**（见 `BACKEND_PLAN.md`）：token 刷新/限流/审计、数据校验增强、DB 迁移与备份、排行榜防刷。
- **多语言/真机验收/全量翻译**等仍依赖外部资源，不在本清单范围内（见评审文档 Issue 2/3/8/17）。

---

## 六、一键顺序（部署当天）

1. Render 导入 Blueprint → 等首次构建完成 → 记下 `wss://adaptive-ascent-server.onrender.com`
2. GitHub：Pages Source = GitHub Actions；加 Variable `VITE_ROOM_SERVER_URL`；加 Secret `RENDER_DEPLOY_HOOK_URL`
3. `git push` 到 `main` → CI 跑 build+test → 部署 Pages → 触发 Render 重部署
4. 打开 `https://piprot.github.io/shengwei-game-starter/` → 进入 1v1 → 确认能匹配/对战（说明已连上公网服务端）
5. `curl https://adaptive-ascent-server.onrender.com/` 应返回 `ok`
