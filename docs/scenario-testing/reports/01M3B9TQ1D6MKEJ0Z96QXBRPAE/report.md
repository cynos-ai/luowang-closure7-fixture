---
run_id: 01M3B9TQ1D6MKEJ0Z96QXBRPAE
trigger: manual
base_commit: null
target_commit: 751b75095fd2faf9f37136f35eaaacda368770f9
included_commits: []
result: passed
started_at: 2026-09-25T03:39:40.903Z
finished_at: 2026-09-25T03:44:09.212Z
scenario_results:
  - id: AUTH-LOGIN-001
    result: passed
  - id: AUTH-REGISTRATION-001
    result: passed
confirmed_bugs: []
---

# 最终报告：Cynos Website 已有场景非生产回归

## 1. 请求与固定范围

- 人工请求：对当前 `scenario-testing` 固定提交执行**已有场景**的非生产回归；仅用合成数据，所有新数据以本 Run ID 标记，结束时验证清理。
- Run `01M3B9TQ1D6MKEJ0Z96QXBRPAE`，`trigger = manual`，`scenarioMode = autonomous`，`initialization = false`，`scenarioChanges = null`（本 Run 无场景 patch，未新增/修改/废弃场景）。
- `targetCommit = 751b75095fd2faf9f37136f35eaaacda368770f9`；`baseCommit = null`；`includedCommits = []`。
- 计划 `## execution_scenarios` 有序列出 2 个场景：`AUTH-LOGIN-001`、`AUTH-REGISTRATION-001`。本报告 `scenario_results` 与该清单顺序、数量一一对应，未用正文其他 ID 补齐（`AUTH-LOGIN-002`、`AUTH-REGISTRATION-002`、`AUTH-ORIGIN-001` 为 draft，不在执行集）。

**无 base 的限定**：`baseCommit = null`，无 base↔target 变化清单，无法确认本次契约是否发生变化。以下结论仅限固定 target 的本次运行观察，不外推到其他提交、其他分支或生产环境。

## 2. 执行与证据概览

- 执行主体与方式：本 Run 由模型角色（Runner）经 Playwright MCP 在隔离非生产实例上执行；`browserRequired = true`，确有实际浏览器操作回执（导航、点击、填表、快照、网络请求、Cookie 读取/恢复、截图），非仅存在快照文件。计划 `requiresBrowser = true`，与实际执行相符。
- 审核主体：Reviewer 独立复核，逐张实读 9 张截图并比对原始工具回执；其判断依据为原始回执，未沿用 Runner 叙述。
- 全部为模型角色执行，Runner 截图检查与 Reviewer 图片核对**均非人工复核**；本 Run 无人工复核记录。
- 本 Run 证据包含：9 张 `.png` 截图、72 个 `operation-*.json` 操作回执、约 20 个 `page-*.yml` 浏览器快照、4 个 `console-*.log`。证据地址取自本 Run 动态上下文，正文按需原样引用（见第 8 节）；本报告不复述任何账号字段、口令或凭据值。

## 3. 逐场景结果

> 以下判定为 Reviewer 在本 Run `review.md` 中交付的独立结论；本节按原文转述其依据与限定，不做证据重审。观察者一律为 Reviewer；时间与序号来源为本 Run 的 `operation-*` 回执与快照，非另建时钟基准。

### AUTH-LOGIN-001 登录状态恢复 — passed

Reviewer 依据本 Run 原始工具回执逐项核对 4 项适用期望，结论为全部符合：

