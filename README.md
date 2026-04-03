# Account Vault Manager

基于 **Next.js 16 + Ant Design + Prisma + MySQL** 的账号管理系统 MVP，用于安全保存网站账号、密码、备注和注册关联信息，并提供未来桌面客户端可复用的 API。

## MVP 功能

- 管理员登录与 Cookie 会话
- 账号条目增删改查
- 密码字段服务端 AES-256-GCM 加密存储
- 账号列表默认仅展示掩码密码
- 单独明文查看接口，便于未来补充审计逻辑
- `/api/auth/*` 与 `/api/accounts/*` 风格的 API

## 环境变量

创建 `.env` 文件并至少提供以下变量：

```bash
DATABASE_URL="mysql://user:password@127.0.0.1:3306/account_mgr"
APP_SECRET="12345678901234567890123456789012"
MASTER_KEY="<32字节密钥的base64编码>"
SESSION_COOKIE_NAME="account_mgr_session"
SESSION_TTL_HOURS="24"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="change-this-password"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

生成一个 32 字节的 `MASTER_KEY` 示例：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 启动方式

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

访问 `http://localhost:3000/login` 登录系统。

## 验证命令

```bash
npm run test
npm run lint
npm run build
```

## Docker 打包与 GitHub Actions 部署

仓库已提供以下部署基础文件：

- `Dockerfile`
- `.dockerignore`
- `deploy/compose.production.yml`
- `deploy/.env.production.example`
- `.github/workflows/docker-deploy.yml`

默认流程：

1. GitHub Actions 运行测试与构建
2. 将镜像推送到 `ghcr.io/<owner>/account-mgr`
3. 通过 SSH 在远端 Docker 主机上执行 `docker compose` 一次性 init（迁移 + 幂等 bootstrap）
4. init 成功后再启动应用容器

运行中的容器会通过 `/opt/account-mgr/.env.production` 注入运行时变量，**数据库地址 `DATABASE_URL` 也必须通过这里注入**，不要写进镜像、Dockerfile、compose 文件或 build args。

生产环境部署至少需要这些 GitHub Secrets（用于 SSH 发布）：

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `SSH_PRIVATE_KEY`
- `DEPLOY_PORT`（可选）

远端主机需预先准备：

- `/opt/account-mgr/.env.production`
- 已安装 `docker` 与 `docker compose`

其中 `/opt/account-mgr/.env.production` 需要包含运行时变量（例如 `DATABASE_URL`、`APP_SECRET`、`MASTER_KEY`、`ADMIN_EMAIL`、`ADMIN_PASSWORD` 等）。

可以从仓库中的 `deploy/.env.production.example` 复制出初始模板，再替换成真实值。

> 注意：生产迁移与初始引导由 `account-mgr-init` 一次性容器执行（`prisma migrate deploy` + 幂等 bootstrap）。应用容器本身不会在正常启动命令里执行 schema 变更。

## API 概览

- `POST /api/auth/login`：登录
- `POST /api/auth/logout`：退出登录
- `GET /api/auth/session`：读取当前会话
- `GET /api/accounts`：获取账号列表
- `POST /api/accounts`：创建账号
- `GET /api/accounts/:accountId`：读取账号详情
- `PATCH /api/accounts/:accountId`：更新账号
- `DELETE /api/accounts/:accountId`：删除账号
- `POST /api/accounts/:accountId?action=reveal`：显示明文密码

## 安全边界说明

- 明文密码不入库
- 列表页不返回明文密码
- 密钥仅保存在服务端环境变量
- 会话 token 只保存哈希值到数据库

你如果后面真要接桌面端，不要再另搞一套业务逻辑，直接复用 `src/lib/server/*` 里的服务层和现有 JSON API。
