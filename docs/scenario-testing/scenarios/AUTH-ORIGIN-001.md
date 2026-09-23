---
id: AUTH-ORIGIN-001
name: 认证写请求校验 Origin
description: 验证同源认证写请求放行、跨站 Origin 写请求被 403 ORIGIN_FORBIDDEN 拒绝，且读请求不校验 Origin
status: draft
tags:
  - core
  - module:认证
  - flow:安全
  - flow:拒绝路径
---

## 目的

确认规格行为 8「认证写请求校验 Origin」：对 `/api/` 前缀下的写方法（POST/PUT/PATCH/DELETE），服务端在业务处理前校验请求 `Origin`；同源写请求放行，跨站 `Origin` 的认证写请求被拒绝（403 `ORIGIN_FORBIDDEN`），且该拒绝不建立会话；读请求不受该校验影响。

## 依据

- 规格：`docs/changes/cynos-website-auth/spec.md` 行为 8「认证写请求校验 Origin；注册和登录按客户端地址限流」。
- 实现（脱敏静态阅读，仅用于定位）：`src/server/app.ts` 的 `preHandler` 钩子在「写方法 + `request.url` 以 `/api/` 开头」时调用 `isAllowedOrigin`，不通过抛 `AppError('ORIGIN_FORBIDDEN', '请求来源未被允许', 403)`；`isAllowedOrigin` 语义为无 `Origin` 头→允许，否则与配置的 `allowedOrigin`（来自 `CYNOS_ALLOWED_ORIGIN`）或回退值 `${protocol}://${host}` 比较；`src/server/config.ts` 未设置 `CYNOS_ALLOWED_ORIGIN` 时 `allowedOrigin` 为 `undefined`。
- 运行时侦察（execution.md）：同源登录（`POST /api/auth/login`）与同源登出（`POST /api/auth/logout`）均携带匹配的 `Origin`（等于 `scheme://host`）并被放行（200）；`GET /api/auth/status` 读请求不携带 `Origin` 且返回 200；跨站 `Origin` 写请求在当前 fixture 环境中无法构造（详见文末缺口）。

## 前置条件

- 独立的非生产测试环境（隔离数据目录，账号可删除）；
- 一个已注册的可用测试账户；
- 能够在请求中显式设置 `Origin` 头的受控手段（浏览器页面内 fetch 无法伪造 `Origin`，需 API 层或受控请求上下文）。

## 步骤

1. 打开 Cynos 用户中心，用测试账户在同源页面正常登录，记录 `POST /api/auth/login` 的状态码与请求头 `Origin`。
2. 核对同源写请求的 `Origin` 值是否等于站点 `scheme://host`，确认请求被放行（200）。
3. 以跨站 `Origin`（例如示例第三方源）对认证写端点（`POST /api/auth/register`、`POST /api/auth/login`）发起写请求，记录状态码与 `error.code`/`error.message`/`requestId`。
4. 复核被拒请求未建立 Session：`GET /api/auth/status` 仍为未登录。
5. 以带跨站 `Origin` 的读请求（`GET /api/auth/status` 或 `GET /api/me`）复核读方法不触发 Origin 校验。
6. 完成测试数据清理（删除本轮创建的测试账号），并核验删除结果。

## 期望

- 同源认证写请求（携带与 `scheme://host` 一致的 `Origin`）被放行：`POST /api/auth/login` 返回 200，走业务成功路径；
- 跨站 `Origin` 的认证写请求被拒绝：返回 403 `ORIGIN_FORBIDDEN`（`error.message` 为「请求来源未被允许」）；
- 被拒绝的跨站写请求不建立 Session、不产生登录态（`GET /api/auth/status` 未登录）；
- 读请求（GET）不受 Origin 校验影响，返回正常业务响应；
- 测试数据清理完成。

## 需要记录

- 同源写请求的 `Origin` 头值与响应状态码；
- 跨站写请求的请求头 `Origin`、响应状态码与 `error.code`/`error.message`/`requestId`；
- 跨站拒绝后的会话状态（未登录、未建 Session）；
- 读请求的响应状态码；
- 测试数据清理结果。

## 覆盖缺口与状态说明

候选为 `draft`：跨站 `Origin` 写请求被 403 `ORIGIN_FORBIDDEN` 拒绝这一关键期望在当前 fixture 环境中尚无运行证据。侦察（execution.md）确认：

- 同源写请求放行（200）与读请求不校验 Origin 可运行时复现；
- fixture 仅在一个来源（`<host>:3100`）提供服务，无第二个可达来源；
- 不透明来源（`data:`）页面表单 POST 携带 `origin: null`，但在 Fastify 内容类型解析阶段即返回 415，早于 Origin 校验钩子；
- 页面内 `fetch`（no-cors/cors）无法伪造 `Origin` 且请求失败；`curl` 与 `node -e` 等命令被 Harness 拒绝，无法显式设置 `Origin`。

因此跨站拒绝路径需在具备可显式设置 `Origin` 的受控手段时才能验证；在取得该运行证据前，本场景保持 `draft`，不把未确认路径写成 `approved`。`tests/auth.test.ts`（`app.inject`）存在跨站 Origin → 403 `ORIGIN_FORBIDDEN` 断言，属 API 单元层线索，不代替运行证据。