1. **刷新后显示同一用户**：刷新后快照仍显示同一用户与注册邮箱，`GET /api/auth/status => 200`；Reviewer 实读 `AUTH-LOGIN-001-01-loggedin-welcome.png` 与 `AUTH-LOGIN-001-02-after-refresh.png`，两图一致显示同一用户与邮箱。
2. **退出后页面回到登录状态**：`POST /api/auth/logout => 200`，随后快照为登录表单并显示「已安全退出。」；Reviewer 实读 `AUTH-LOGIN-001-03-after-logout.png` 一致。
3. **退出后原 Session 访问受保护接口返回 401**：Reviewer 确认该 401 **非平凡**——退出前经 `browser_cookie_get` 取得会话（凭据引用 `credential-cd53aa714c3bc89d211fa258134dbe38`，属性 `httpOnly: true, sameSite: Strict`），退出后以同引用恢复并重放，`GET /api/me` 返回 401，且请求详情显示请求头确实携带该 Cookie 引用，排除「未带 Cookie 的平凡 401」；响应体错误码 `UNAUTHORIZED` 与 `x-request-id` 互证。
4. **删除后旧 Session 与原凭据均不可用**：重登录成功后取到删除前会话（引用 `credential-76b41d3c14c7d4755562b8d6bb1cd2be`），`DELETE /api/me => 200`，页面提示「测试账号及其会话已删除。」；删除后同引用重放 `GET /api/me => 401`（请求头携带同一 Cookie 引用），原邮箱+原密码 `POST /api/auth/login => 401`，页面提示「邮箱或密码不正确」；Reviewer 实读 `AUTH-LOGIN-001-04-after-delete.png`、`AUTH-LOGIN-001-05-relogin-rejected.png` 一致。

- 场景「需要记录」项均留痕：登录/刷新后用户资料、退出后 HTTP 状态、Cookie 的 `HttpOnly` 与 `SameSite=Strict`、删除后提示与旧 Session/原凭据结果。
- Reviewer 未对该场景降级或豁免任何适用期望。

### AUTH-REGISTRATION-001 新用户注册 — passed

Reviewer 逐项核对 4 项适用期望，结论为全部符合：

1. **页面显示欢迎信息**：`POST /api/auth/register => 201`，随后快照为欢迎页并显示注册邮箱；Reviewer 实读 `AUTH-REGISTRATION-001-01-welcome.png` 一致。
2. **`GET /api/auth/status` 返回已登录用户**：`GET /api/auth/status => 200`，响应体 `{"authenticated":true,"user":{...}}` 含同一邮箱与 displayName；刷新后快照与 `AUTH-REGISTRATION-001-02-after-refresh-welcome.png` 一致。
3. **数据库不保存明文密码**：Reviewer 记录受控只读聚合结果为 `accounts: 1, argon2id: 1, other: 0`（来源字段 `controlled-test-account-storage`，`runId` 为本 Run），命中计划预先约定的判定条件（`accounts ≥ 1`、`other = 0`、`argon2id = accounts`）；计数器与 Run 内时序自洽（该时点登录场景账户已删除，仅剩注册场景账户）。
   - **Reviewer 明确标注的边界（如实保留）**：该聚合只覆盖本 Run 标记账户的口令列存储格式，**不覆盖其他行、其他位置或生产库**，因此不构成「整个数据库无任何明文」的绝对结论；原期望仅在注册账户这一验证对象上得到支持。
   - **来源限制（Reviewer 第 3 节）**：该数据点记为聚合计数，未见可独立追溯的独立工具回执（如带 Token 的 HTTP 调用收据），Reviewer 按受限口径采纳，不声称它由某次可独立追溯的 Runner 请求产生，也不外推到生产库。
4. **删除后原邮箱密码不能登录**：`DELETE /api/me => 200`，提示同上；随后原凭据 `POST /api/auth/login => 401`，页面提示「邮箱或密码不正确」；Reviewer 实读 `AUTH-REGISTRATION-001-03-after-delete.png`、`AUTH-REGISTRATION-001-04-relogin-rejected.png` 一致。

- 场景「需要记录」项均留痕。计划曾预留「受控只读聚合不可用则期望 3 未验证、场景 blocked」的分支；Reviewer 记录本 Run 该观察**可用**，故未触发该分支。此为 Reviewer 对受限观察可达性的判断，不是 Runner 的完成声明。

### 汇总口径

- 场景数：2（执行集内），结果分布 passed 2 / failed 0 / blocked 0。
- 本次新确认产品 Bug 数：0（见第 4 节）。
- 未验证/未执行的适用期望：无（两场景适用期望均获支持；注册场景期望 3 的**观察覆盖面**受上述边界限制，非「未验证」）。

## 4. 已知问题（open Issue）与本批关系：未复现

本 Run 动态上下文列出 2 个 open Issue，均与本批场景直接相关：

