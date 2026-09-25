# 审核记录：Cynos Website 已有场景非生产回归

- Run：`01M3B9TQ1D6MKEJ0Z96QXBRPAE`
- 固定 target：`751b75095fd2faf9f37136f35eaaacda368770f9`（`baseCommit=null`，无可核对的变化清单）
- 执行意图：`browserRequired = true`；计划 `requiresBrowser = true`
- 审核对象：`plan.md`、动态上下文 `selectedScenarioSnapshot`（含 2 个 approved 场景正文）、`execution.md`、本 Run 捕获的图片 / 浏览器快照 / 命令回执
- 本报告中的判断除明确标注外均为 Reviewer 独立观察与结论；前序工件的事实按原文转述并注明来源

## 0. 计划与场景正文核对

- `query_source_reads(scope="plan")` 返回 `planHash = fdcd7b8d2178822a8be8549575e4b1c57851c1973c236b621634c5b5eead98a0`，与 `plan.md` 头部 Harness 元数据中的 `planHash` 一致；`sourceReferences` 的读取回执 `status` 均为 `ok`/`partial`（仅 `list_target_files` 两条为 `returned-range`，其余为 `full-file`），与我按需核对的规划者覆盖声明一致。
- `docs/scenario-testing/scenarios/AUTH-LOGIN-001.md`、`AUTH-REGISTRATION-001.md` 在 `main-planning` 阶段为 `full-file` 覆盖且 `redacted:false`；我另以动态上下文 `selectedScenarioSnapshot` 中 Harness 冻结的正文逐条比对，两处内容一致（登录场景 4 项期望、注册场景 4 项期望）。
- `scenarioChanges = null`，本 Run 目录无 `scenario-changes.patch`；`scenario_review_summary` 声明"无新增、无修改、无废弃"，与当前事实（无 patch 文件、快照正文与仓库既有场景 ID/名一致）相符。3 个 draft 场景不在执行集，`execution_scenarios` 只列 2 个 approved 场景。
- 计划中"以退出前读取到的 `cynos_session` 重放并确认请求头确实携带该值"等要求属对场景期望 3 的实现化限定，未削减原期望。

## 1. 逐场景独立判断

### AUTH-LOGIN-001 登录状态恢复 — **passed**

期望逐项核对（依据均为本 Run 原始工具回执，非 Runner 叙述）：

1. **刷新后显示同一用户 → 符合。** `operation-14`（`browser_navigate`，刷新前为已登录欢迎页）后 `operation-15` 快照仍为 "你好，[REDACTED]。" 与邮箱 `luowang-01m3b9tq1d6mkej0z96qxbrpae-login@example.com`，`operation-16` 记录 `GET /api/auth/status => 200`；截图 `AUTH-LOGIN-001-02-after-refresh.png`（我实读，画面与刷新前 `AUTH-LOGIN-001-01-loggedin-welcome.png` 一致显示同一用户与邮箱）。
2. **退出后页面回到登录状态 → 符合。** `operation-19` 记录 `POST /api/auth/logout => 200`，`operation-20` 快照为登录表单并显示「已安全退出。」；截图 `AUTH-LOGIN-001-03-after-logout.png` 实读一致。
3. **退出后原 Session 访问受保护接口返回 401 → 符合，且非平凡 401。** 退出前 `operation-12` 以 `browser_cookie_get` 取到 `cynos_session`（`observed-browser`，引用 `credential-cd53aa714c3bc89d211fa258134dbe38`，属性 `httpOnly: true, sameSite: Strict, secure: false`）；退出后 `operation-22` 以 `restore-input` 同引用恢复该值，`operation-24` 记录 `GET /api/me => [401] Unauthorized`，`operation-25` 的请求详情显示 `cookie: [REDACTED]` 且 `observed-request-header` 引用同为 `credential-cd53aa714c3bc89d211fa258134dbe38`——即请求确实携带该 Cookie，排除"未带 Cookie 的平凡 401"；`page-2026-09-25T03-41-43-557Z.yml` 显示响应体为 `{"error":{"code":"UNAUTHORIZED","message":"请先登录","requestId":"req-58"}}`，与 `operation-25` 的 `x-request-id: req-58` 互证。
4. **删除后旧 Session 与原凭据均不可用 → 符合。** `operation-30` `POST /api/auth/login => 200`（重登录）；`operation-32` 取到删除前会话（`credential-76b41d3c14c7d4755562b8d6bb1cd2be`）；`operation-34` `DELETE /api/me => 200`，`operation-35` 快照为「测试账号及其会话已删除。」；删除后 `operation-37` 恢复该会话、`operation-39` 请求详情显示 `GET /api/me => [401]` 且请求头携带同一 Cookie 引用；`operation-44` `POST /api/auth/login => [401] Unauthorized`，`operation-45` 快照提示「邮箱或密码不正确」；截图 `AUTH-LOGIN-001-04-after-delete.png`、`AUTH-LOGIN-001-05-relogin-rejected.png` 实读一致。

