---
run_id: 01M34GE6SGXEQZYHN3Y4HMW4BX
trigger: manual
base_commit: 6405a45b6889ad92cf7cfbce12d8ec22b5040f23
target_commit: 6a07377a4f41880f8869ccd8b4106acc5b4aa321
included_commits:
  - ef468e7c94d023d36da1e88254af90cdcc934b21
  - 6a07377a4f41880f8869ccd8b4106acc5b4aa321
result: passed
started_at: 2026-09-22T12:11:46.350Z
finished_at: 2026-09-22T12:16:07.717Z
scenario_results:
  - id: AUTH-LOGIN-001
    result: passed
confirmed_bugs: []
---

# 最终报告：Closure 7 merge-source 验收 —— AUTH-LOGIN-001（登录状态恢复）

## 1. 范围与依据

- 请求（manual）：Closure 7 普通 merge-source passed 验收。main 只补充登录刷新要求——继续使用原 Session，恢复的用户 ID、邮箱和昵称与登录响应一致。复用 target 中已有的 approved 场景 `AUTH-LOGIN-001`，本轮只执行该场景，不新增、修改、rename 或 deprecated 长期场景。
- 固定 Run：`baseCommit = 6405a45b6889ad92cf7cfbce12d8ec22b5040f23`，`targetCommit = 6a07377a4f41880f8869ccd8b4106acc5b4aa321`，`includedCommits = ef468e7c94d023d36da1e88254af90cdcc934b21`、`6a07377a4f41880f8869ccd8b4106acc5b4aa321`；`scenarioMode = autonomous`、`initialization = false`。
- 执行清单（plan.md `## execution_scenarios`）只有一项：`AUTH-LOGIN-001`，本报告结果与之一一对应。
- 本 Run 无 `scenario-changes.patch`（plan.md 声明本轮不做任何场景资产维护；review.md 记录读取该工件返回「Run 工件不存在」，与计划一致）。
- 依据来源：plan.md（计划与唯一执行清单）、review.md（Reviewer 独立审核）。本报告为汇总，未重做审核、未重读运行记录、未执行测试。

## 2. 变化影响与结论适用范围

plan.md 记录 base→target 净变化为 3 项：`docs/changes/cynos-website-auth/spec.md`（modified：新增已确定行为 10「登录后刷新继续使用原 Session；恢复的用户 ID、邮箱和昵称与登录响应一致」，并细化对应验收条件）、以及上一 Run 的 `report.md`/`review.md`（added，历史证据）。**无 `src/**`、`tests/**` 或构建配置等源码变化**。

因此：本次变化属文档级契约澄清，业务结果未新增独立语义；本报告结论只对固定 target 整体成立，**不能归因到具体源码行为差异**（该限定见 review.md「覆盖缺口与限制」，本报告保留）。

plans 记录的实现侧定位（`src/web/App.tsx` 挂载调用 `GET /api/auth/status`、`src/server/app.ts` 的 `/api/auth/status` 与 `/api/me` 返回 `UserProfile{id,email,displayName,createdAt}`）仅作核对参照，不是期望来源。

## 3. 逐场景结果

### AUTH-LOGIN-001 登录状态恢复 —— passed

场景为 target 内既有 approved 场景（tags `core / module:认证 / flow:登录`）。plan.md 列出四项适用期望 A–D 均为此场景通过的必要条件；审核对该场景四项期望与「需要记录」项给出的结论均为满足，且未发现违反期望的行为。Reviewer 独立读取原始证据（不依赖 `execution.md` 叙述）得出下述判断，本报告引用其结论与依据。

