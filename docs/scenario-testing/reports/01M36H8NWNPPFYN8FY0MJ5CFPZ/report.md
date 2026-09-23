---
run_id: 01M36H8NWNPPFYN8FY0MJ5CFPZ
trigger: manual
base_commit: null
target_commit: ef468e7c94d023d36da1e88254af90cdcc934b21
included_commits: []
result: passed
started_at: 2026-09-23T07:04:35.632Z
finished_at: 2026-09-23T07:11:11.707Z
scenario_results:
  - id: AUTH-LOGIN-001
    result: passed
confirmed_bugs: []
---

# 初始化测试报告 · Cynos Website（Closure 7 独立测试仓库）

## 1. 范围与固定 Run 值

- Run：`01M36H8NWNPPFYN8FY0MJ5CFPZ`，trigger=manual，首次初始化（`initialization=true`）。
- 固定 target：`ef468e7c94d023d36da1e88254af90cdcc934b21`；`baseCommit=null`、`includedCommits=[]`，**无变更清单可比对**，只对当前 target 整体验收，结论不可归因到具体提交，也不代表生产环境。
- 场景模式 `autonomous`；`scenarioChanges=null`，本轮**无场景新增/修改/rename/deprecated**动作。
- 执行场景集合：计划唯一 `## execution_scenarios` 仅列 `AUTH-LOGIN-001`，本报告按该清单逐项对应（1 项），未以正文其他 ID 补齐。
- `blockingReasons=[]`；Harness 已收尾测试数据。

## 2. 逐场景结果

| 场景 ID | 结果 | 依据概要 |
|---|---|---|
| AUTH-LOGIN-001 | passed | 复用 approved「登录状态恢复」场景；四条适用期望均有可独立复核的实际观察支持 |

### AUTH-LOGIN-001 · 登录状态恢复（Reviewer 独立审核结论：passed，4/4）

Reviewer 独立核对本 Run 原始证据（截图、operation、command、console、page 快照）后给出：

- **E1 刷新后显示同一用户**：重新导航 `/` 后仍为已登录视图；`GET /api/auth/status` 200 返回的 user id/email/displayName 与登录响应一致。
- **E2 退出后页面回到登录状态**：`POST /api/auth/logout` 200，页面快照回到登录表单并提示「已安全退出。」，与截图一致。
- **E3 退出后原 Session 访问受保护接口返回 401**：退出后写回**退出前固化的原 Cookie 值**，`GET /api/me => 401 UNAUTHORIZED`；request-headers 观察到该请求携带与登录时同一引用值的原 Cookie，**可与「丢 Cookie 后的匿名 401」区分**。
- **E4 删除测试账号后旧 Session 与原凭据均不可用**：`DELETE /api/me => 200 {"deleted":true,...}`；删除后写回**删除前固化的原 Cookie 值**，`GET /api/me => 401`（request-headers 证明携带原 Session）；原凭据 `POST /api/auth/login => 401 INVALID_CREDENTIALS`。
- 「需要记录」项：Cookie 属性观察为 `httpOnly: true`、`sameSite: Strict`（`secure: false` 与本环境 http 相符）。

计划 §4 登记的两处静态「冲突」由运行证据裁决：当前 target 的退出撤销与删除账号撤销行为**符合** spec 6/9 与场景期望；历史 Issue #1/#2 线索在本 target **未被复现**（本报告不裁决历史 Issue 状态）。

证据（本次 Run，稳定 URL）：

- 登录后仍为同一用户：`/api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzZIOE5XTlBQRllOOEZZME1KNUNGUFovMDEtbG9naW4tc3VjY2Vzcy5wbmc`
- 刷新后画面：`/api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzZIOE5XTlBQRllOOEZZME1KNUNGUFovMDItcmVmcmVzaC1zdGlsbC1sb2dnZWQtaW4ucG5n`
- 退出后回到登录页：`/api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzZIOE5XTlBQRllOOEZZME1KNUNGUFovMDMtYWZ0ZXItbG9nb3V0LWxvZ2luLXBhZ2UucG5n`
- 删除后回到登录页：`/api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzZIOE5XTlBQRllOOEZZME1KNUNGUFovMDQtYWZ0ZXItZGVsZXRlLWxvZ2luLXBhZ2UucG5n`
- 原凭据被拒：`/api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzZIOE5XTlBQRllOOEZZME1KNUNGUFovMDUtb3JpZ2luYWwtY3JlZGVudGlhbHMtcmVqZWN0ZWQucG5n`

## 3. 已确认产品 Bug

无。四条适用期望均有充分实际观察支持，Reviewer 未发现与期望矛盾的产品行为，`confirmed_bugs` 为空，本轮不创建也不关联 Issue。

## 4. 问题与限制（不改变产品结论）

以下三项为 Reviewer 独立指出的辅助证据/引用精度问题，均**不阻塞**，属 Reviewer 交付的判断：

