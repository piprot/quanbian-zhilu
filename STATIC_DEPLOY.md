# 静态版 / 在线版构建说明

## 两种构建

- 静态版（默认）：`VITE_ENABLE_ONLINE=false`，云端按钮隐藏；AI 陪练、本地双人、手动邀请码远程对战都可用；进度只存 localStorage。
- 在线全量版：`VITE_ENABLE_ONLINE=true`，需要先部署后端并配置 `VITE_ROOM_SERVER_URL`。

## 本地构建

```bash
npm run build            # 默认静态版（读 .env.production）
npm run build:static     # 显式静态版（读 .env.static）
npm run build:online     # 在线版（读 .env.online，需同时注入 VITE_ROOM_SERVER_URL）
```

## GitHub Pages CI

仓库默认按静态版构建。要切在线版：

1. 在 GitHub 仓库 Variables 设置 `VITE_ENABLE_ONLINE=true`
2. 设置 `VITE_ROOM_SERVER_URL=wss://你的域名`
3. 重新推送或触发 GitHub Actions

## 静态版说明

- 账号、云存档、云端排行榜、云端自动匹配入口会隐藏
- 手动邀请码远程对战不需要服务器，仍可用
- 请提示玩家定期导出存档，浏览器清理缓存会丢失进度