- 场景"需要记录"项均已留痕：登录/刷新后用户资料（operation-10/15/31）、退出后 HTTP 状态（logout 200 + `/api/me` 401）、Cookie 的 `HttpOnly`/`SameSite=Strict`（operation-12）、删除后提示与旧 Session/原凭据结果（operation-35/39/44/45）。
- 与 open Issue 关系：#2（logout 未撤销 Session）落在期望 3、#1（删除账号未生效）落在期望 4。本 Run 未复现两者，为 Reviewer 依据原始回执得出的观察；`execution.md` 的"未复现"表述与我一致。
- 无适用期望被降级或豁免。

### AUTH-REGISTRATION-001 新用户注册 — **passed**

1. **页面显示欢迎信息 → 符合。** `operation-53` `POST /api/auth/register => [201] Created`，`operation-54` 快照为欢迎页并显示邮箱 `luowang-01m3b9tq1d6mkej0z96qxbrpae-reg@example.com`；截图 `AUTH-REGISTRATION-001-01-welcome.png` 实读一致。
2. **`GET /api/auth/status` 返回已登录用户 → 符合。** `operation-58` 记录 `GET /api/auth/status => [200]`，`operation-59`（`part="response-body"`）返回 `{"authenticated":true,"user":{"id":"619f1b9c-...","email":"luowang-01m3b9tq1d6mkej0z96qxbrpae-reg@example.com","displayName":"[REDACTED]","createdAt":"2026-09-25T03:42:11.983Z"}}`；刷新后快照 `operation-61` 与截图 `AUTH-REGISTRATION-001-02-after-refresh-welcome.png` 一致。
3. **数据库不保存明文密码 → 在实际可观察范围内符合，附边界。** `operation-60` 记录受控只读聚合 `accounts: 1, argon2id: 1, other: 0`（`source: controlled-test-account-storage`，`runId` 为本 Run）。该聚合直接检查口令列的存储格式计数，命中计划预先约定的判定条件（`accounts ≥ 1`、`other = 0`、`argon2id = accounts`）。计数与时序自洽：该时点（约 03:42:20）登录场景账户已于 `operation-34` 删除，仅剩注册场景账户，`accounts=1` 与之相符。边界（与计划一致、如实保留）：该聚合只覆盖本 Run 标记账户的口令格式，不覆盖其他行、其他位置或生产库，因此不构成"整个数据库无任何明文"的绝对结论；原期望在注册账户这一验证对象上得到支持。
4. **删除后原邮箱密码不能登录 → 符合。** `operation-64` `DELETE /api/me => 200`，`operation-65` 快照提示「测试账号及其会话已删除。」；`operation-69` `POST /api/auth/login => [401] Unauthorized`，`operation-70` 快照提示「邮箱或密码不正确」；截图 `AUTH-REGISTRATION-001-03-after-delete.png`、`AUTH-REGISTRATION-001-04-relogin-rejected.png` 实读一致。

- 场景"需要记录"项均已留痕（注册结果 201、页面昵称、会话恢复、删除提示与重登录失败、只读聚合结果）。
- 与 open Issue 关系：本场景不直接对应 #1/#2；其期望 4 与登录场景期望 4 同向，均未复现问题。

## 2. 执行是否到位