- #2「退出登录接口不撤销服务端 Session（logout 返回 200，但退出前会话重放后 `GET /api/me` 仍 200）」——对应 AUTH-LOGIN-001 期望 3。
- #1「删除账号接口返回成功但未删除账号与会话（`DELETE /api/me` 返回成功，但旧 Session 与原凭据仍可用）」——对应 AUTH-LOGIN-001 期望 4。

Reviewer 依据本 Run 原始回执的独立结论：**两者均未在本 Run 的固定 target 上复现**，该结论仅限本次运行与固定 target，不推广为「该缺陷不存在」或「全部提交均已修复」。

因本 Run 未确认任何新的产品 Bug，`confirmed_bugs` 为空，**不产生 Issue create/link 决策**。相应地，本报告未发起 Bug 候选查询（无候选对象），也不存在因查询不可用而需记录的「Issue 查询覆盖缺口」；这不表示「已确认不存在任何重复 Issue」，仅表示本批无待归档的已确认 Bug。

## 5. 记录与报告质量问题（不影响产品结论）

以下为 Reviewer 在审核中交付的记录层面发现，均明确判定为**不影响任一场景结果**，本报告如实保留、不改判：

1. 执行记录复述了会话令牌的局部值前缀。该值为会话令牌而非口令且已部分脱敏，不构成口令泄漏；Reviewer 认为更稳妥的做法是仅写凭据引用 ID。本报告不复述其内容。
2. progress 事件 ID 标注异常（`finish_scenario` 的 `scenarioId` 与其 `completed` 集合不一致）。Reviewer 判定为记录字段错位，不改变已完成场景集合（最终汇总事件完整）。
3. `execution.md` 引用序号轻微不精确（将网络状态证据的序号记到相邻的导航操作上），属引用粒度问题，原始证据仍支持其结论。
4. 受控只读聚合的独立可追溯性受限（见第 3 节 AUTH-REGISTRATION-001 期望 3 的来源限制）。

## 6. 覆盖缺口与限制

1. **无 base**：`baseCommit = null`，无法核对 base↔target 变化；结论仅限固定 target 本次运行观察。
2. **历史有限**：可查历史仅 1 条旧 Run（target `7062f9a...`，含 blocked 的持久层核验项），与本 Run target 不同；本批不沿用其结论，其 blocked 项亦不追改。
3. **draft 场景未执行**：`AUTH-LOGIN-002`（统一凭据错误 / 失败不建会话）、`AUTH-REGISTRATION-002`（重复邮箱拒绝）、`AUTH-ORIGIN-001`（Origin 校验）保持 draft，本批不执行、不作通过/失败判断。
4. **注册期望 3 的覆盖面**：仅覆盖本 Run 标记账户的口令列格式计数，不覆盖其他数据位置或生产库；该期望的通过以此受限观察为据。
5. **run-scoped 查删/聚合接口契约**（默认关闭、鉴权拒绝、范围精确、级联、幂等、其他 Run 保留等）：本批未由 Agent 独立执行，属本批范围外，不冒充已覆盖。该路由所需受控部署 Token 不交给测试 Agent；Reviewer 记录的非浏览器聚合数据点不代表该路由契约已被本批独立执行。
6. **本批通过范围有限**：仅表示执行集内 2 个 approved 场景在本 Run 与固定 target 下符合期望，**不代表整个项目无问题**，也不代表 draft 场景或范围外接口已通过。
7. **人工复核缺位**：本流程全为模型角色执行，无人工复核记录。

## 7. 测试数据与清理状态

- 计划要求：本 Run 全部合成账户以 `luowang-<完整 Run ID>-` 标记；未真实应用到数据上的标记不计入清理范围。
- 场景内 `DELETE /api/me` 是**业务操作**（用于期望 4 的验证），**不作为测试数据清理完成的依据**。
- 测试数据的最终清理由 Harness 在本 Session 结束后统一核验；本报告**不声称清理已完成**，也未填写任何系统收尾区。清理结果无论成败，均不改变本报告已成立的场景结论。

## 8. 证据索引（本 Run 稳定地址）

以下为正文判定所引用的关键证据，地址原样取自本 Run 动态上下文。

截图（Reviewer 逐张实读）：

