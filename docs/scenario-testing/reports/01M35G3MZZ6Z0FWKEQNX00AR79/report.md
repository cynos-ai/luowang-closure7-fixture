---
run_id: 01M35G3MZZ6Z0FWKEQNX00AR79
trigger: manual
base_commit: null
target_commit: fa6242b3105f1c01d7b82f363d145aca7e25ba16
included_commits: []
result: passed
started_at: "2026-09-22T21:24:51.996Z"
finished_at: "2026-09-22T21:28:02.909Z"
scenario_results:
  - id: AUTH-LOGIN-001
    result: passed
confirmed_bugs: []
---

# 最终报告：Closure 7 场景审核 PR 合并后 manual-current-head 重测（AUTH-LOGIN-001）

## 1. 本次范围与固定版本

- 触发：`manual`；`scenarioMode = autonomous`；`initialization = false`；`scenarioChanges = null`，本轮**无场景维护动作**（不新增、不修改、不 rename、不 deprecated）。
- 固定版本：`baseCommit = null`，`targetCommit = fa6242b3105f1c01d7b82f363d145aca7e25ba16`，`includedCommits = []`；本轮是对固定 HEAD 的一次人工重测，不是基于 diff 的变更验证。
- 授权执行清单（`plan.md` 的 `## execution_scenarios`，唯一一项，计划顺序即执行顺序）：`AUTH-LOGIN-001`。执行清单非空，本轮不属于“零执行场景”。
- 未授权、不执行、结论不外推：`AUTH-ORIGIN-001`（draft）、`AUTH-REGISTRATION-001/002`、`AUTH-LOGIN-002`，以及重复邮箱 409、弱密码/无效邮箱 400、Origin 403、限流 429、Session 有效期等边界。
- 脱敏：本报告及所引工件一律以 `[REDACTED]` 指代邮箱、displayName、账号前缀、口令与完整 Cookie 值；Cookie 仅以 harness 值引用区分会话来源。测试账号字段、口令、Secret 与短期签名地址均不复述，证据地址只使用本次动态上下文提供的稳定路径。

## 2. 逐场景结果

### AUTH-LOGIN-001（登录状态恢复）：`passed`

计划的四项适用期望均是该场景的通过条件。依据 `review.md`（审核对象：`execution.md`、94 个 evidence 文件——7 张截图、3 个 console 日志、12 个页面快照、72 个 operation 命令回执）交付的逐场景结果：

- **期望 A：刷新后显示同一用户 —— 确认。** 登录后页面快照显示已登录态与一致的显示名/邮箱；刷新后页面仍为同一已登录态，刷新期间网络只有 `GET /api/auth/status => 200`，无新的 `POST /api/auth/login`，刷新后 `status` 的 `user.id` 与登录响应相同。截图 `auth-login-001-02-logged-in.png`、`auth-login-001-03-after-refresh.png` 画面一致。
- **期望 B：退出后页面回到登录状态 —— 确认。** `POST /api/auth/logout => 200`，响应体 `{"authenticated":false,"user":null}`；退出后页面回到「登录 Cynos」并显示「已安全退出。」（截图 `auth-login-001-04-after-logout.png`），表单回到空态、无遮挡。
- **期望 C：退出后的原 Session 访问受保护接口 401 —— 确认。** 退出前读取真实 Cookie（存在 `cynos_session`，`httpOnly: true`、`sameSite: Strict`、`secure: false`），随后恢复该 Cookie 并复核存在；`GET /api/me => 401`，响应体 `UNAUTHORIZED`，响应头 `x-request-id`；该请求的**真实 request-headers** 显示 `cookie: [REDACTED]`，且读取 → 恢复 → 实际请求头三处的 harness 值引用为同一会话值，故 401 不是“未带 Cookie 的平凡 401”。console 日志独立记录 `401 (Unauthorized) @ /api/me`。
- **期望 D：删除测试账号后旧 Session 与原凭据均不可用 —— 确认。** 删除前以原凭据重新登录成功（构成对照），随后 `DELETE /api/me => 200` 且响应体 `{"deleted":true,...}`，页面显示「测试账号及其会话已删除。」（截图 `auth-login-001-06-after-delete.png`）；恢复删除前 Cookie 后 `GET /api/me => 401`，该请求真实 request-headers 同样关联该会话值；清除 Cookie 后以原凭据登录 `POST /api/auth/login => 401`（`INVALID_CREDENTIALS`），页面显示「邮箱或密码不正确」（截图 `auth-login-001-07-deleted-credential-rejected.png`）。
- **“需要记录”辅助项 —— 已具备：** 登录/刷新后用户资料、退出后 HTTP 状态、Cookie 的 `HttpOnly` 与 `SameSite=Strict`、删除后提示与旧 Session/原凭据结果均已记录；`secure: false` 未在场景中要求，不作为缺陷。

