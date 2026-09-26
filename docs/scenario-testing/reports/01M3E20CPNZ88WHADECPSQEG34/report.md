---
run_id: 01M3E20CPNZ88WHADECPSQEG34
trigger: manual
base_commit: f287add3d4054491f2ed5714cbb044a38a133f50
target_commit: 0defd30be3761c7ad8ba66bfd96d65737f54245b
included_commits:
  - fa6242b3105f1c01d7b82f363d145aca7e25ba16
  - 26c90acac551ea5ccbc00130c820fcc8df324ad8
  - 751b75095fd2faf9f37136f35eaaacda368770f9
result: passed
started_at: 2026-09-26T05:11:36.975Z
finished_at: 2026-09-26T05:16:52.558Z
scenario_results:
  - id: AUTH-LOGIN-001
    result: passed
  - id: AUTH-REGISTRATION-001
    result: passed
confirmed_bugs: []
---

# 最终报告：已批准登录与注册场景复核（Run 01M3E20CPNZ88WHADECPSQEG34）

- 触发方式：`manual`（人工请求：复核当前固定提交中的已批准登录/注册场景，逐项核对冻结场景期望，含浏览器页面与持久层要求；仅创建带本 Run 标记的合成数据并登记后交由 Harness 独立清理；保留全部证据，不得用历史通过替代本次执行）。
- 固定版本：`target = 0defd30be3761c7ad8ba66bfd96d65737f54245b`，`base = f287add3d4054491f2ed5714cbb044a38a133f50`，`includedCommits = [fa6242b3…, 26c90aca…, 751b7509…]`。
- 场景模式 `review-all`；`initialization = false`；`scenarioChanges = null`，本 Run 无场景 patch（Reviewer 已确认该 patch 工件不存在，与计划的「不新增/不修改/不废弃」维护声明一致）。
- 动态 Run 上下文 `blockingReasons` 为空。
- 执行集合严格取自 `plan.md` 的唯一 `## execution_scenarios`：`AUTH-LOGIN-001` → `AUTH-REGISTRATION-001`，顺序即执行顺序。
- 本文依据 `plan.md` 与 `review.md` 整理，不回读运行记录重做审核。逐场景判定与依据归 Reviewer 的独立审核；产品缺陷候选与发布动作归本报告（本次为零）。

## 本次范围

| 项目 | 内容 |
| --- | --- |
| 执行场景 | 2 个 approved 场景：`AUTH-LOGIN-001`（登录状态恢复）、`AUTH-REGISTRATION-001`（新用户注册） |
| 未执行 | draft 场景 `AUTH-LOGIN-002`、`AUTH-REGISTRATION-002`、`AUTH-ORIGIN-001` 不在请求的「已批准」范围，本 Run 不作任何判定 |
| 本批 diff 性质 | 18 项变更中，产品/测试代码 2 项（`src/server/test-data-cleanup.ts` 新增默认关闭的受控只读聚合路由 `GET /api/luowang/test-data/:runId/storage` 及其隔离测试）、文档 2 项、历史报告工件 14 项；**无任何认证业务行为变化**（`app.ts`、`security/auth.ts`、`web/App.tsx`、`config.ts` 均不在变化清单内） |
| 数据标记 | 合成账户以 `luowang-01M3E20CPNZ88WHADECPSQEG34-` 前缀标记；无标记数据不属清理范围，也不计入清理结论 |

## 逐场景结果

### AUTH-LOGIN-001 登录状态恢复 — passed

Reviewer 依据本 Run 原始浏览器与网络证据，对冻结正文 4 项适用期望逐项独立核对，全部确认：

1. 刷新后显示同一用户 — operation-34 / operation-37 / operation-38 快照与网络记录显示同一用户、邮箱一致；截图 `login-001-run-account-logged-in.png` 与 `login-001-run-after-refresh.png` sha256 相同（`61c62084…`），为同一登录态欢迎页。
2. 退出后页面回到登录状态 — operation-40（点击退出）/ operation-41（登录表单 +「已安全退出。」）；截图 `login-001-run-after-logout.png`（见 https://example.invalid 之外的 Run 证据列表，URL 原样保留于本 Run 证据清单）。
3. 退出后 Session 访问受保护接口返回 401，且**须由携带退出前会话的重放得到** — 退出前会话引用取自观察到的 Cookie（operation-53，attributes 含 `httpOnly: true, sameSite: Strict`），operation-57 以 `source: "restore-input"` 恢复同一引用，operation-59 网络 `/api/me => [401]`，operation-60 请求头回执 `credentialReferences` 为 `observed-request-header` 且为**同一**凭证引用、`cookie: [REDACTED]` 确有发送。Reviewer 明确该期望要求的「请求头确实携带该会话」已由请求头观察独立满足，不是以「未带 Cookie 的 401」代替。
4. 删除测试账号后旧 Session 与原凭据均不可用 — 旧会话重放仍 401（operation-57～60）；删除操作 operation-54 / operation-55（提示「测试账号及其会话已删除。」），截图 `login-001-run-after-delete.png`；原凭据重填 operation-63 → operation-64 告警「邮箱或密码不正确」→ operation-66 `POST /api/auth/login => [401]` → operation-67 响应体 `INVALID_CREDENTIALS`，operation-68 请求体确为被删账户的原邮箱与原口令（值已脱敏）；截图 `login-001-run-deleted-relogin-failed.png`。

