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

当前仓库已使用根目录的 `prisma.config.ts` 管理 Prisma CLI 配置。

- `prisma/schema.prisma`：数据库 schema 与 Prisma Client 生成配置
- `prisma/migrations`：迁移文件目录
- `prisma/seed.ts`：`npx prisma db seed` 实际执行的种子脚本

`npx prisma generate`、`npx prisma migrate dev --name init`、`npx prisma migrate deploy` 与 `npx prisma db seed` 都会读取这份配置。Docker 运行镜像也会携带 `prisma.config.ts`，以确保容器内的 Prisma CLI 行为与本地一致。

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
- `.github/workflows/docker-deploy.yml`

默认流程：

1. GitHub Actions 运行测试与构建
2. 使用 `linux/amd64` 构建 Docker 镜像
3. 将镜像推送到 `ghcr.io/<owner>/account-mgr`

当前仓库内置的 GitHub Actions 只负责 **构建、测试并发布镜像到 GHCR**，不会再通过 SSH 自动部署到你自己的服务器。

Prisma Docker 构建还会在 builder 阶段显式执行 `npx prisma generate`，并校验 `debian-openssl-3.0.x` 对应的 Query Engine 已经生成。这样可以尽早发现构建环境与运行环境不匹配的问题，而不是等容器启动后再报 Prisma engine 缺失。

镜像会推送到：

- `ghcr.io/<owner>/account-mgr:sha-<commit>`
- `ghcr.io/<owner>/account-mgr:latest`（默认分支）

运行中的数据库地址 `DATABASE_URL`、应用密钥等仍然应该通过你的运行环境自行注入，不要写进镜像、Dockerfile 或 build args。

如果你后续需要把 GHCR 镜像部署到自己的服务器、Koyeb、Railway 或其他平台，建议在各自平台的部署配置里单独处理运行时环境变量和数据库迁移。

如果你使用的是 TiDB Cloud、PlanetScale、云厂商托管 MySQL/Postgres 等 **启用 TLS 的数据库**，运行镜像还需要具备基础 TLS 运行时能力：

- 当前 `Dockerfile` 已在运行镜像安装 `openssl` 与 `ca-certificates`
- 如果数据库使用平台专用 CA 或私有 CA，还需要把根证书导入运行环境，或通过 `NODE_EXTRA_CA_CERTS` 指向额外的 CA PEM 文件
- 不要把关闭证书校验当成正式方案；应优先修复容器信任链和数据库 TLS 配置

对于只方便配置环境变量的部署平台，可以额外提供：

- `DB_CA_CERT_BASE64`：数据库根证书 PEM 文件的 base64 内容

容器启动时会自动把 `DB_CA_CERT_BASE64` 解码为 PEM 文件，并设置 `NODE_EXTRA_CA_CERTS`，用于 Prisma/Node 在 TLS 握手时补充信任链。生成 base64 的示例：

```bash
base64 -w 0 db-ca.pem
```

如果你在 Windows PowerShell 中生成：

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("db-ca.pem"))
```

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