- AUTH-LOGIN-001-01-loggedin-welcome.png：`/api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL211bHRpLXByb2plY3QtdjA2MS1saXZlLTRkNDIwODQwL3Byb2plY3RzLzRiMWNiODljLTUzOWMtNGIxZC1hMTk3LTY4ODM4OWU4MDhjOC9ydW5zLzAxTTNCOVRRMUQ2TUtFSjBaOTZRWEJSUEFFL0FVVEgtTE9HSU4tMDAxLTAxLWxvZ2dlZGluLXdlbGNvbWUucG5n`
- AUTH-LOGIN-001-02-after-refresh.png：`/api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL211bHRpLXByb2plY3QtdjA2MS1saXZlLTRkNDIwODQwL3Byb2plY3RzLzRiMWNiODljLTUzOWMtNGIxZC1hMTk3LTY4ODM4OWU4MDhjOC9ydW5zLzAxTTNCOVRRMUQ2TUtFSjBaOTZRWEJSUEFFL0FVVEgtTE9HSU4tMDAxLTAyLWFmdGVyLXJlZnJlc2gucG5n`
- AUTH-LOGIN-001-03-after-logout.png：`/api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL211bHRpLXByb2plY3QtdjA2MS1saXZlLTRkNDIwODQwL3Byb2plY3RzLzRiMWNiODljLTUzOWMtNGIxZC1hMTk3LTY4ODM4OWU4MDhjOC9ydW5zLzAxTTNCOVRRMUQ2TUtFSjBaOTZRWEJSUEFFL0FVVEgtTE9HSU4tMDAxLTAzLWFmdGVyLWxvZ291dC5wbmc`
- AUTH-LOGIN-001-04-after-delete.png：`/api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL211bHRpLXByb2plY3QtdjA2MS1saXZlLTRkNDIwODQwL3Byb2plY3RzLzRiMWNiODljLTUzOWMtNGIxZC1hMTk3LTY4ODM4OWU4MDhjOC9ydW5zLzAxTTNCOVRRMUQ2TUtFSjBaOTZRWEJSUEFFL0FVVEgtTE9HSU4tMDAxLTA0LWFmdGVyLWRlbGV0ZS5wbmc`
- AUTH-LOGIN-001-05-relogin-rejected.png：`/api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL211bHRpLXByb2plY3QtdjA2MS1saXZlLTRkNDIwODQwL3Byb2plY3RzLzRiMWNiODljLTUzOWMtNGIxZC1hMTk3LTY4ODM4OWU4MDhjOC9ydW5zLzAxTTNCOVRRMUQ2TUtFSjBaOTZRWEJSUEFFL0FVVEgtTE9HSU4tMDAxLTA1LXJlbG9naW4tcmVqZWN0ZWQucG5n`
- AUTH-REGISTRATION-001-01-welcome.png：`/api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL211bHRpLXByb2plY3QtdjA2MS1saXZlLTRkNDIwODQwL3Byb2plY3RzLzRiMWNiODljLTUzOWMtNGIxZC1hMTk3LTY4ODM4OWU4MDhjOC9ydW5zLzAxTTNCOVRRMUQ2TUtFSjBaOTZRWEJSUEFFL0FVVEgtUkVHSVNUUkFUSU9OLTAwMS0wMS13ZWxjb21lLnBuZw`
- AUTH-REGISTRATION-001-02-after-refresh-welcome.png：`/api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL211bHRpLXByb2plY3QtdjA2MS1saXZlLTRkNDIwODQwL3Byb2plY3RzLzRiMWNiODljLTUzOWMtNGIxZC1hMTk3LTY4ODM4OWU4MDhjOC9ydW5zLzAxTTNCOVRRMUQ2TUtFSjBaOTZRWEJSUEFFL0FVVEgtUkVHSVNUUkFUSU9OLTAwMS0wMi1hZnRlci1yZWZyZXNoLXdlbGNvbWUucG5n`
- AUTH-REGISTRATION-001-03-after-delete.png：`/api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL211bHRpLXByb2plY3QtdjA2MS1saXZlLTRkNDIwODQwL3Byb2plY3RzLzRiMWNiODljLTUzOWMtNGIxZC1hMTk3LTY4ODM4OWU4MDhjOC9ydW5zLzAxTTNCOVRRMUQ2TUtFSjBaOTZRWEJSUEFFL0FVVEgtUkVHSVNUUkFUSU9OLTAwMS0wMy1hZnRlci1kZWxldGUucG5n`
- AUTH-REGISTRATION-001-04-relogin-rejected.png：`/api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL211bHRpLXByb2plY3QtdjA2MS1saXZlLTRkNDIwODQwL3Byb2plY3RzLzRiMWNiODljLTUzOWMtNGIxZC1hMTk3LTY4ODM4OWU4MDhjOC9ydW5zLzAxTTNCOVRRMUQ2TUtFSjBaOTZRWEJSUEFFL0FVVEgtUkVHSVNUUkFUSU9OLTAwMS0wNC1yZWxvZ2luLXJlamVjdGVkLnBuZw`

