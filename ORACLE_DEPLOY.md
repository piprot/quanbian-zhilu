# Oracle Cloud Always Free ARM + Docker Compose 部署

> 静态版 / 在线版切换见 [STATIC_DEPLOY.md](STATIC_DEPLOY.md)。

这个方案替代 Railway：

- GitHub Pages 继续免费托管前端
- Oracle Cloud Always Free ARM 跑 Node WebSocket 服务 + PostgreSQL
- Caddy 自动申请 HTTPS 证书，提供 `wss://` 地址

## 架构

```text
浏览器 (GitHub Pages) -> wss://<domain> -> Caddy (80/443) -> server:8080 -> PostgreSQL
```

## 前置条件

1. Oracle Cloud 账号，并确认目标区域还有 Always Free ARM 名额
2. 一个域名，A 记录指向 VPS 公网 IP
3. GitHub 仓库 `piprot/quanbian-zhilu`

## 1. 创建 ARM 实例

- 区域：优先 Singapore / Osaka / Seoul；A1 名额紧张时换区域
- 镜像：Ubuntu 24.04 (ARM64)
- 形状：`VM.Standard.A1.Flex`，4 OCPU / 24 GB（Always Free 额度内）
- 公网 IP：分配临时或保留 IP
- 安全列表：放行 TCP 80、443（SSH 22 默认已有）

## 2. 配置 DNS

添加 A 记录：

```text
主机记录：@（或 www）
值：VPS 公网 IP
```

## 3. SSH 安装 Docker

```bash
ssh ubuntu@<ip>
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
sudo apt-get update && sudo apt-get install -y docker-compose-plugin
exit
```

重新登录后，`docker` 组才会生效：

```bash
ssh ubuntu@<ip>
```

## 4. 部署

```bash
git clone https://github.com/piprot/quanbian-zhilu.git
cd quanbian-zhilu
cp deploy/oracle.env.example .env
nano .env
```

生成随机值：

```bash
openssl rand -hex 24   # POSTGRES_PASSWORD
openssl rand -hex 32   # JWT_SECRET
```

把 `.env` 里的 `DOMAIN`、`POSTGRES_PASSWORD`、`JWT_SECRET` 填好，然后启动：

```bash
docker compose up -d --build
docker compose ps
curl https://<domain>/
```

健康检查应返回类似：

```json
{"status":"ok","db":true,"uptime":...}
```

如果 Caddy 一直申请不到证书，先检查 DNS 是否生效、80/443 是否在 Oracle 安全列表放行。

## 5. 迁移 Railway 旧数据（可选）

在有 Railway 数据库访问权限的机器上导出：

```bash
pg_dump "$RAILWAY_DATABASE_URL" --clean --if-exists --no-owner --no-privileges -f dump.sql
```

把 `dump.sql` 传到 VPS，然后在项目目录先只启动数据库并导入：

```bash
docker compose up -d db
docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < dump.sql
docker compose up -d
```

## 6. 切换前端

在 GitHub 仓库设置变量：

```text
VITE_ROOM_SERVER_URL=wss://<domain>
```

推送到 `main`，或手动触发 GitHub Actions；GitHub Pages 会用新地址重新构建前端。

## 7. 验证

本地从仓库根目录运行：

```bash
npm run test:live
npm run test:rtc:public
```

## 8. 关闭 Railway

确认新服务稳定后：

- 删除 Railway 项目
- 检查账单，确认不再产生费用

## Always Free 注意事项

- ARM 实例属于 Always Free 额度，但长期闲置可能被 Oracle 回收，建议保留轻量 keepalive 或保持一定访问量
- 数据库和证书数据都在 Docker volume 里，重装容器不会丢数据