**期望 A —— 刷新后显示同一用户（含 spec 第 10 条：继续用原 Session；ID/邮箱/昵称与登录响应一致）—— 审核结论满足。**
- 登录响应 `POST /api/auth/login => 200`（`operation-11.json`、`operation-12.json`）：`user.id = b867ee0d-5c7c-4c71-8659-11afe70d6bdf`、`displayName = luowang-01M34GE6SGXEQZYHN3Y4HMW4BX-preset`、`createdAt = 2026-09-22T12:11:21.274Z`，`email` 在 Harness 输出中已脱敏。
- 刷新后 `GET /api/auth/status => 200`，`authenticated:true`，`user.id/displayName/createdAt` 与登录响应逐项相同（`operation-20.json`、`operation-21.json`）；页面文本仍为同一用户欢迎态（`operation-19.json`、`page-2026-09-22T12-13-08-249Z.yml`）。
- 「继续用原 Session」：登录后读取的 `cynos_session`（引用 `credential-8fe32e010db77659a21d926e6811edd0`，`operation-15.json`）与刷新后读取值为同一引用（`operation-22.json`），即复用原会话而非新建。
- 审核明确记录的限定：`email` 在响应体中均被脱敏，**无法逐字比较**；该项一致性由「登录后截图 `auth-login-001-02-logged-in.png` 与刷新后截图 `auth-login-001-03-after-refresh.png` 的 sha256 完全相同（`22b677…0071e`）」加「响应体中 `id`、`displayName`、`createdAt` 完全一致」共同支撑，而非响应体逐字比较。`id` 不在页面文本中显现，仅由响应体支撑，符合 plan.md 口径。

**期望 B —— 退出后页面回到登录状态 —— 审核结论满足。**
- `POST /api/auth/logout => 200`（`operation-24.json`），响应体 `{"authenticated":false,"user":null}`（`operation-27.json`）；页面回到登录表单并显示「已安全退出。」（`operation-23.json`、`page-2026-09-22T12-13-13-816Z.yml`、截图 `auth-login-001-04-after-logout.png`）；退出后 `cynos_session` 已不存在（`operation-26.json` 的 cookie_get 无引用）。

**期望 C —— 退出后的 Session 访问受保护接口返回 401（携带真实凭据、可区分）—— 审核结论满足。**
- 退出后把退出前固化的同一会话 Cookie（引用 `credential-8fe32e…`）重新设置到浏览器（`operation-30.json`，来源标注 `restore-input`），随后 `GET /api/me => 401 Unauthorized`（`operation-34.json`、`page-2026-09-22T12-13-23-522Z.yml`、`console-2026-09-22T12-13-23-488Z.log` 记录 401）。
- 可区分性：该 `GET /api/me` 的 request-headers 明确包含 `cookie` 头，其引用与退出前会话同值（`operation-35.json`，来源标注 `observed-request-header`），说明是「携带真实旧凭据被重放仍 401」，而非「未携带凭据的未认证 401」；同请求下 `GET /api/auth/status` 返回 `authenticated:false`（`operation-31.json`）。

**期望 D —— 删除账号后旧 Session 与原凭据均不可用 —— 审核结论满足。**
- 重新登录成功（`POST /api/auth/login => 200`，`operation-42.json`、`operation-44.json`），产生新 `cynos_session`（引用 `credential-9915f48a86c31679c406072a3ea41397`，`operation-45.json`）；删除前真实受保护请求 `GET /api/me => 200 OK`（`operation-49.json`、`operation-51.json`），request-headers 携带该新会话 Cookie（`operation-52.json`）。
- 删除前读取真实 Cookie（`operation-54.json`）并截图 `auth-login-001-05-before-delete.png`。
- 删除 `DELETE /api/me => 200 OK`（`operation-58.json`）；页面回到登录态并显示「测试账号及其会话已删除。」（`operation-57.json`、`page-2026-09-22T12-13-44-443Z.yml`、截图 `auth-login-001-06-after-delete.png`）；Cookie 已清除（`operation-59.json`）。
- 删除后核验旧 Session：重新设置删除前固化的会话 Cookie（引用 `credential-9915…`，`operation-61.json`），`GET /api/me => 401 Unauthorized`（`operation-63.json`），request-headers 明确携带该 Cookie（`operation-64.json`，来源标注 `observed-request-header`），响应体 `UNAUTHORIZED / 请先登录`（`operation-65.json`）；控制台 `console-2026-09-22T12-13-49-234Z.log` 记录 401。
- 删除后核验原凭据：清 Cookie 后用原邮箱与口令登录，`POST /api/auth/login => 401`（`operation-73.json`），响应体 `INVALID_CREDENTIALS / 邮箱或密码不正确`（`operation-75.json`）；页面 `role=alert` 显示「邮箱或密码不正确」（`operation-72.json`、`page-2026-09-22T12-13-59-527Z.yml`、截图 `auth-login-001-07-after-delete-relogin-rejected.png`——审核记录该图保留真实已填写表单，未清空）；控制台 `console-2026-09-22T12-13-55-219Z.log` 记录 login 401。