操作回执与页面/控制台记录（本 Run `operation-*.json`、`page-*.yml`、`console-*.log`，共 72 + 约 20 + 4 项，Reviewer 按其序号引用）：Reviewer 判定所依据的原始工具回执均在本 Run 证据清单内，正文以序号（如登录场景的网络/请求头回执、注册场景的注册请求与状态查询回执）指代；具体地址同属本 Run evidence 列表，未在正文逐一展开以避免冗余。

> 说明：上述文件的存在与读取成功，只支持 Reviewer 对内容的核对；除非有对应的操作回执或来源字段，本报告不据文件存在推断某执行者在本 Run 做过对应操作。受控只读聚合属来源字段受限的数据点（见第 3、5 节）。

## 9. 结论与建议的下一步

- **本 Run 结果：passed**（`blockingReasons` 为空；两场景均 passed，无失败、无阻塞）。
- 执行集内 2 个 approved 场景在本 Run 与固定 target `751b750` 下均符合既有期望；open Issue #1、#2 对应的业务结果**未在本次运行复现**（仅限本次运行与固定 target）。
- 无本次新确认的产品 Bug，**无需 Issue create/link**；无因查询不可用产生的覆盖缺口。

建议的下一步（均在**当前授权之外或需另行确认**时方可执行）：

1. 若需确认「数据库不保存明文密码」的更强结论，需另行取得受控持久层观察的**更广覆盖面**（其他行/其他位置），该能力需要新的授权与部署侧配合，不在本批权限内。
2. 若需闭合历史 Run 遗留的 blocked 持久层核验项，应以其自身 target 重新规划执行，不追改历史 Run。
3. 3 个 draft 场景（`AUTH-LOGIN-002`、`AUTH-REGISTRATION-002`、`AUTH-ORIGIN-001`）的正式执行与人工定级需由相应角色/人工决定，本批无权替代。
4. run-scoped 查删/聚合接口契约需在具备受控部署 Token 的受控条件下另行规划，不属本批 Agent 可执行范围。

<!-- luowang-screenshot-inspection -->
## 截图采集标签