- 场景进度记录：`operation-2` `start_scenario AUTH-LOGIN-001`，`operation-48` `start_scenario AUTH-REGISTRATION-001`，`operation-72` `finish_scenario`（`completed: ["AUTH-LOGIN-001","AUTH-REGISTRATION-001"]`），与计划 `execution_scenarios` 的数量与顺序一致。两者均按场景正文步骤执行：登录场景覆盖登录/刷新/退出/受保护接口/删除+原凭据复测，注册场景覆盖切换注册表单/填写提交/会话核对/删除+原凭据复测。
- `browserRequired: true` 与真实执行相符：本 Run 存在实际 Playwright MCP 操作回执（`browser_navigate`、`browser_click`、`browser_fill_form`、`browser_snapshot`、`browser_network_requests`、`browser_cookie_get/set`、`browser_take_screenshot`），非仅快照存在。
- 期望 3 依赖的受控只读聚合在本 Run 提供了观察（operation-60），未出现计划担心的"能力不可用"分支；该观察来源为 Harness 记录的受控聚合数据点，非浏览器请求回执，故按受限口径采纳（见第 3 节）。
- 未发现改变测试对象、跳过关键步骤或降低断言的行为；操作顺序与场景语义一致。

## 3. 记录与报告质量（不影响产品结论）

1. **执行记录复述了会话凭据前缀。** `execution.md` 在描述步骤 2 与步骤 6 时写出了退出前/删除前 `cynos_session` 的局部值前缀。它是会话令牌而非口令，且已部分脱敏，不构成口令泄漏；但按"交接只保留脱敏标识"的口径，更稳妥的做法是只写凭据引用 ID。本审核不复述其内容，也不据此改变任何场景结论。
2. **progress 事件 ID 标注异常。** `operation-47` 为 `finish_scenario` 但 `scenarioId` 标为 `AUTH-REGISTRATION-001`（其 `completed` 却只含 `AUTH-LOGIN-001`），与紧随其后的 `operation-48` `start_scenario AUTH-REGISTRATION-001` 时间戳相同。判断为记录字段错位，不改变已完成场景集合（`operation-72` 汇总完整）。
3. **`execution.md` 引用序号轻微不精确。** 描述期望 3/4 时把 401 记到 `operation-23`/`operation-38`（`browser_navigate`），实际网络状态与请求头证据在 `operation-24/25`、`operation-39`。仅引用粒度问题，原始证据支持其结论。
4. **受控只读聚合的属性限制。** `operation-60` 记录的是聚合计数，未见独立工具回执（如带 Token 的 HTTP 调用收据）；其来源字段与 Run 内时序、状态自洽（见 1-REGISTRATION 第 3 点），故采纳为该 Run 范围内的受控观察，但不据此声称它由某次可独立追溯的 Runner 请求产生，也不外推到生产库。

## 4. 覆盖缺口与未确认事项

1. **无 base**（`baseCommit=null`）：无法核对 base↔target 变化，结论仅限固定 target 本次运行观察，不外推到其他提交。
2. **历史有限**：`query_run_history` 仅 1 条旧 Run（`7062f9a`，含 blocked 的持久层核验项），与本 Run target 不同；本审核不沿用其结论。
3. **draft 场景未执行**（AUTH-LOGIN-002、AUTH-REGISTRATION-002、AUTH-ORIGIN-001）：不在本批执行集，本报告不对其作通过/失败判断。
4. **注册期望 3 的覆盖面**：只覆盖本 Run 标记账户的口令格式计数，不覆盖其他数据位置/生产库；该期望的通过以此受限观察为据，已在第 1 节说明。
5. **run-scoped 查删/聚合接口契约**（默认关闭、鉴权拒绝、范围精确、级联、幂等、其他 Run 保留等）：本批未由 Agent 独立执行，属本批范围外，不冒充已覆盖。
6. **本流程全为模型角色执行**：Runner 截图检查与 Reviewer 图片核对均非人工复核；截图审查基于工具标签与实际画面内容，我逐张实读 9 张截图并据此描述观察到控件与文案。

## 5. 结论

- AUTH-LOGIN-001：**passed**（4 项适用期望均有本 Run 原始工具证据支持，期望 3 已排除"未带 Cookie 的平凡 401"）。
- AUTH-REGISTRATION-001：**passed**（4 项适用期望均有支持；期望 3 以受控只读格式聚合为据，覆盖边界如实标注）。
- 未发现新的产品缺陷：open Issue #1、#2 对应的业务结果在本 Run target 上未复现，此结论仅限本次运行与固定 target。
- 发现的问题均为记录/引用层面（第 3 节），不影响任一场景的判定。
- 测试数据的最终清理由 Harness 在最终 Main 后统一核验；本次审核不预称其已完成。场景内 `DELETE /api/me` 是场景业务操作，不作为清理完成依据。
