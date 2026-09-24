# 审核报告：Cynos Website 已有场景非生产回归（AUTH-LOGIN-001 / AUTH-REGISTRATION-001）

- Run：`01M39Z2H59PP6TWS8D9JHAB0RM`；触发 `manual`；`scenarioMode = autonomous`；`initialization = false`
- 固定版本：`targetCommit = 7062f9a65651eeef7abe9f6a79ed4dc4c5f583d9`，`baseCommit = null`，`includedCommits = []`
- 执行场景（plan.md 唯一 `## execution_scenarios`）：AUTH-LOGIN-001、AUTH-REGISTRATION-001
- 计划引用校验：`query_source_reads(scope="plan")` 返回 `planHash = 4860def1d23d0ee8f5c987a937177c87cf68b63f8acc078731d4efd674a41a06`，与 plan.md 开头 Harness 元数据一致；场景正文引用 `AUTH-LOGIN-001.md` / `AUTH-REGISTRATION-001.md` 为 `full-file` 覆盖，contentHash 与 `selectedScenarioSnapshot` 的 `contentSha256` 逐一相符（`6f60babb…`、`4a339eb5…`）。
- 场景变更：`scenarioChanges = null`；`read_run_artifact("scenario-changes.patch")` 返回不存在 → 本轮确无场景补丁，不存在“已维护”的变更声明。
- 审核方法：先读 plan.md 与冻结场景正文，再独立读取 Harness 捕获的 76 份 operation 回执、7 份 command 回执、4 份控制台日志、19 份页面快照与 3 张截图，形成判断后才打开 `execution.md` 对照。

## 独立结论（Reviewer 判断）

| 场景 | 独立结论 | 说明 |
| --- | --- | --- |
| AUTH-LOGIN-001 登录状态恢复 | **passed**（4/4 明列期望均有实际观察支持） | 见 §1 |
| AUTH-REGISTRATION-001 新用户注册 | **blocked**（3/4 期望已确认，1 项明列期望未验证） | 见 §2 |

已确认产品缺陷：**无**。未发现任何明列期望被实际行为违反。整体不完整的原因只有一个：注册场景的持久层明文密码检查缺少受控观察能力，Runner 自己也在 `execution.md` 记为“未独立验证”。

---

## 1. AUTH-LOGIN-001 登录状态恢复 — passed

前置处理：环境初始为空，Runner 在场景内先经注册创建前置账户（`luowang-01M39Z2H59PP6TWS8D9JHAB0RM-login@example.test`），后续登录/刷新/退出/删除均使用同一账户。plan.md §4 已明确允许“隔离环境为空时，可先经注册创建该账户以满足前置”，该做法不改变任何期望的含义，属可接受偏差。

逐项期望（Reviewer 依据原始回执，非采信 Runner 叙述）：

- **A 刷新后显示同一用户**：满足。operation-7.json（seq 7，注册提交后切换）与 operation-11.json（seq 12）为欢迎态；operation-16/17.json（seq 17/18）重新导航至 `/` 后，页面快照 `page-2026-09-24T15-04-32-543Z.yml` 仍显示同一用户与同一邮箱 `…-login@example.test`（快照正文见 operation-17.json 内联输出）。以导航重载等价于刷新，未改变期望含义。
- **B 退出后页面回到登录状态**：满足。operation-18.json（seq 19，点击“退出登录”）→ operation-19.json（seq 20）网络列表含 `POST /api/auth/logout => [200]` → operation-20.json（seq 21）快照显示登录表单与“已安全退出。”。
- **C 退出后的原 Session 访问受保护接口返回 401**：满足，且不是“未带 Cookie 的平凡 401”。链路可核：
  1. operation-14.json（seq 15）`browser_cookie_get` 读到退出前 `cynos_session`，引用 `credential-f8816a1e81c3dd08bfdf94ecde4518c5`；
  2. operation-21.json（seq 22）`browser_cookie_set` 以 `source: restore-input`、同一引用 `f8816a…` 恢复该值；
  3. operation-22/23.json（seq 23/24）导航 `/api/me` 并列出 `GET /api/me => [401] Unauthorized`，快照 `page-2026-09-24T15-04-38-838Z.yml` 与 operation-26.json（seq 27）响应体 `{"error":{"code":"UNAUTHORIZED",…}}` 一致；
  4. operation-25.json（seq 26）`request-headers` 显示 `cookie: [REDACTED]` 且引用同为 `credential-f8816a…`（`source: observed-request-header`）。Harness 说明引用在 Run 内比较精确值，故可确认请求确实携带退出前的原会话值。控制台 `console-2026-09-24T15-04-38-802Z.log` 亦记录该 401。