「需要记录」项均具备：登录/刷新后的用户资料、退出后 HTTP 状态 401、Cookie 属性 `HttpOnly=true` / `SameSite=Strict`（`secure:false` 属 HTTP 非生产环境，计划已明确不属期望项）、删除后提示与旧会话/原凭据登录结果。

计划关注的 open Issue #2（退出不撤销服务端 Session）与 Issue #1（删除账号未真正删除）在本 Run 固定 target 上**未复现**；此仅为当次判定，不追改历史 Run、不关闭 Issue。

关键证据文件示例（URL 为工具返回值原样复用，完整清单见本 Run 证据列表）：

- `login-001-run-after-delete.png` — /api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvcHJvamVjdHMvZTNlMjhlZDgtOTE1My00ZjExLWFjM2QtMTYwY2JjNDFiMzg2L3J1bnMvMDFNM0UyMENQTlo4OFdIQURFQ1BTUUVHMzQvbG9naW4tMDAxLXJ1bi1hZnRlci1kZWxldGUucG5n
- `login-001-run-after-logout.png` — /api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvcHJvamVjdHMvZTNlMjhlZDgtOTE1My00ZjExLWFjM2QtMTYwY2JjNDFiMzg2L3J1bnMvMDFNM0UyMENQTlo4OFdIQURFQ1BTUUVHMzQvbG9naW4tMDAxLXJ1bi1hZnRlci1sb2dvdXQucG5n
- `login-001-run-deleted-relogin-failed.png` — /api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvcHJvamVjdHMvZTNlMjhlZDgtOTE1My00ZjExLWFjM2QtMTYwY2JjNDFiMzg2L3J1bnMvMDFNM0UyMENQTlo4OFdIQURFQ1BTUUVHMzQvbG9naW4tMDAxLXJ1bi1kZWxldGVkLXJlbG9naW4tZmFpbGVkLnBuZw

### AUTH-REGISTRATION-001 新用户注册 — passed

Reviewer 对 4 项适用期望逐项独立核对：

1. 页面显示欢迎信息 — operation-74 / 75 / 77 / 80；截图 `reg-001-register-form.png`、`reg-001-form-filled.png`、`reg-001-welcome.png` 均已实读，确认为注册表单、已填表单与欢迎视图。
2. `GET /api/auth/status` 返回已登录用户 — operation-83 网络列表含 `POST /api/auth/register => [201]`，op-85 响应体 `authenticated:true` + 用户对象；operation-86 导航后 operation-87 页面正文即 status 载荷（`authenticated:true`、用户 id/email/displayName/createdAt）；截图 `reg-001-auth-status.png` 实读为该 JSON。Reviewer 注明该导航回执 arguments 为空、未直接记录 URL，判定基于响应载荷与截图内容而非文件名。
3. 数据库不保存明文密码（持久层） — operation-88（`source: "controlled-test-account-storage"`）：`accounts=2`、`argon2id=2`、`other=0`，满足计划**预先约定**的判定条件（`accounts ≥ 1`、`argon2id = accounts`、`other = 0`）。Reviewer 提供的独立旁证为推断性质：查询时刻库中本 Run 两个标记账户外尚有此前登录成功的预设账户，若聚合统计全库则计数应 ≥3，实测 2 与「仅统计本 Run 标记账户」的声明相容；Reviewer 同时明确该旁证不能独立复算。
4. 验证完成后可从欢迎页删除当前测试账号、原邮箱密码随后不能再登录 — operation-91 / 92（提示「测试账号及其会话已删除。」），截图 `reg-001-after-delete.png`；operation-95 重填原凭据 → operation-96 告警「邮箱或密码不正确」→ operation-98 `POST /api/auth/login => [401]`，operation-99 请求体确为被删账户的原邮箱与原口令（已脱敏）；截图 `reg-001-deleted-relogin-failed.png`。

