---
run_id: 01M34Q8BNDF8YAMHGEKH5QRQ7S
trigger: manual
base_commit: e09b0f377d1414fa3da2c65bcbbc2406421dec4d
target_commit: f287add3d4054491f2ed5714cbb044a38a133f50
included_commits:
  - f287add3d4054491f2ed5714cbb044a38a133f50
result: passed
started_at: 2026-09-22T14:10:35.460Z
finished_at: 2026-09-22T14:14:11.637Z
scenario_results:
  - id: AUTH-LOGIN-001
    result: passed
confirmed_bugs: []
---

# 测试报告：Closure 7 场景审核 PR 合并后 manual-current-head 重测（AUTH-LOGIN-001）

本报告整理本次 Run 的已落盘计划与审核结果，不重复规划、不重做审核。逐场景结论采用 Reviewer 依据原始证据作出的独立判断；本报告使用的全部未验证事实均来自 review.md 的交付，凡 Reviewer 明确标注为“无法确认/不可复核/记录性背景”的内容，均按原文限定保留。

## 1. 范围与固定版本

- runId `01M34Q8BNDF8YAMHGEKH5QRQ7S`；trigger `manual`；`scenarioMode = autonomous`；`initialization = false`；`scenarioChanges = null`。
- `baseCommit = e09b0f377d1414fa3da2c65bcbbc2406421dec4d`，`targetCommit = f287add3d4054491f2ed5714cbb044a38a133f50`，`includedCommits = [f287add3…]`。
- 执行清单（plan.md 唯一 `## execution_scenarios`）仅 1 项：`AUTH-LOGIN-001`，本报告 `scenario_results` 与该清单一项对一项、顺序一致。
- 本轮无场景资产变更：`scenario-changes.patch` 在本 Run 不存在，plan 未产出 patch，与请求“不新增、修改、rename 或 deprecated 长期场景”一致。相关背景：初始化前的 patch 读取请求被角色边界拒绝（本角色仅允许 plan.md、review.md 及初始化 patch），不构成结果证据。
- 请求的授权边界：只执行 approved 场景 `AUTH-LOGIN-001`；使用 Secret Store 中的预置可删除账号；正式浏览器操作前 `start_scenario`、完成后 `finish_scenario`；证据不足保持 blocked；不输出任何凭据；不创建或关联 Issue。本报告严格遵守，未复述任何账号字段、口令或 Cookie 值。

## 2. 逐场景结果

### AUTH-LOGIN-001 — passed

Reviewer 在独立读取原始操作记录（68 条 operation 证据）、页面/控制台快照（12 份）与 8 张截图后判定：四项适用期望 A/B/C/D 均有充分、可区分的实际观察支持，无充分证据支持的违反项，无尚不能确认项。

**前置与起始态（Reviewer 观察）**：导航 `http://closure7-retest-target:3100` 后页面为未登录登录表单，起始态成立；`begin_scenario_execution`、`start_scenario(AUTH-LOGIN-001)` 与结束时的 `finish_scenario` 记录齐全，区间内全部 operation 的 `execution.scenarioId` 均为 `AUTH-LOGIN-001`，无跨场景穿插，时序自洽。

- **期望 A 刷新后显示同一用户 — 成立**：填表登录后页面显示当前用户；整页导航刷新同一 URL 后页面仍显示同一用户；刷新后 `GET /api/auth/status` 返回 200 且响应体 `authenticated:true` 与登录时用户一致，该请求头携带真实 cookie。Reviewer 读取的三张 sha256 相同的登录态截图（`561d8e2f…` 对应的登录/刷新前后页面）显示同一用户与同一邮箱。
- **期望 B 退出后页面回到登录状态 — 成立**：点击「退出登录」后 `POST /api/auth/logout` 返回 200，请求头携带退出前的真实 cookie；页面回到登录表单并显示「已安全退出。」，截图与之一致。
- **期望 C 退出后的 Session 访问受保护接口返回 401 — 成立，且可与“未携带 Cookie 的平凡 401”区分**：退出前用 `browser_cookie_get` 读取并固化真实 cookie（属性 domain `closure7-retest-target`、path `/`、httpOnly `true`、secure `false`、sameSite `Strict`），随后以同一引用恢复并复核；恢复后重放受保护请求 `GET /api/me` 得到 401，其 `request-headers` 明确携带 `cookie` 头且凭据引用指向退出前同一真实 cookie，响应体为 `UNAUTHORIZED`，控制台日志同步记录该 401。请求头关联成立，满足 plan 第 5 节对期望 C 的可区分性要求。
- **期望 D 删除账号后旧 Session 与原凭据均不可用 — 成立**：(a) 旧 Session：删除前读取并固化当时真实 cookie（httpOnly `true`、sameSite `Strict`），`DELETE /api/me` 返回 200 且响应体含 `deleted:true`、`authenticated:false`，页面提示「测试账号及其会话已删除。」；恢复删除前 cookie 后重放 `GET /api/me` 得到 401，请求头携带删除前同一 cookie，截图与页面快照一致。(b) 原凭据：清理 Cookie 后用原凭据重新登录，`POST /api/auth/login` 返回 401，页面提示「邮箱或密码不正确」，响应体 `INVALID_CREDENTIALS`，控制台日志记录该 401。