该 `passed` 判定与聚合细节（四期望均确认、401 关联闭环）见 `review.md` §2、§7。计划与审核一致确认本场景的选取与执行范围符合请求约束。

## 3. 已确认产品问题与 Issue 决策

- `review.md` §3 交付：**本 Run 未发现产品缺陷，未识别出已确认产品 Bug 候选**。因此本报告 `confirmed_bugs` 为空，无 Issue create/link 决策需要作出，未调用 `query_issue_candidates`（没有本次已确认 Bug 可供查询）。
- 计划 §7 亦要求本轮证据不足时保持 blocked、不创建或关联任何 Issue。本轮 `blockingReasons` 为空、无失败场景，上述不创建/不关联的要求在结果层面无需触发。
- 审核指出 `execution.md` §5 关于“未创建或关联 Issue”的声明不在可核验证据范围内，仅作转述；本条同样如实保留该限定，未把该声明当作独立证据。既有 Issue 状态未在本轮读取，本轮亦未对任何 Issue 作关联或修改。

## 4. 记录、归因与执行偏差（均不影响产品结论）

以下为 `review.md` §5 交付的差异与缺口，观察者均为 Reviewer，来源与限定随事实保留：

1. **初始导航早于 `start_scenario`：** 审核观察到首个 `browser_navigate` 与随附快照（其回执标注 `scenarioId: null`、`scope: auxiliary`）早于 `start_scenario`；正式场景步骤（填写/点击等）均在 `start_scenario` 之后。审核认为这不改变被测对象或断言含义，但 `execution.md` §1/§5 称“执行顺序与计划一致”“无时序偏差”，未记录该先后细节，属轻度表述过度。
2. **“退出后 No cookies found”不可直接复核：** `execution.md` 引用的对应回执 `output` 为省略文本、仅 `credentialReferences` 为空，审核只能由“无返回引用”间接支持该结论；期望 C 不依赖它（关键是恢复后的 Cookie 与请求头关联），故不构成阻塞。
3. **归因精度：** 审核指出 `execution.md` §1 关于 `begin_scenario_execution` 声明内容的表述不出现在回执内，§2 步骤 5 把 401 状态挂在导航回执上而状态码实际来自后续网络回执；属表述归因问题，不影响观察事实。
4. **收尾登记未获证据支持：** `execution.md` §6 称已登记测试数据，但 94 个 evidence 中无对应回执。审核将其归为 Harness 收尾事项，不影响产品结论。
5. **时间口径：** 仅有响应 `date` 头与 Harness 上传时间可比对先后，**未获服务器时钟校准依据**；`execution.md` 未声称时钟已校准。审核只说明相对先后，未给出绝对事件时间，本报告不补算。
6. **未逐一读取的辅助证据：** 审核未逐一读取部分页面快照；这些属可选辅助材料，适用期望已由网络回执、请求头与截图支持，审核认为不构成覆盖缺口。本报告不将该情形改写为“证据列表为空”。
7. **执行中的一次重试：** 重新登录阶段一次填表因快照引用过期返回错误，重新快照后成功。审核认定属重试性质，未改变被测对象或降低期望。

## 5. 未完成项与覆盖缺口

