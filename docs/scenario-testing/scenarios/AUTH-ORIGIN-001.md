---
id: AUTH-ORIGIN-001
name: 认证写请求校验 Origin
description: 验证携带非本站 Origin 的注册/登录写请求被 403 拒绝且无副作用，同源写请求不被误拒
status: draft
tags:
  - core
  - module:认证
  - flow:拒绝路径
---

## 目的

确认规格行为 8「认证写请求校验 Origin」：对以 `/api/` 开头的写请求（POST/PUT/PATCH/DELETE），当请求携带的 Origin 不是本站来源时被拒绝（`403 ORIGIN_FORBIDDEN`「请求来源未被允许」），且拒绝不产生副作用（不创建账号、不建立 Session）；同源写请求不被误拒，正常进入业务逻辑。

## 依据

- 规格：`docs/changes/cynos-website-auth/spec.md` 行为 8「认证写请求校验 Origin」。
- 实现：`src/server/app.ts` `preHandler`（`isWriteMethod(request.method) && request.url.startsWith('/api/')`）与 `isAllowedOrigin`：无 Origin 头放行；配置 `CYNOS_ALLOWED_ORIGIN` 时要求精确相等；未配置时要求 `origin === ${protocol}://${host}`；否则抛 `AppError('ORIGIN_FORBIDDEN', '请求来源未被允许', 403)`。
- 代码层旁证：`tests/auth.test.ts` 以 `app.inject` 断言 `Origin: https://evil.example.test` 的登录请求返回 `403 ORIGIN_FORBIDDEN`（非浏览器运行时证据）。
- 运行时侦察（execution.md，本 Run）：同源（`Origin: http://closure7-special-target:3100`）登录写请求未被 403 误拒（返回 `401 INVALID_CREDENTIALS`）；跨站 opaque Origin（`Origin: null`）的注册与登录写请求均返回 `403 ORIGIN_FORBIDDEN`，且未创建账号、未建立 Session。

## 前置条件

- 独立的非生产测试环境（隔离数据目录，账号可删除）；
- 浏览器允许第一方 Cookie；
- 具备可从非本站来源发起写请求的受控能力（Playwright 请求层或等价的非预检投递方式）。

## 步骤

1. 在用户中心页面（同源）发起写请求（例如用不存在邮箱登录），记录其 `Origin` 头与服务端响应。
2. 从非本站来源（opaque origin）以 CORS-safelisted 内容类型（`text/plain`）表单 POST 向 `POST /api/auth/login` 发起跨站写请求（不存在邮箱，避免副作用），记录状态码、`error.code`、`error.message`、`requestId` 与 `Origin` 头。
3. 以同样方式向 `POST /api/auth/register` 发起跨站写请求，邮箱使用 `luowang-<RunID>-` 前缀标记。
4. 每次跨站写请求后复核 `GET /api/auth/status` 仍为未登录、无 Session；并核验被拒注册的邮箱未被创建（可用同源登录该邮箱返回 401 佐证）。
5. 清理：若因误放行创建了标记测试账号，登录后删除并核验不存在。

## 期望

- 同源写请求不被误拒：服务端不返回 403，进入业务逻辑（不存在邮箱登录返回 `401 INVALID_CREDENTIALS`）。
- 跨站 Origin 的注册写请求被拒：`POST /api/auth/register` 返回 `403`，`error.code = ORIGIN_FORBIDDEN`，`error.message = 请求来源未被允许`，且未创建账号、未建立 Session。
- 跨站 Origin 的登录写请求被拒：`POST /api/auth/login` 返回 `403 ORIGIN_FORBIDDEN`，且未建立 Session。
- 拒绝后无副作用：`GET /api/auth/status` 仍为 `{authenticated:false,user:null}`，无新 Cookie。

## 需要记录

- 同源与跨站写请求的方法、URL、`Origin` 头、状态码、`error.code`、`error.message`、`requestId`；
- 每次拒绝后的会话状态（未登录、无新 Session）；
- 被拒注册邮箱未被创建的佐证；
- 数据清理结果。

## 状态说明

候选为 `draft`：规格行为明确，但浏览器运行时证据尚不完整——本轮侦察仅观察到 `Origin: null`（opaque）跨站写请求被拒；具名跨站 Origin（如 `https://evil.example.test`）受受控工具集限制（无自定义请求头/路由能力）未能于浏览器层构造，仅由 `tests/auth.test.ts` 代码层断言承载；无 Origin 头写请求与 `CYNOS_ALLOWED_ORIGIN` 配置分支亦未观察。待具备可设置请求头的受控 HTTP 客户端能力并完成正式场景执行、人工 review-all 审核后再定级。