- **D 删除后旧 Session 与原凭据均不可用**：满足。
  - 重新登录：operation-30/31.json（seq 31/32）填表并提交 → operation-34.json（seq 35）网络列表含 `POST /api/auth/login => [200]`，页面回到欢迎态；operation-32.json（seq 33）读到的 `cynos_session` 引用为 `credential-a1e332366cd38191e2788af6fe516b47`，与退出前 `f8816a…` 不同，说明新会话已签发。
  - 删除账号：operation-33.json（seq 34）点击“删除测试账号” → operation-34.json（seq 35）含 `DELETE /api/me => [200]` → operation-35.json（seq 36）快照显示“测试账号及其会话已删除。”。
  - 旧会话复查：operation-36.json（seq 37）以删除前读到的 `a1e332…` 恢复 Cookie → operation-37.json（seq 38）导航 `/api/me`，快照 `page-2026-09-24T15-04-52-934Z.yml` 为 UNAUTHORIZED；operation-38.json（seq 39）请求头引用同为 `a1e332…`（确认携带被删会话原值）；operation-39.json（seq 40）响应体 `{"error":{"code":"UNAUTHORIZED",…}}`。
  - 原凭据复查：operation-42/43.json（seq 43/44）用与注册时同引用的邮箱/口令填表提交 → operation-44.json（seq 45）`POST /api/auth/login => [401]`，operation-46.json（seq 47）响应体 `INVALID_CREDENTIALS`；operation-45.json（seq 46）快照显示“邮箱或密码不正确”，截图 `login-001-final-login-rejected.png`（operation-48.json，seq 49）显示同一提示且仍停留登录态。
- “需要记录”项：退出后 HTTP 状态已记（401）；Cookie 属性在 operation-14.json（seq 15）为 `httpOnly: true, secure: false, sameSite: Strict`，满足题述记录要求（题目只要求记录这两项属性，未要求 `Secure`）；删除与刷新后的用户资料、删除提示均有快照。

## 2. AUTH-REGISTRATION-001 新用户注册 — blocked

已确认满足的期望：

- **页面显示欢迎信息**：满足。operation-57/58.json（seq 58/59）注册后快照显示“你好，…”并显示 `luowang-01m39z2h59pp6tws8d9jhab0rm-reg@example.test`；`POST /api/auth/register => [201] Created`（operation-57.json，seq 58）；注册响应体 `{"authenticated":true,"user":{…,"id":"377f7371-…"}}`（operation-60.json，seq 61）；截图 `registration-001-welcome.png`（operation-61.json，seq 62）显示欢迎态。
- **`GET /api/auth/status` 返回已登录用户**：满足。operation-62.json（seq 63）导航至 `/api/auth/status`，快照 `page-2026-09-24T15-05-14-922Z.yml` 与 operation-63.json（seq 64）响应体均为 `{"authenticated":true,"user":{"id":"377f7371-…","email":"…-reg@example.test",…}}`，id 与注册响应一致。
- **可删除当前测试账号、原邮箱密码随后不能再登录**：满足。operation-66.json（seq 73）点击“删除测试账号” → operation-67.json（seq 74）`DELETE /api/me => [200]` → operation-68.json（seq 75）快照“测试账号及其会话已删除。”；operation-70/71.json（seq 77/78）用原邮箱原口令提交 → operation-72.json（seq 79）`POST /api/auth/login => [401]`，operation-74.json（seq 81）响应体 `INVALID_CREDENTIALS`，operation-73.json（seq 80）快照与截图 `registration-001-final-login-rejected.png`（operation-75.json，seq 82）显示“邮箱或密码不正确”。重载会话保持亦见于 operation-64/65.json（seq 71/72）。

未确认（阻塞项）：

- **“数据库不保存明文密码”未验证**。冻结场景正文将其列为期望，plan.md 亦要求“保留期望、不降为可选”。本 Run 全程无任何持久层观察：Runner 的三次尝试均未产出结果——`npm test` 报 `vitest: not found`（command-4.json，exitCode 127）、`npx vitest run` 从公网拉取 `vitest@5.0.1` 后超时无输出（command-5.json，exitCode null，耗时约 2 分钟）、`npx vitest run --reporter=basic` 被拒（command-6.json，`COMMAND_INVALID`）；`npm run test-data:cleanup` 亦无此脚本（command-2.json）。Runner 在 `execution.md` 中把该项表述为“有界满足（响应体不回显口令）”，但“响应体不回显口令”“页面文案称会做哈希”都不等于“持久层 `password` 列为哈希”，该论述未覆盖原文期望对象。此为验证能力缺口（缺少受控 DB 读取），不是产品结论，也不能作为期望不适用或降级为备注的依据。**该项未验证之前，本场景不成立为 passed。**

