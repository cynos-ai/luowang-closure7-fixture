# 用户认证规格

## 已确定行为

1. 用户使用邮箱、昵称和至少 12 个字符的密码注册；邮箱标准化为小写并唯一。
2. 注册成功返回用户公开资料并创建 7 天 HttpOnly、SameSite=Strict Session。
3. 用户使用邮箱和密码登录；密码错误和不存在的邮箱使用统一错误信息。
4. `GET /api/auth/status` 返回当前是否登录和公开用户资料；没有有效 Session 时返回空用户。
5. `GET /api/me` 只对已登录用户返回资料，Session 失效时返回 401。
6. `POST /api/auth/logout` 撤销当前 Session 并清理 Cookie。
7. SQLite 只保存 Argon2id 密码哈希和 Session 的 SHA-256 摘要，不保存明文密码或原始令牌。
8. 认证写请求校验 Origin；注册和登录按客户端地址限流。
9. 已登录用户可以删除当前测试账号；用户行和全部关联 Session 原子删除，旧 Cookie 和原凭据随后均不可用。
10. 登录后刷新页面继续使用原 Session；恢复的用户 ID、邮箱和昵称与登录响应一致。

## API

- `POST /api/auth/register`：`{ email, displayName, password }`；成功 `201`。
- `POST /api/auth/login`：`{ email, password }`；成功 `200`。
- `POST /api/auth/logout`：撤销当前会话。
- `GET /api/auth/status`：读取当前会话状态。
- `GET /api/me`：读取受保护的当前用户资料。
- `DELETE /api/me`：删除当前测试账号及其全部 Session，并清理 Cookie。
- `GET /health`：读取服务和 SQLite 健康状态。

## 验收条件

- 新用户可以注册并被自动登录；
- 登录后刷新页面仍可通过原 Session 恢复同一用户，公开资料与登录响应一致；
- 退出后同一 Session 不能访问受保护 API；
- 重复邮箱、弱密码、无效邮箱和错误密码有明确失败响应；
- 测试账号删除后，旧 Cookie、原邮箱密码登录及数据库用户/Session 行均不可用；
- 测试、构建和端到端 smoke 全部通过。