**「需要记录」项（审核结论：均有实际观察支持）** —— 登录/刷新后用户资料；退出后 HTTP 状态（logout 200 / me 401）；Cookie `httpOnly: true` 与 `sameSite: Strict`（登录后、刷新后、删除前三次读取：`operation-15/22/45/54.json`）；删除提示；删除后旧 Session（401）与原凭据登录结果（401 `INVALID_CREDENTIALS`）。

**时序与前置（审核依据）** —— `start_scenario(AUTH-LOGIN-001)`（`operation-8.json`）在首个场景浏览器操作（`operation-9.json` 截图）之前；`finish_scenario`（`operation-76.json`，completed 含 `AUTH-LOGIN-001`）在最后一步观察之后。初始未登录态 `GET /api/auth/status => 200 {"authenticated":false,"user":null}`（`operation-5.json`、`operation-3.json`）。

**截图真实性（审核判断）** —— 七个现场 `auth-login-001-01…07` 均为真实页面状态；退出态截图显示「已安全退出。」、删除态显示「测试账号及其会话已删除。」、重试被拒截图显示错误提示，审核未见为改善外观而清空/覆盖表单或切换页面状态的迹象。

本报告按审核结论将 `AUTH-LOGIN-001` 记为 **passed**：四项适用期望与「需要记录」项均有实际观察支持，未发现与期望不符的行为；未发现审核中存在「原文期望未验证且无原文条件不适用或明确授权排除依据」的情形，故不触发 blocked 修正。

## 4. 已确认产品问题与 Issue 决策

- 审核「已确认产品问题」为：**无**。本次未发现与场景期望不符的产品缺陷（退出后旧 Session 重放 401、删除后旧 Session 与原凭据均失效、Cookie 属性符合 `HttpOnly`/`SameSite=Strict` 等行为均由实际观察支持）。
- 因此 `confirmed_bugs` 为空，无 Issue create/link 决策需要作出，本 Run 也不涉及创建或关联 Issue（与请求「证据不足时保持 blocked，不创建或关联 Issue」一致；本次未出现需要建 Issue 的已确认 Bug）。
- 说明：为防止遗漏，仍按既定流程对本次场景标识做了受限候选查询（keywords/title 指向 `AUTH-LOGIN-001`、登录状态恢复、session），结果为 `empty`（无候选）。该查询无 Bug key 需要覆盖，故不写「Issue 查询覆盖缺口」章节。本次查询为 empty，**不代表对既有 Bug 库作了穷尽性去重声明**。

## 5. 执行记录问题（不影响产品结论，来自审核）

1. **证据引用编号轻微不精确**：`execution.md` 期望 C 段把 `/api/me` 401 的 request-headers 证据引作 operation-33/34，实际携带 cookie 头的请求头证据为 `operation-35.json`。审核判定：该段依赖的全部原始证据均存在且支持结论，属文档精度问题，不改变判定。
2. **辅助侦察失败已被正确排除**：`command-1.json`（命令白名单拒绝该 curl）、`command-2.json`（`node tests/e2e/smoke.ts` 因缺 `dist/server/main.js` 构建产物 exit 1、`MODULE_NOT_FOUND`）均未计入正式场景，`execution.md` 亦如实标注其不计入正式场景，目标可达性改由浏览器实际访问确认。审核认为该处理合理，同时指出：这两次失败说明 CLI 侧不可用于验证目标服务，本 Run 的目标服务仅经浏览器侧证据确认。

## 6. 覆盖缺口与限制

以下保留来源限定，均来自 plan.md / review.md 的原文范围声明，本报告不扩大、不反转：