- [截图 1](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL211bHRpLXByb2plY3QtdjA2MS1saXZlLTRkNDIwODQwL3Byb2plY3RzLzRiMWNiODljLTUzOWMtNGIxZC1hMTk3LTY4ODM4OWU4MDhjOC9ydW5zLzAxTTNCOVRRMUQ2TUtFSjBaOTZRWEJSUEFFL0FVVEgtTE9HSU4tMDAxLTAxLWxvZ2dlZGluLXdlbGNvbWUucG5n>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 2](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL211bHRpLXByb2plY3QtdjA2MS1saXZlLTRkNDIwODQwL3Byb2plY3RzLzRiMWNiODljLTUzOWMtNGIxZC1hMTk3LTY4ODM4OWU4MDhjOC9ydW5zLzAxTTNCOVRRMUQ2TUtFSjBaOTZRWEJSUEFFL0FVVEgtTE9HSU4tMDAxLTAyLWFmdGVyLXJlZnJlc2gucG5n>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 3](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL211bHRpLXByb2plY3QtdjA2MS1saXZlLTRkNDIwODQwL3Byb2plY3RzLzRiMWNiODljLTUzOWMtNGIxZC1hMTk3LTY4ODM4OWU4MDhjOC9ydW5zLzAxTTNCOVRRMUQ2TUtFSjBaOTZRWEJSUEFFL0FVVEgtTE9HSU4tMDAxLTAzLWFmdGVyLWxvZ291dC5wbmc>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 4](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL211bHRpLXByb2plY3QtdjA2MS1saXZlLTRkNDIwODQwL3Byb2plY3RzLzRiMWNiODljLTUzOWMtNGIxZC1hMTk3LTY4ODM4OWU4MDhjOC9ydW5zLzAxTTNCOVRRMUQ2TUtFSjBaOTZRWEJSUEFFL0FVVEgtTE9HSU4tMDAxLTA0LWFmdGVyLWRlbGV0ZS5wbmc>)：页面含可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 5](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL211bHRpLXByb2plY3QtdjA2MS1saXZlLTRkNDIwODQwL3Byb2plY3RzLzRiMWNiODljLTUzOWMtNGIxZC1hMTk3LTY4ODM4OWU4MDhjOC9ydW5zLzAxTTNCOVRRMUQ2TUtFSjBaOTZRWEJSUEFFL0FVVEgtTE9HSU4tMDAxLTA1LXJlbG9naW4tcmVqZWN0ZWQucG5n>)：页面含可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 6](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL211bHRpLXByb2plY3QtdjA2MS1saXZlLTRkNDIwODQwL3Byb2plY3RzLzRiMWNiODljLTUzOWMtNGIxZC1hMTk3LTY4ODM4OWU4MDhjOC9ydW5zLzAxTTNCOVRRMUQ2TUtFSjBaOTZRWEJSUEFFL0FVVEgtUkVHSVNUUkFUSU9OLTAwMS0wMS13ZWxjb21lLnBuZw>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 7](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL211bHRpLXByb2plY3QtdjA2MS1saXZlLTRkNDIwODQwL3Byb2plY3RzLzRiMWNiODljLTUzOWMtNGIxZC1hMTk3LTY4ODM4OWU4MDhjOC9ydW5zLzAxTTNCOVRRMUQ2TUtFSjBaOTZRWEJSUEFFL0FVVEgtUkVHSVNUUkFUSU9OLTAwMS0wMi1hZnRlci1yZWZyZXNoLXdlbGNvbWUucG5n>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 8](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL211bHRpLXByb2plY3QtdjA2MS1saXZlLTRkNDIwODQwL3Byb2plY3RzLzRiMWNiODljLTUzOWMtNGIxZC1hMTk3LTY4ODM4OWU4MDhjOC9ydW5zLzAxTTNCOVRRMUQ2TUtFSjBaOTZRWEJSUEFFL0FVVEgtUkVHSVNUUkFUSU9OLTAwMS0wMy1hZnRlci1kZWxldGUucG5n>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 9](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL211bHRpLXByb2plY3QtdjA2MS1saXZlLTRkNDIwODQwL3Byb2plY3RzLzRiMWNiODljLTUzOWMtNGIxZC1hMTk3LTY4ODM4OWU4MDhjOC9ydW5zLzAxTTNCOVRRMUQ2TUtFSjBaOTZRWEJSUEFFL0FVVEgtUkVHSVNUUkFUSU9OLTAwMS0wNC1yZWxvZ2luLXJlamVjdGVkLnBuZw>)：页面含可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
<!-- /luowang-screenshot-inspection -->

## Harness 清理收尾

测试数据清理完成；不改变本次功能验证结果。

清理适配器已独立核验 2 项测试数据不存在

全部登记测试数据均已独立核验清理

独立核验：luowang-01M3B9TQ1D6MKEJ0Z96QXBRPAE-login · run-scoped-http-cleanup · 2026-09-25T03:44:42.571Z · absent=true · sha256 11cb7de03cbb9243024ac8bc40011699b2a50bbd7fa00b05423a5a60932eb235

独立核验：luowang-01M3B9TQ1D6MKEJ0Z96QXBRPAE-reg · run-scoped-http-cleanup · 2026-09-25T03:44:42.573Z · absent=true · sha256 11cb7de03cbb9243024ac8bc40011699b2a50bbd7fa00b05423a5a60932eb235
