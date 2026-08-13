# Railway 部署指南

Render 登录接口在某些网络不可用，因此项目同时支持 Railway 部署。

> 当前状态（2026-08-07）：`adaptive-ascent-server-production-018a.up.railway.app` 已上线，公网验收通过。

## 前置条件

1. Railway 账号
2. 本仓库已推送到 GitHub
3. Railway 可以读取该 GitHub 仓库

## 部署步骤

1. 登录 `https://railway.app/login`。
2. 新建项目，选择 `Deploy from GitHub repo`。
3. 选择 `piprot/shengwei-game-starter`。
4. Railway 会读取根目录的 `railway.toml` 和 `Dockerfile` 并启动服务端。
5. 新建 PostgreSQL 数据库插件，确认 Web 服务环境变量：
   - `DATABASE_URL` 来自 PostgreSQL 插件
   - `DATABASE_SSL=true`
   - `JWT_SECRET` 使用一个随机长字符串
6. 等待首次部署完成，复制服务公网域名。
7. 在 GitHub 仓库设置变量：
   - `VITE_ROOM_SERVER_URL=wss://<你的服务域名>`
8. 重新推送 `main`，GitHub Actions 会用新地址重新构建 GitHub Pages。

## 验证

```powershell
curl.exe -k -sS "https://<你的服务域名>/"
```

返回 `ok` 后，从仓库根目录运行公网验收：

```powershell
npm run test:live
npm run test:rtc:public
```