Reviewer 的判定结论为 4/4 期望确认，其中期望 3 按计划**预先约定**的受限持久层口径成立，并要求保留其受限范围、不得扩大为绝对结论。本报告照此保留：该观察仅覆盖运行应用数据库中本 Run 标记账户的口令列格式，**不覆盖其他行、其他位置或生产库**，也不能替代登录验证或被删账号的后续清理核验。

关键证据文件示例：

- `reg-001-welcome.png` — /api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvcHJvamVjdHMvZTNlMjhlZDgtOTE1My00ZjExLWFjM2QtMTYwY2JjNDFiMzg2L3J1bnMvMDFNM0UyMENQTlo4OFdIQURFQ1BTUUVHMzQvcmVnLTAwMS13ZWxjb21lLnBuZw
- `reg-001-auth-status.png` — /api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvcHJvamVjdHMvZTNlMjhlZDgtOTE1My00ZjExLWFjM2QtMTYwY2JjNDFiMzg2L3J1bnMvMDFNM0UyMENQTlo4OFdIQURFQ1BTUUVHMzQvcmVnLTAwMS1hdXRoLXN0YXR1cy5wbmc
- `reg-001-after-delete.png` — /api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvcHJvamVjdHMvZTNlMjhlZDgtOTE1My00ZjExLWFjM2QtMTYwY2JjNDFiMzg2L3J1bnMvMDFNM0UyMENQTlo4OFdIQURFQ1BTUUVHMzQvcmVnLTAwMS1hZnRlci1kZWxldGUucG5n

## 已确认产品问题

**无。** Reviewer 对两个场景的 8 项适用期望（各 4 项）均作出「与实际观察一致」的判断，未发现产品缺陷；`AUTH-LOGIN-001` 对应的两条 open Issue（#1、#2）在本 Run 固定 target 上未复现。

因此本 Run 没有已确认产品 Bug 候选，无需进入 Issue 去重查询流程：未调用 `query_issue_candidates`，也不存在「查询覆盖缺口」。**这不表示已确认不存在同类 Issue**——本次未做 Issue 去重查询，仅表示本次没有需要归档的新 Bug 候选，也未据此声称跨 Run 无重复。

本批 base→target 无认证业务代码变化（仅测试支撑只读聚合路由、其测试与文档），上述结论只说明当前 target 既有场景行为，**不代表项目整体无问题**，也不据此关闭任何 Issue。

## 覆盖缺口与未完成事项

1. **持久层期望的覆盖面受限**：`operation-88.json` 只覆盖运行应用数据库中本 Run 标记账户（查询时 2 个）的口令列格式，不覆盖其他行、其他位置或生产库；该观察不能替代登录验证或被删账号的后续清理核验。聚合工具的具体实现未在本 Run 展开，其「仅统计本 Run 标记账户」的口径依赖受控来源声明，Reviewer 仅能给出相容性旁证、不能独立复算。
2. **登录场景首轮的预设账户来源**：`AUTH-LOGIN-001` 首轮使用预设账户「v061 dedicated synthetic seed」（operation-10 快照），其创建来源不在本 Run 记录内；该轮仅用于首次流程，判定证据已改由本 Run 前缀账户（`-loginui`）承载。该预设账户在场景内未被删除，属非本 Run 创建的数据。
3. **注册密码长度**：`reg-001-form-filled.png` 中密码字段为掩码，无法从截图精确核对 ≥12 字符，仅由注册成功（201）间接支持；冻结场景 `## 期望` 未单列该断言，故不影响判定。
4. **未执行范围**：draft 场景 `AUTH-LOGIN-002`、`AUTH-REGISTRATION-002`、`AUTH-ORIGIN-001` 本 Run 不作判定；run-scoped 查删/聚合接口契约（默认关闭、鉴权拒绝、范围精确、级联、幂等、其他 Run 保留）未在本 Run 独立验证，本 Run 仅将该只读聚合用作注册期望 3 的观察手段，不据此声称该路由契约已被独立验证。`DELETE /api/me` 是否以数据库级联清除 `auth_sessions` 未作静态确认，仅由运行观察（旧会话重放 401）判定。
5. **记录层面的轻微不精确（不影响产品结论）**：Reviewer 指出 Runner 的 `execution.md` 少数证据引用索引有 ±1 偏移（如注册后 status JSON 记为 `operation-86.json`、实际在 `operation-87.json`；注册场景登录请求体记为 `operation-97.json`、实际在 `operation-99.json`）。属引用编号不严谨的记录问题，与产品结果分别表达，**产品结论不变**。
6. **Runner 已披露的两项执行偏差**（Reviewer 核对与原始操作序列吻合）：先用预设账户跑一遍、再改用 Run 前缀账户重复并以其证据判定；持久层以等价的受控只读聚合替代 target 新增的 storage 路由。
7. **一次工具拒绝**：`command-1.json` 记录内联解释器命令被拒（`COMMAND_NOT_ALLOWED`），与业务结果无关，未绕过边界。
8. **时间**：应用侧时间（注册 `createdAt`、响应头）与 Harness 证据时间分属不同来源、无可比校准时钟，本报告未作跨来源精确时间断言；仅保留各来源自身的记录值。
9. **人工复核缺位**：本流程全部为模型执行与审核，无人工复核记录；模型看图与浏览器 Run 不等同于人工确认。