- **无源码变化**：base→target 仅 spec 文档澄清 + 历史报告/审核文档，结论只对固定 target 整体成立，不能归因到具体代码差异。
- **场景索引 stale**：plan.md 记录场景索引 `commit = 2c4684c50a58cf7728041b4cba50ca46b54d6723` 相对固定 target 已 `stale = true`，计划以固定 target 正文（`status: approved`）为目标基准，与索引条目语义一致，无缺失场景。
- **affected 但不改变结论的一项**：`email` 字段在 API 响应体中均被 Harness 脱敏，逐字一致性依赖页面截图（02 与 03 同一 sha256）与响应体 `id`/`displayName`/`createdAt` 一致性共同支撑，而非响应体逐字比较。
- **不在授权范围（本轮不执行，也不因此降级）**：`AUTH-LOGIN-002`（draft）、`AUTH-REGISTRATION-001`（approved，未授权）、`AUTH-REGISTRATION-002`（draft），以及重复邮箱 409、弱密码/无效邮箱 400、Origin 403、限流 429、7 天 Session 有效期等边界。本报告结论**不扩展到这些范围**。
- **场景资产维护**：本轮无 patch，无新增/修改/rename/deprecated 长期场景，与计划一致。
- **无人工复核**：执行与审核主体均为模型（Playwright MCP 操作产生原始证据，Reviewer 依据原始证据独立判断）；本流程**不声称人工已确认**，本次也无人工复核记录。
- **仅一次通过**：本次通过仅说明该场景在固定 target 上的实际行为符合期望，不表示项目其他功能不存在问题。
- **测试后 Run 级清理**：场景内测试账号已按业务步骤删除（`DELETE /api/me => 200`）；Run 级临时数据清理由 Harness 在本 Session 结束后统一处理，本报告不声称其已完成。

## 7. 汇总

- 计划 `## execution_scenarios` 的 1 个场景：`AUTH-LOGIN-001` = **passed**。
- 已确认产品 Bug：0；`confirmed_bugs` 为空。
- 阻塞：无（`blockingReasons` 为空；无适用期望未确认，无必要证据缺失，无关键覆盖遗漏未消解）。
- 整体结果：**passed**。
- 下一步（现有授权范围内）：无需为本 Run 补充执行；如需继续 Closure 7 验收，可在另行确认授权后扩展至上述未授权/边界场景，该扩展不属于当前权限。

<!-- luowang-screenshot-inspection -->
## 截图采集标签

- [截图 1](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzRHRTZTR1hFUVpZSE4zWTRITVc0QlgvYXV0aC1sb2dpbi0wMDEtMDEtbG9naW4tcGFnZS5wbmc>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 2](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzRHRTZTR1hFUVpZSE4zWTRITVc0QlgvYXV0aC1sb2dpbi0wMDEtMDItbG9nZ2VkLWluLnBuZw>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 3](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzRHRTZTR1hFUVpZSE4zWTRITVc0QlgvYXV0aC1sb2dpbi0wMDEtMDMtYWZ0ZXItcmVmcmVzaC5wbmc>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 4](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzRHRTZTR1hFUVpZSE4zWTRITVc0QlgvYXV0aC1sb2dpbi0wMDEtMDQtYWZ0ZXItbG9nb3V0LnBuZw>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 5](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzRHRTZTR1hFUVpZSE4zWTRITVc0QlgvYXV0aC1sb2dpbi0wMDEtMDUtYmVmb3JlLWRlbGV0ZS5wbmc>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 6](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzRHRTZTR1hFUVpZSE4zWTRITVc0QlgvYXV0aC1sb2dpbi0wMDEtMDYtYWZ0ZXItZGVsZXRlLnBuZw>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 7](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzRHRTZTR1hFUVpZSE4zWTRITVc0QlgvYXV0aC1sb2dpbi0wMDEtMDctYWZ0ZXItZGVsZXRlLXJlbG9naW4tcmVqZWN0ZWQucG5n>)：页面含可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
<!-- /luowang-screenshot-inspection -->

## Harness 清理收尾

测试数据清理完成；不改变本次功能验证结果。

清理适配器已独立核验 1 项测试数据不存在

全部登记测试数据均已独立核验清理

独立核验：luowang-01M34GE6SGXEQZYHN3Y4HMW4BX-preset · run-scoped-http-cleanup · 2026-09-22T12:16:28.734Z · absent=true · sha256 a0a1d38c6ba4d5feb45889037c371adedba88461ebe8269e35ac963405f7d39d