## 3. 已确认产品问题

本 Run 未发现被证实的预期/实际差异。Reviewer 判定：无已确认产品 Bug、无可复现缺陷。因此 `confirmed_bugs` 为空数组，`issue_action` 不适用，本 Run 未创建、未关联任何 Issue。

本 Run 的审核亦未形成该场景的缺陷确认，故无需按“已确认 Bug 候选”进行 create/link 决策。

## 4. Issue 关联与查询

- 由于 `confirmed_bugs` 为空（Reviewer 明确“无已确认产品 Bug”），本 Run 无需要按 Bug key 归并的候选；
- 为确认不存在可关联的同类记录，Reviewer（第 4 节）与本报告均未发现需要关联的 Issue；
- 若仍需核对是否存在同类历史记录，可复查上一次 failed Run 的对应 Issue（`cynos-ai/luowang-closure7-fixture#1`、`#2`）。本轮请求明确不创建、不关联 Issue，故本轮未对该候选做进一步查询动作；
- 计划中登记的 `historyIssuesAvailable = true` 仅说明历史 Issue 可查，#1/#2 仅作为背景，未作为本轮任何期望或结论的依据。

## 5. 记录性背景（非本轮判定依据，按 review.md 原文限定保留）

- **跨 Run 结果不一致，原因未确认**：plan 登记的历史 failed Run（`01M34KTXN…`，与 product 代码区间相同）曾确认“退出不撤销服务端 Session、删除后旧 Session 与原凭据仍可用”，并留下“运行目标可能非同一构建”的未消解疑点。Reviewer 明确：**本 Run 的实际观察与该次 failed 不一致**（本轮 logout 后旧 Cookie 重放 `/api/me` 401、delete 后旧 Cookie 重放 401 且原凭据登录 401/INVALID_CREDENTIALS，均表现为行为正确）；同一场景在相同 product 代码区间出现 passed/failed 不同结果属跨 Run 的记录性不一致，Reviewer 表示无法在本 Run 内确认其原因（构建/夹具/环境差异均无本轮依据）。该不一致不削弱本 Run 的观察，但应随结论如实保留，**不得据其单独判定历史缺陷已修复**。本报告不为其补写原因。
- **同步登记的其它背景**：更早的同类检查曾在别的 target 上判 passed；上一次 Run 在同一场景判 blocked，原因是 Reviewer 侧无法读取受控命令证据。两者均为记录性背景，不构成本轮判定依据。
- 本流程 Agent 为模型；无人工复核记录，不声称人工已确认。

## 6. 覆盖缺口与限制（含 Reviewer 的疑问与限制）