## 数据与清理状态

- Runner 仅创建带本 Run 标记的合成账户并作登记；场景内 `DELETE /api/me` 是期望 4 的业务操作，不作为「清理完成」依据。
- 依据计划，测试数据最终清理由 Harness 在本 Session 结束后独立核验并处理；**本报告不声称清理已完成**，也不填写系统收尾区。清理成败不改变本报告已成立的功能结论。

## 发布/归档动作

- 本 Run 无已确认产品 Bug，`confirmed_bugs` 为空数组；不作出 create 或 link 决策。
- 场景资产维护需求（若有）不属产品 Bug，本 Run 未提出此类需求（计划维护动作：不新增、不修改、不废弃）。

## 总体结论

- `AUTH-LOGIN-001`：**passed**（4/4 适用期望经本 Run 浏览器与网络原始证据独立确认）。
- `AUTH-REGISTRATION-001`：**passed**（4/4 适用期望确认；期望 3 按计划预先约定的受限持久层口径成立，受限范围与边界见上）。
- 已确认产品缺陷：**无**；覆盖缺口与未完成事项见上一节，未完成事项保持可见。
- 结果聚合：两场景均 passed，无 failed、无 blocked，故整体 `result = passed`。

<!-- luowang-screenshot-inspection -->
## 截图采集标签

