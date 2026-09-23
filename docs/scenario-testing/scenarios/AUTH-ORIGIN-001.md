---
id: AUTH-ORIGIN-001
name: 认证写请求校验 Origin
description: 验证同源认证写请求被接受、未授权跨站 Origin 的注册与登录写请求被 403 拒绝且不产生账号或会话
status: draft
tags:
  - core
  - module:认证
  - flow:写请求来源校验
  - flow:拒绝路径
---

## 目的

确认规格行为「认证写请求校验 Origin」：对 `/api/` 下的认证写请求（注册、登录等 POST/PUT/PATCH/DELETE），来源同源时被接受，来源为未授权跨站 Origin 时被服务端拒绝（403 `ORIGIN_FORBIDDEN`），且被拒绝的写请求不会创建账号或建立 Session。

## 依据

- 规格：`docs/changes/cynos-website-auth/spec.md` 已确定行为 8「认证写请求校验 Origin；注册和登录按客户端地址限流」。
- 实现：`src/server/app.ts` 的 `preHandler` 对 `/api/` 写方法调用 `isAllowedOrigin`：无 `Origin` 头放行；配置了 `CYNOS_ALLOWED_ORIGIN` 时要求完全相等；否则要求等于 `${protocol}://${host}`；不匹配抛 `AppError('ORIGIN_FORBIDDEN', '请求来源未被允许', 403)`。
- 测试线索：`tests/auth.test.ts` 以跨站 `origin` 对登录断言 403 `ORIGIN_FORBIDDEN`（API 层 app.inject，本轮未运行）。

## 前置条件

- 独立非生产测试环境（隔离数据目录，账号可删除）；
- 具备对写请求设置或观察 `Origin` 请求头的能力：同源源由浏览器自动生成，跨站源需可构造携带自定义 `Origin` 的写请求（例如具备自定义请求头的受控请求能力，或独立跨来源页面）；
- 使用 run 标记的独立临时测试邮箱，运行结束回收。

## 步骤

1. 在应用源（同源）下经用户中心完成一次注册写请求 `POST /api/auth/register`，观察请求实际 `Origin` 是否等于应用源，响应是否为 201。
2. 以未授权跨站 `Origin`（与 `${protocol}://${host}` 及任何已配置允许源均不相等）对 `POST /api/auth/register` 发起写请求，观察响应状态与 `error.code`。
3. 复核该跨站注册请求之后：`GET /api/auth/status` 是否仍为未登录，且该邮箱未被创建（随后同源注册该邮箱仍可成功，或经查删接口确认不存在）。
4. 先在同源下使一个 run 标记账号存在；再以未授权跨站 `Origin` 对 `POST /api/auth/login` 发起写请求，观察响应状态与 `error.code`。
5. 复核该跨站登录请求之后 `GET /api/auth/status` 是否仍未登录、未建立新 Session。
6. 清理：用同源业务路径删除 run 标记账号，并核验其不存在。

## 期望

- 同源认证写请求被接受：`POST /api/auth/register` 返回 201，且请求 `Origin` 等于应用源；
- 未授权跨站 Origin 的注册写请求被拒绝：服务端 403 `ORIGIN_FORBIDDEN`，且不创建账号（`GET /api/auth/status` 未登录，该邮箱未被注册）；
- 未授权跨站 Origin 的登录写请求被拒绝：服务端 403 `ORIGIN_FORBIDDEN`，且不建立新 Session（`GET /api/auth/status` 未登录）；
- 拒绝不改变既有状态：被拒绝的写请求不产生账号或会话副作用；
- run 标记数据清理完成，清理后账号不可再登录。

## 需要记录

- 同源注册请求的 `Origin`（脱敏为「等于应用源」）与响应 201；
- 跨站注册/登录请求的 `Origin`（脱敏为「不相等的跨站来源」）、响应状态码与 `error.code`/`error.message`；
- 两类跨站请求后的会话状态与账号存在性；
- 数据清理结果（删除后核验账号不存在）。

## 状态说明

候选为 `draft`：规格行为 8 明确要求认证写请求校验 Origin，但本轮低风险侦察未取得显式跨站 `Origin` 的写请求（侦察环境无法对写请求设置自定义 `Origin`，`data:` 不透明来源上下文的受控提交未产生请求记录），因此「跨站 Origin 被 403 拒绝」目前仅有规格契约、实现与 `tests/auth.test.ts` API 层线索支持，尚无运行时观察；待 Runner 在可构造显式跨站 `Origin` 的受控环境下正式执行、并经 review-all 人工审核后再定状态。