- 结论只对固定 target `f287add3d4054491f2ed5714cbb044a38a133f50` 整体成立，不归因到具体提交或改动；本区间 base→target 的变化判断依赖 Main 的 diff 读取，Reviewer 无仓库读取权限，**无法独立复核仓库 diff**（该限制来自 review.md 第 2 节，Reviewer 同时说明本 Run 结论不依赖该归因）。由此，**本轮不主张任何“该区间无产品行为变化”的独立确认结论**；该差异核对仅为计划侧依据登记。这也意味着无法把本轮结果归因到或排除任一具体变更。
- 未执行且结论不外推：draft `AUTH-ORIGIN-001`（请求明确本轮不执行）、draft `AUTH-LOGIN-002`、draft `AUTH-REGISTRATION-002`、approved 但未授权的 `AUTH-REGISTRATION-001`，以及重复邮箱 409、弱密码/无效邮箱 400、Origin 403、限流 429、7 天 Session 有效期等边界。未执行不代表这些范围已通过或存在问题。
- 期望 D-b 中“已清空 Cookie”这一步的写入值不可由证据确认：清理 Cookie 的 `browser_cookie_set` 其 restore-input 引用为 `null`（Harness 未能匹配到已知凭据值），Reviewer 说明该步判定依据是“清理后用原凭据登录返回 401/INVALID_CREDENTIALS”，不依赖所写值，故不影响 D 的成立。此处保留 Reviewer 的该疑问与限定，不升级为阻塞。
- `GET /api/auth/status` 对失效会话返回 200 + `authenticated:false` 而非 401：Reviewer 说明该语义不影响期望 C/D，因判定以受保护接口 `/api/me` 的 401 为准。此点由 Reviewer 观察记录，Runner 亦在记录项中如实澄清，表述一致。
- 证据引用精度（不影响结论，Reviewer 订正）：执行记录把“HTTP 401”标注为若干 `browser_navigate` 操作编号，401 实际记录在其后的 `browser_network_requests` 与对应控制台日志中，`request-headers` 记录为再后一条；底层证据充分支持 401 与其请求头关联，仅为引用编号不精确。
- 文档呈现问题（不影响结论）：执行记录部分句子在脱敏占位处被截断，缺后文与闭合，属脱敏截断的呈现问题，对应原始 operation 证据完整。
- 证据清单口径：本 Run 证据含 8 张截图、3 份控制台日志、13 份页面快照、68 条 operation 记录。Reviewer 指出截图 `after-logout.png`、`after-refresh.png`、`api-me-401-*.png`、`before-refresh.png`、`login-success.png` 等的自动截图检测状态为未检出/部分检出，其结论以原始请求/响应记录的独立关联为准，截图仅作辅助与一致性核对。上述证据文件的存在与读取成功只说明内容可观察，不单独证明具体执行动作归属；执行归属由 operation 记录中的 `execution.scenarioId` 与操作序列支持。
- 场景索引背景：动态上下文中的场景索引 `stale = true` 且未含 target 中已存在的 `AUTH-ORIGIN-001`，计划已改用固定 target 正文为基准。此为记录性背景，不影响本轮判定。
- 测试数据清理：场景内已按业务步骤删除所用预置账号（删除接口返回 `deleted:true`）；Run 级临时数据收尾由 Harness 在本 Session 结束后统一处理，本报告不声称已完成，也不填写系统收尾区。

## 7. 下一步

- 本轮唯一选中场景已闭合，无返工或补测要求（Reviewer 第 7 节）。
- 若需回答“跨 Run 结果不一致（同 product 代码区间 passed vs failed）的原因”，需要另行确认可用的受控手段以核对运行目标构建与仓库快照的一致性、或取得可比的运行时证据；该核对**不在本轮授权范围**，须经另行确认后再执行，本轮不据此创建或关联 Issue。
- 若需覆盖现象上未被本轮执行的 draft 场景与边界（`AUTH-ORIGIN-001`、`AUTH-LOGIN-002`、`AUTH-REGISTRATION-001/002`、409/400/403/429 与 Session 有效期等），需先取得相应执行授权；本轮结论不外推到这些范围。

<!-- luowang-screenshot-inspection -->
## 截图采集标签

- [截图 1](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzRROEJOREY4WUFNSEdFS0g1UVJRN1MvYWZ0ZXItZGVsZXRlLWFjY291bnQucG5n>)：页面含可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 2](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzRROEJOREY4WUFNSEdFS0g1UVJRN1MvYWZ0ZXItbG9nb3V0LnBuZw>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 3](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzRROEJOREY4WUFNSEdFS0g1UVJRN1MvYWZ0ZXItcmVmcmVzaC5wbmc>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 4](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzRROEJOREY4WUFNSEdFS0g1UVJRN1MvYXBpLW1lLTQwMS1hZnRlci1kZWxldGUtc2Vzc2lvbi5wbmc>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 5](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzRROEJOREY4WUFNSEdFS0g1UVJRN1MvYXBpLW1lLTQwMS1hZnRlci1sb2dvdXQucG5n>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 6](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzRROEJOREY4WUFNSEdFS0g1UVJRN1MvYmVmb3JlLXJlZnJlc2gucG5n>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 7](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzRROEJOREY4WUFNSEdFS0g1UVJRN1MvbG9naW4tcmVqZWN0ZWQtYWZ0ZXItZGVsZXRlLnBuZw>)：页面含可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 8](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzRROEJOREY4WUFNSEdFS0g1UVJRN1MvbG9naW4tc3VjY2Vzcy5wbmc>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
<!-- /luowang-screenshot-inspection -->

## Harness 清理收尾

测试数据清理完成；不改变本次功能验证结果。

清理适配器已独立核验 2 项测试数据不存在

全部登记测试数据均已独立核验清理

独立核验：luowang-01M34Q8BNDF8YAMHGEKH5QRQ7S-preset · run-scoped-http-cleanup · 2026-09-22T14:14:31.832Z · absent=true · sha256 b00865cd9b293b3b6318fe8a7e0edab8752e0b6295bd7a0a51127c81088f85fb

独立核验：luowang-01M34Q8BNDF8YAMHGEKH5QRQ7S-preset-account · run-scoped-http-cleanup · 2026-09-22T14:14:31.834Z · absent=true · sha256 b00865cd9b293b3b6318fe8a7e0edab8752e0b6295bd7a0a51127c81088f85fb