- [截图 1](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvcHJvamVjdHMvZTNlMjhlZDgtOTE1My00ZjExLWFjM2QtMTYwY2JjNDFiMzg2L3J1bnMvMDFNM0UyMENQTlo4OFdIQURFQ1BTUUVHMzQvbG9naW4tMDAxLWFmdGVyLWxvZ291dC5wbmc>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 2](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvcHJvamVjdHMvZTNlMjhlZDgtOTE1My00ZjExLWFjM2QtMTYwY2JjNDFiMzg2L3J1bnMvMDFNM0UyMENQTlo4OFdIQURFQ1BTUUVHMzQvbG9naW4tMDAxLWFmdGVyLXJlZnJlc2gucG5n>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 3](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvcHJvamVjdHMvZTNlMjhlZDgtOTE1My00ZjExLWFjM2QtMTYwY2JjNDFiMzg2L3J1bnMvMDFNM0UyMENQTlo4OFdIQURFQ1BTUUVHMzQvbG9naW4tMDAxLWxvZ2dlZC1pbi5wbmc>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 4](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvcHJvamVjdHMvZTNlMjhlZDgtOTE1My00ZjExLWFjM2QtMTYwY2JjNDFiMzg2L3J1bnMvMDFNM0UyMENQTlo4OFdIQURFQ1BTUUVHMzQvbG9naW4tMDAxLWxvZ2luLWZvcm0ucG5n>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 5](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvcHJvamVjdHMvZTNlMjhlZDgtOTE1My00ZjExLWFjM2QtMTYwY2JjNDFiMzg2L3J1bnMvMDFNM0UyMENQTlo4OFdIQURFQ1BTUUVHMzQvbG9naW4tMDAxLXJ1bi1hY2NvdW50LWxvZ2dlZC1pbi5wbmc>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 6](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvcHJvamVjdHMvZTNlMjhlZDgtOTE1My00ZjExLWFjM2QtMTYwY2JjNDFiMzg2L3J1bnMvMDFNM0UyMENQTlo4OFdIQURFQ1BTUUVHMzQvbG9naW4tMDAxLXJ1bi1hZnRlci1kZWxldGUucG5n>)：页面含可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 7](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvcHJvamVjdHMvZTNlMjhlZDgtOTE1My00ZjExLWFjM2QtMTYwY2JjNDFiMzg2L3J1bnMvMDFNM0UyMENQTlo4OFdIQURFQ1BTUUVHMzQvbG9naW4tMDAxLXJ1bi1hZnRlci1sb2dvdXQucG5n>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 8](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvcHJvamVjdHMvZTNlMjhlZDgtOTE1My00ZjExLWFjM2QtMTYwY2JjNDFiMzg2L3J1bnMvMDFNM0UyMENQTlo4OFdIQURFQ1BTUUVHMzQvbG9naW4tMDAxLXJ1bi1hZnRlci1yZWZyZXNoLnBuZw>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 9](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvcHJvamVjdHMvZTNlMjhlZDgtOTE1My00ZjExLWFjM2QtMTYwY2JjNDFiMzg2L3J1bnMvMDFNM0UyMENQTlo4OFdIQURFQ1BTUUVHMzQvbG9naW4tMDAxLXJ1bi1kZWxldGVkLXJlbG9naW4tZmFpbGVkLnBuZw>)：页面含可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 10](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvcHJvamVjdHMvZTNlMjhlZDgtOTE1My00ZjExLWFjM2QtMTYwY2JjNDFiMzg2L3J1bnMvMDFNM0UyMENQTlo4OFdIQURFQ1BTUUVHMzQvbG9naW4tMDAxLXJ1bi1yZWxvZ2dlZC1pbi5wbmc>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 11](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvcHJvamVjdHMvZTNlMjhlZDgtOTE1My00ZjExLWFjM2QtMTYwY2JjNDFiMzg2L3J1bnMvMDFNM0UyMENQTlo4OFdIQURFQ1BTUUVHMzQvcmVnLTAwMS1hZnRlci1kZWxldGUucG5n>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 12](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvcHJvamVjdHMvZTNlMjhlZDgtOTE1My00ZjExLWFjM2QtMTYwY2JjNDFiMzg2L3J1bnMvMDFNM0UyMENQTlo4OFdIQURFQ1BTUUVHMzQvcmVnLTAwMS1hdXRoLXN0YXR1cy5wbmc>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 13](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvcHJvamVjdHMvZTNlMjhlZDgtOTE1My00ZjExLWFjM2QtMTYwY2JjNDFiMzg2L3J1bnMvMDFNM0UyMENQTlo4OFdIQURFQ1BTUUVHMzQvcmVnLTAwMS1kZWxldGVkLXJlbG9naW4tZmFpbGVkLnBuZw>)：页面含可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 14](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvcHJvamVjdHMvZTNlMjhlZDgtOTE1My00ZjExLWFjM2QtMTYwY2JjNDFiMzg2L3J1bnMvMDFNM0UyMENQTlo4OFdIQURFQ1BTUUVHMzQvcmVnLTAwMS1mb3JtLWZpbGxlZC5wbmc>)：页面含可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 15](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvcHJvamVjdHMvZTNlMjhlZDgtOTE1My00ZjExLWFjM2QtMTYwY2JjNDFiMzg2L3J1bnMvMDFNM0UyMENQTlo4OFdIQURFQ1BTUUVHMzQvcmVnLTAwMS1yZWdpc3Rlci1mb3JtLnBuZw>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 16](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvcHJvamVjdHMvZTNlMjhlZDgtOTE1My00ZjExLWFjM2QtMTYwY2JjNDFiMzg2L3J1bnMvMDFNM0UyMENQTlo4OFdIQURFQ1BTUUVHMzQvcmVnLTAwMS13ZWxjb21lLnBuZw>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
<!-- /luowang-screenshot-inspection -->

## Harness 清理收尾

测试数据清理完成；不改变本次功能验证结果。

清理适配器已独立核验 3 项测试数据不存在

全部登记测试数据均已独立核验清理

独立核验：luowang-01M3E20CPNZ88WHADECPSQEG34-login · run-scoped-http-cleanup · 2026-09-26T05:17:16.141Z · absent=true · sha256 ccacaf55496346cc4680b69876f60f1250f7a3c9f7ea53acc0ffb745ab9207a5

独立核验：luowang-01M3E20CPNZ88WHADECPSQEG34-loginui · run-scoped-http-cleanup · 2026-09-26T05:17:16.143Z · absent=true · sha256 ccacaf55496346cc4680b69876f60f1250f7a3c9f7ea53acc0ffb745ab9207a5

独立核验：luowang-01M3E20CPNZ88WHADECPSQEG34-reg · run-scoped-http-cleanup · 2026-09-26T05:17:16.144Z · absent=true · sha256 ccacaf55496346cc4680b69876f60f1250f7a3c9f7ea53acc0ffb745ab9207a5
