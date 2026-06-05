# 项目配置说明

本项目使用环境变量来配置敏感信息，**不要把真实密钥提交到 Git**。

## 前端（frontend）
- `npm install`
- `npm run dev`
- Vite 开发服务器默认端口 `5173`（占用时自动递增）

## 后端（backend-java）
- `mvn spring-boot:run`
- 默认端口 `8080`（可通过环境变量 `PORT` 覆盖）

### 需要配置的环境变量

复制 `frontend/application.example.yml` 为 `backend-java/src/main/resources/application.yml`，然后在环境变量中填入以下值：

| 环境变量 | 说明 |
| --- | --- |
| `DB_URL` | MySQL 数据库 JDBC 地址，如 `jdbc:mysql://localhost:3306/example_db?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=Asia/Shanghai` |
| `DB_USERNAME` | 数据库用户名 |
| `DB_PASSWORD` | 数据库密码 |
| `JWT_SECRET` | JWT 签名密钥（建议至少 32 字符） |
| `JWT_EXPIRES_SECONDS` | Token 过期时间（秒，默认 `86400`） |
| `OSS_ENDPOINT` | 阿里云 OSS Endpoint |
| `OSS_ACCESS_KEY_ID` | 阿里云 OSS AccessKeyId |
| `OSS_ACCESS_KEY_SECRET` | 阿里云 OSS AccessKeySecret |
| `OSS_BUCKET_NAME` | 阿里云 OSS Bucket 名称 |

### 默认管理员账号
- 用户名：`admin`
- 密码：`admin123`