- **无 base：** 无法给出 base↔target 的变更清单，也未取得“产品契约是否变化”的独立依据；本轮结论仅代表当前固定 target 下的运行观察。
- **历史 Run 不可用：** 计划记载 `query_run_history`（总体、按 `AUTH-LOGIN-001`、按 `logout`）均返回 `empty`，`AUTH-LOGIN-001` 的历史 Run 结果不可从受控接口取得；同仓历史报告（target `f287add3…`，结果为 passed）仅作线索，**不作为本轮证据**，其结论不外推。计划称 `historyIssuesAvailable = true`，但本轮无 Bug 候选，未进行 Issue 相似查询（见 §3）。
- **未覆盖范围（本报告不宣称已排除问题）：** `AUTH-ORIGIN-001` 及其他未授权场景、上文 §1 列出的边界条件。本轮通过不外推为项目其他部分没有问题。
- **证据类别与数量：** 本次证据包含 7 张截图（其中 3 张为页面检测 `detected`，4 张为 `not_detected`，均由截图检查记录给出）、3 个 console 日志、12 个页面快照、72 个 operation 命令回执，与 `review.md` 的清单一致。截图检查状态不替代场景判定，`passed` 的依据是审核交付的逐期望证据与关联。
- **清理状态：** 测试数据清理由 Harness 在本 Session 结束后统一处理；本报告不声称清理已完成，也未填写系统收尾区。场景内的删除行为本身已按证据判定（`DELETE /api/me => 200 {"deleted":true}`、恢复旧 Cookie 后 401、原凭据登录 401）。

## 6. 结论

- `AUTH-LOGIN-001`：**`passed`**（四项适用期望均有真实浏览器操作与可复核证据支持，401 的 Cookie 关联闭环）。
- 本 Run 结果：**`passed`**（`scenario_results` 仅含该场景；无 failed、无 blocked，`blockingReasons` 为空）。
- `confirmed_bugs` 为空：未发现已确认产品 Bug，因而无 Issue create/link 决策；本报告不代表已创建或关联任何 Issue。
- 保留的不确定性：无 base 的变更清单、不可取得的历史 Run 结果、未覆盖的场景与边界、未获校准依据的服务器时钟，以及 §4 列出的记录/归因层面偏差。

<!-- luowang-screenshot-inspection -->
## 截图采集标签

- [截图 1](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL2NvZGUtdW5kZXJzdGFuZGluZy12MDYwLzAxTTM1RzNNWlo2WjBGV0tFUU5YMDBBUjc5L2F1dGgtbG9naW4tMDAxLTAxLWZpbGxlZC1sb2dpbi1mb3JtLnBuZw>)：页面含可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 2](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL2NvZGUtdW5kZXJzdGFuZGluZy12MDYwLzAxTTM1RzNNWlo2WjBGV0tFUU5YMDBBUjc5L2F1dGgtbG9naW4tMDAxLTAyLWxvZ2dlZC1pbi5wbmc>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 3](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL2NvZGUtdW5kZXJzdGFuZGluZy12MDYwLzAxTTM1RzNNWlo2WjBGV0tFUU5YMDBBUjc5L2F1dGgtbG9naW4tMDAxLTAzLWFmdGVyLXJlZnJlc2gucG5n>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 4](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL2NvZGUtdW5kZXJzdGFuZGluZy12MDYwLzAxTTM1RzNNWlo2WjBGV0tFUU5YMDBBUjc5L2F1dGgtbG9naW4tMDAxLTA0LWFmdGVyLWxvZ291dC5wbmc>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 5](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL2NvZGUtdW5kZXJzdGFuZGluZy12MDYwLzAxTTM1RzNNWlo2WjBGV0tFUU5YMDBBUjc5L2F1dGgtbG9naW4tMDAxLTA1LXJlbG9naW4tZmlsbGVkLnBuZw>)：页面含可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 6](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL2NvZGUtdW5kZXJzdGFuZGluZy12MDYwLzAxTTM1RzNNWlo2WjBGV0tFUU5YMDBBUjc5L2F1dGgtbG9naW4tMDAxLTA2LWFmdGVyLWRlbGV0ZS5wbmc>)：页面含可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 7](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL2NvZGUtdW5kZXJzdGFuZGluZy12MDYwLzAxTTM1RzNNWlo2WjBGV0tFUU5YMDBBUjc5L2F1dGgtbG9naW4tMDAxLTA3LWRlbGV0ZWQtY3JlZGVudGlhbC1yZWplY3RlZC5wbmc>)：页面含可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
<!-- /luowang-screenshot-inspection -->

## Harness 清理收尾

测试数据清理完成；不改变本次功能验证结果。

清理适配器已独立核验 1 项测试数据不存在

全部登记测试数据均已独立核验清理

独立核验：luowang-01M35G3MZZ6Z0FWKEQNX00AR79-preset · run-scoped-http-cleanup · 2026-09-22T21:28:17.719Z · absent=true · sha256 d06e0599295b6e6b6f6447370546b2c98ea910429b02ea7fe47f0cfdfc763977
