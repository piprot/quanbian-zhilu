# 公网部署指南

## 当前部署状态

- 2026-08-07：已部署 Railway，公网地址 `https://adaptive-ascent-server-production-018a.up.railway.app/`
- GitHub Pages 前端构建已注入 `wss://adaptive-ascent-server-production-018a.up.railway.app`
- Render 因 `api.render.com` 在当前网络不可用，保留为备用部署方案；Railway 步骤见 `RAILWAY_SETUP.md`

## 目标

把 WebSocket 服务端部署到 Render，并让 GitHub Pages 前端连接公网服务器。

## 前置条件

1. 一个 Render 账号
2. 本仓库已推送 GitHub
3. Render 可以读取该 GitHub 仓库

## 步骤

1. 在 Render 中导入本仓库
2. Render 读取 `render.yaml`
3. 自动创建：
   - Web 服务
   - PostgreSQL 数据库
   - `JWT_SECRET`
4. 在 Render 服务中确认：
   - `DATABASE_URL`
   - `DATABASE_SSL=true`
   - `JWT_SECRET`
5. 在 Render 的 Deploy Hooks 中复制部署 Hook URL
6. 在 GitHub 仓库 Secrets 中配置：
   - `RENDER_DEPLOY_HOOK_URL`
7. 推送 `main`，CI 会自动触发：
   - GitHub Pages 前端部署
   - Docker 镜像构建
   - Render 服务重新部署

## 前端连接

构建前端时注入：

```bash
VITE_ROOM_SERVER_URL=wss://your-render-service.onrender.com
```

前端会通过 `src/net/roomClient.ts` 使用该地址。

## 验证

```bash
npm run test:server
```

本地通过后，再确认公网地址：

```bash
curl https://your-render-service.onrender.com/
```

返回 `ok` 即服务正常。

## Public verification after Render deploy

After the Render service is live, run these commands from the repo root:

- `npm run test:live` checks health, register, cloud save, leaderboard signature, and two-client match relay over the public WebSocket service.
- `npm run test:rtc:public` runs a desktop/mobile dual-context WebRTC duel against the public GitHub Pages frontend.