产品层面未观察到违反该期望的证据，也没有观察到缺陷；因此本场景保留 3 项已确认成功，仅因上述 1 项明列期望不可确认判 blocked。

## 3. 已确认产品问题

无。两个场景中所有被实际观察到的明列期望均符合预期：退出后原会话 401、删除后旧会话 401 与原凭据 `INVALID_CREDENTIALS`、注册即登录、刷新保活、欢迎态与删除提示文案等。历史 Issue #1/#2 所对应的业务结果（删除账号会话失效、logout 撤销服务端会话）在本 Run 固定 target 上均按预期表现，本轮未复现问题。

## 4. 执行记录与口径问题（不影响已成立的产品结果）

1. **期望口径偏差**：`execution.md` 将注册场景的“数据库不保存明文密码”记为“有界满足”并计入“passed（4/4 期望）”。该项并非辅助记录，而是场景明列期望；将其降为备注后判 4/4，与原文口径不符。Reviewer 按原文判 blocked。Runner 在同一节内已如实写明“未独立验证”，此偏差属结论口径问题，非隐瞒。
2. **辅助命令被计入场景且含越界尝试**：command-2 至 command-7（seq 65–70）均为 `declared: true, scope: scenario, scenarioId: AUTH-REGISTRATION-001`，实际是清理/测试环境探测命令；其中 `npx vitest run` 尝试从公共 registry 安装包并挂起约 2 分钟（15:05:19→15:07:19）。这些操作未改变被测对象状态，也未产生测试结论，属执行噪声；`curl /health`（command-1.json）被 Harness 拒绝，环境可达性实际由浏览器导航确认。
3. **Runner 引用的 operation 编号与文件一致**：抽查 operation-11/14/17/20/22/23/25/26/31/32/34/35/36/37/38/39/42/43/44/45/46/48/57/60/63/67/72/74 的 source、sequence 与内联输出，均与 `execution.md` 描述的操作与观察相符，未发现 Runner 把未执行操作写成已执行，也未发现跨场景串位。
4. **时间表达**：Runner 未声称服务器时钟已校准，仅按先后顺序表达，符合 Harness 记录时间与响应 `date`/`createdAt` 无共同基准的实际；审核不追加时间结论。

## 5. 覆盖缺口与未决项（供最终 Main 保留）

- **明文密码持久化核验未闭合**（本批唯一阻塞判定）：需具备受控持久层读取能力的角色核读该合成账户的 `users` 口令列（本 Run 该账户已被 `DELETE /api/me` 删除，需重建等价合成账户再核）。
- **无 base**：`baseCommit = null`，无法产出 base↔target 变化清单，结论仅限固定 target 的本次运行观察。
- **draft 场景未执行**：`AUTH-LOGIN-002`、`AUTH-REGISTRATION-002`、`AUTH-ORIGIN-001` 保持 draft，未纳入本轮；plan.md 已说明其候选期望尚待正式执行与人工审核定级，非本批必要缺口。
- **run-scoped 清理接口未执行**：`GET/DELETE /api/luowang/test-data/:runId` 因 `CYNOS_TEST_DATA_CLEANUP_TOKEN` 不交给测试 Agent 而无法独立鉴权执行；`execution.md` 已如实记为覆盖缺口，未冒充已覆盖。评审同意其不构成本批场景遗漏。
- **测试数据收尾**：两条合成账户已由场景内 `DELETE /api/me` 删除并二次核验原凭据 401；`list_pending_test_data` 仍显示 2 条 `registered`。按约定此项由 Harness 在最终 Main 后核验，其成败不影响本报告的场景结论。

## 6. 结论摘要

- AUTH-LOGIN-001：**passed**（A/B/C/D 均有可复核的浏览器操作、网络状态码、Cookie 引用关联与页面快照支持）。
- AUTH-REGISTRATION-001：**blocked**（欢迎信息、`GET /api/auth/status` 已登录、删除后原凭据不可用三项已确认；“数据库不保存明文密码”因缺少受控持久层读取而未验证，期望保留不降级）。
- 已确认产品缺陷：无。
- 总体：部分通过、整体不完整，缺口为验证能力而非产品行为；本报告依据均取自本 Run 受控证据，未外推到其他提交或生产环境。