1. **两张截图字节相同**：`01-login-success.png` 与 `02-refresh-still-logged-in.png` 的 `sha256` 一致，刷新截图不能作为画面变化的独立图像证据；E1 仍由页面快照与 `status` 响应充分支持。
2. **`cookie_list` 结论不可独立复核**：Runner 记录的退出后/删除后 `cookie_list` 输出被省略，Reviewer 无法从证据复核其「No cookies found」断言；该断言仅用于说明浏览器已清 Cookie，不影响 E3/E4（重放显式恢复原值且有请求头证据）。
3. **引用编号轻微错位**：`execution.md` 部分 operation 编号与实际内容略有偏差；所引内容均可在证据中找到，属引用精度问题。

覆盖缺口与无法确认项：

- 无 base commit / 无变更清单：只能整体验收，不可归因到提交，也不代表线上环境。
- 超出本场景授权、未覆盖（仅记录）：7 天 Session 有效期、`/health` 数据库降级分支、认证写请求 Origin 403、注册/登录限流 429、按 Run 查删端点鉴权与效果。
- 产品「删除」的数据库层完整性未直接观察（无 DB 只读入口）；E4 依据原 Cookie 401 + 原凭据 `INVALID_CREDENTIALS` + 页面删除提示判定，符合场景期望表述。
- 场景索引不可用、逐 Run 结构化历史检索为 empty（empty 不等于不存在历史）；历史证据文件未在本轮作为已读内容引用。

## 5. 证据与环境说明

- 本 Run 证据包含页面截图（5 张）、operation/command JSON、console 日志与 page 快照 YAML；上述图片中 `05-original-credentials-rejected.png` 被 Harness 标注为页面内容检测到，其余页面截图标注为未检测到。
- 证据文件的存在或读取成功不单独证明某执行者在本 Run 做过对应操作；本报告的通过结论依据 Reviewer 对实际操作记录（网络请求、请求头、响应体、页面快照）的独立核对。
- 环境地址与时序：运行时侦察记录环境 baseUrl 为 `http://cu10-initialization-retry1-target:3100`（与静态计划假设的本地地址不同），`/health` 返回 `status: ok`；本报告不复述任何凭据内容，测试账号以注册标识 `luowang-01M36H8NWNPPFYN8FY0MJ5CFPZ-preset` 指代。
- 本报告的观察者与来源：逐场景结论来自 Reviewer 的 `review.md` 独立审核；计划范围与执行清单来自 `plan.md`；均属本 Run 工件，未读运行记录原文或其他路径。

## 6. 结论

- **AUTH-LOGIN-001：passed**（4/4 适用期望均有可独立复核证据）。
- 本轮初始化完成范围为「复用 approved 场景并对当前固定 target 执行」；**不代表**项目整体无缺陷，也不代表未覆盖能力（有效期、限流、Origin 校验、查删端点等）已验证。
- 当前授权范围内无必要后续动作：无场景变更待审、无已确认产品 Bug 需归档。若后续需要覆盖 §4 列出的缺口能力，须另行确认相应的账号、环境与执行范围授权。

<!-- luowang-screenshot-inspection -->
## 截图采集标签

- [截图 1](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzZIOE5XTlBQRllOOEZZME1KNUNGUFovMDEtbG9naW4tc3VjY2Vzcy5wbmc>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 2](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzZIOE5XTlBQRllOOEZZME1KNUNGUFovMDItcmVmcmVzaC1zdGlsbC1sb2dnZWQtaW4ucG5n>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 3](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzZIOE5XTlBQRllOOEZZME1KNUNGUFovMDMtYWZ0ZXItbG9nb3V0LWxvZ2luLXBhZ2UucG5n>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 4](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzZIOE5XTlBQRllOOEZZME1KNUNGUFovMDQtYWZ0ZXItZGVsZXRlLWxvZ2luLXBhZ2UucG5n>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 5](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzZIOE5XTlBQRllOOEZZME1KNUNGUFovMDUtb3JpZ2luYWwtY3JlZGVudGlhbHMtcmVqZWN0ZWQucG5n>)：页面含可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 6](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzZIOE5XTlBQRllOOEZZME1KNUNGUFovcmVjb24tMDEtbG9naW4tcGFnZS5wbmc>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 7](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzZIOE5XTlBQRllOOEZZME1KNUNGUFovcmVjb24tMDItcmVnaXN0ZXItZm9ybS5wbmc>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
<!-- /luowang-screenshot-inspection -->

## Harness 清理收尾

测试数据清理完成；不改变本次功能验证结果。

清理适配器已独立核验 1 项测试数据不存在

全部登记测试数据均已独立核验清理

独立核验：luowang-01M36H8NWNPPFYN8FY0MJ5CFPZ-preset · run-scoped-http-cleanup · 2026-09-23T07:11:26.423Z · absent=true · sha256 eec66cb1af7c12c520e2822950a138ed086bd35d43b941500f323d67969cf66c
