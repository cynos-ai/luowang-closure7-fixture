# 审核报告 · AUTH-LOGIN-001 登录状态恢复

- Run：`01M36H8NWNPPFYN8FY0MJ5CFPZ`
- 固定 target：`ef468e7c94d023d36da1e88254af90cdcc934b21`（`baseCommit=null`，`includedCommits=[]`）
- 场景模式：autonomous；`scenarioChanges=null` → 本批**无场景维护动作**，无 `scenario-changes.patch`
- `browserRequired=true`；`blockingReasons=[]`
- 执行场景集合（计划唯一 `## execution_scenarios`）：`AUTH-LOGIN-001`
- 审核依据：`selectedScenarioSnapshot`（Harness 冻结正文）、`plan.md`、`query_source_reads` 计划引用、本 Run 原始证据（截图 / operation / command / console / page 快照）、`execution.md`

## 1. 计划与来源核对

- `plan.md` 开头 Harness 元数据 `planHash=6996134bd7a1257c6da82b02fa548aa18c84163fb40332f91d5b6c2645a9434a`；`query_source_reads(scope="plan")` 返回同一 `planHash`，引用校验成立。引用范围：`AUTH-LOGIN-001.md`、`spec.md`（full-file）、`src/server/security/auth.ts`、`src/server/app.ts`（full-file，`redacted=true`）、`0001-auth.ts`、`client.ts`、历史报告等；`list_target_files` 为 `returned-range`（97/97 路径项）。来源与范围成立，但**不证明源码理解正确**，本审核不以计划中的代码推断当作结论。
- 计划声明的执行场景与 `execution_scenarios` 清单一致（仅 `AUTH-LOGIN-001`）；`plan.md` 声明「复用 approved 场景、不新增/修改/rename/deprecated」与 `scenarioChanges=null` 相符，本批**无场景维护声明需要核实**。
- 冻结场景正文（非 redacted）四条期望与计划 §7 一致：刷新后同一用户；退出后回到登录态；退出后原 Session 访问受保护接口 401；删除后旧 Session 与原凭据均不可用。另有「需要记录」项（Cookie 属性）。

## 2. 独立证据核对（先于 execution.md）

我对原始记录（不依赖 Runner 叙述）核对结果如下。注意 operation 文件名与 Harness `sequence` 之间存在 +3 偏移（sequence 25/26/27 为 `command-*`，100/101 为 `finish_scenario`/`browser_close`），下列引用给出文件名与可见内容。

- **登录**：`operation-34`（seq37）网络列表显示 `POST /api/auth/login => [200]`；`operation-41`（seq41）请求详情 200；`operation-42`（seq42）响应体 `{"authenticated":true,"user":{"id":"44a81189-e188-43b5-9c0d-76a9bafe7051",...,"displayName":"luowang-01M36H8NWNPPFYN8FY0MJ5CFPZ-preset",...}}`。`operation-44`（seq47）登录后页面快照显示「你好，luowang-…preset。」与「退出登录」「删除测试账号」。
- **刷新保持**：`operation-43`（seq46）重新导航 `/`；`operation-44`（seq47）快照仍为已登录视图；`operation-45`（seq51）静态网络 `GET /api/me => [200]`（该请求为带 Cookie 的真实导航，`operation-49`/seq52 request-headers 显示 `cookie: [REDACTED]`，credential 引用 `credential-d61bab2cccf19c6d5f5504184d9949d5`，与登录 Cookie 同引用）；`operation-47`（seq53）响应体 user.id 与登录响应一致。
  - 附带观察：`01-login-success.png` 与 `02-refresh-still-logged-in.png` 的 `sha256` **完全相同**（`2de301…`），即两张截图字节一致，刷新后的截图不能作为「画面独立变化」的额外证明；E1 由快照文字与 status 响应共同支撑，不影响结论。
- **退出前 Cookie 固化**：`operation-44`（seq48）`browser_cookie_get("cynos_session")` 观察 `httpOnly: true, secure: false, sameSite: Strict, domain: cu10-initialization-retry1-target, path: /`（`observed-browser` 引用 `credential-d61bab…`）。
- **退出**：`operation-54`（seq57）网络列表 `POST /api/auth/logout => [200]`；`operation-56`（seq59）请求详情 200 且 request-headers 携带 Cookie（引用 `credential-d61bab…`）；`operation-55`（seq58）快照回到登录表单并出现提示「已安全退出。」；截图 `03-after-logout-login-page.png` 与之一致（我实际读图确认）。
- **退出后原 Session 重放（关键）**：`operation-58`（seq61）`browser_cookie_list` **输出被省略**（无法独立核实「No cookies found」）；`operation-59`（seq62）`browser_cookie_set` 以 `restore-input` 写回 `credential-d61bab…`（退出前原值）；`operation-63`/`operation-66`（seq64/seq66）显示 `GET /api/me => [401]`，响应体 `{"error":{"code":"UNAUTHORIZED","message":"请先登录","requestId":"req-1n"}}`；`operation-65`（seq65）request-headers 为 `observed-request-header`，其 `cynos_session` 引用同为 `credential-d61bab…`，即**该 401 请求确实携带了与登录时同一值的原 Cookie**，可与「丢 Cookie 后的匿名 401」区分。
- **重新登录与删除前对照**：`operation-67`–`operation-70`（seq73–seq76）导航、填原凭据、登录成功；`operation-71`（seq78）快照已登录；`operation-72`（seq72）`cookie_get` 得到新值（引用 `credential-5ee32d0e23e35d969acbe42b6ef0f5e5`，与退出前不同）；`operation-74`–`operation-76`（seq80–seq82）带该 Cookie 的 `GET /api/me => [200]`，request-headers 引用 `credential-5ee32…`，响应体 user.id 仍为 `44a81189…`。
- **删除**：`operation-76`（seq81）点击「删除测试账号」；`operation-77`（seq80）网络列表 `DELETE /api/me => [200]`；`operation-84`（seq84）响应体 `{"deleted":true,"authenticated":false,"user":null}`；`operation-78`（seq83）快照回到登录表单并提示「测试账号及其会话已删除。」；截图 `04-after-delete-login-page.png` 一致。
- **删除后原 Session 重放与原凭据（关键）**：`operation-82`（seq85）`cookie_list` 输出被省略；`operation-83`（seq86）`cookie_set` 以 `restore-input` 写回删除前原值 `credential-5ee32…`；`operation-85`/`operation-90`（seq88/seq90）`GET /api/me => [401]`，体 `{"error":{"code":"UNAUTHORIZED",...,"requestId":"req-24"}}`；`operation-89`（seq89）request-headers 为 `observed-request-header`，引用同为 `credential-5ee32…`，证明携带原 Session。`operation-93`–`operation-98`（seq95–seq99）导航、以原凭据提交：`POST /api/auth/login => [401]`，体 `{"error":{"code":"INVALID_CREDENTIALS","message":"邮箱或密码不正确","requestId":"req-2b"}}`，页面 alert「邮箱或密码不正确」（`operation-93`/seq96 快照；截图 `05-original-credentials-rejected.png` 一致，可见邮箱回填、口令以掩码显示）。
- **Cookie 属性**：`httpOnly: true`、`sameSite: Strict`（`secure: false` 与本环境 http 相符），与场景「需要记录」项一致。
- **凭据脱敏**：所读取的 operation/command/console/图片中，口令与完整 Cookie 均以 `[REDACTED]` 呈现；可见的明文仅为预置账号邮箱（属账号标识，非口令）。我**未**进行任何 Secret 扫描，故不声称「无任何口令文本泄漏」，仅说明上述受读证据的呈现情况。

## 3. 场景进度核对

- `sequence 29` `begin_scenario_execution`（declared）、`sequence 30` `start_scenario("AUTH-LOGIN-001")`、`sequence 100` `finish_scenario`（`completed:["AUTH-LOGIN-001"]`）。正式浏览器操作（登录 → 刷新 → 退出 → 重登 → 删除）均位于 start 与 finish 之间，无越序、无跨场景操作。
- 小瑕疵（不影响产品结论）：`sequence 31`（file `operation-28`，start_scenario 后首个导航）的 `scope` 标注为 `auxiliary`、`scenarioId=null`，随后各步为 `scenario` 归属；这是执行记录的归属标注不一致，未发现事后补报或跨场景操作。

## 4. 逐场景结论

### AUTH-LOGIN-001 —— passed

| # | 场景原文期望（适用） | 实际观察（Reviewer 独立核对） | 判定 |
|---|---|---|---|
| E1 | 刷新后显示同一用户 | 重新导航 `/` 后仍为已登录视图；`GET /api/auth/status` 200 返回 user id/email/displayName 与登录响应一致（`operation-44/43/45/47`、`page-2026-09-23T07-07-50-967Z.yml`） | passed |
| E2 | 退出后页面回到登录状态 | 退出后快照回到登录表单并提示「已安全退出。」；`POST /api/auth/logout` 200（`operation-54/55/56`、截图 03） | passed |
| E3 | 退出后的 Session 访问受保护接口返回 401 | 退出后以 `restore-input` 写回**退出前原 Cookie 值**，`GET /api/me => 401 UNAUTHORIZED`；request-headers 观察到携带同一引用值（`operation-58/59/63/65/66`） | passed |
| E4 | 删除测试账号后旧 Session 和原凭据均不可用 | 删除后以 `restore-input` 写回**删除前原 Cookie 值**，`GET /api/me => 401`；原凭据 `POST /api/auth/login => 401 INVALID_CREDENTIALS`（`operation-82/83/85/89/90/92/93/96/97/98`、截图 05） | passed |

- 「需要记录」的 Cookie 属性：`httpOnly: true`、`sameSite: Strict`（已记录）。
- E3/E4 的「原 Session」已由 request-headers 的 `observed-request-header` 引用与退出前/删除前 Cookie 同值共同支撑，**不是**以「丢 Cookie 后的匿名 401」替代，满足计划 §4 的可独立复核要求。计划 §4 登记的冲突 A/B 由运行证据裁决为**当前 target 的撤销行为符合 spec 6/9 与场景期望**（历史 Issue #1/#2 的线索在本 target 未被复现）。

## 5. 已确认产品 Bug

- **无**。四点适用期望均有充分实际观察支持，未发现产品行为与期望矛盾。
- 历史 Issue #1（删除不撤销）与 #2（退出不撤销）在本 Run 的 target `ef468e7c…` 上**未被复现**；本审核不裁决历史 Issue 状态。

## 6. 问题与影响（不改变产品结论）

1. **两张截图字节相同**：`01-login-success.png` 与 `02-refresh-still-logged-in.png` 的 `sha256` 一致（`2de301…`），刷新截图与登录截图相同，不能作为刷新后画面变化的独立图像证据；E1 仍由页面快照与 `status` 响应充分支持。属辅助证据冗余，不阻塞。
2. **`cookie_list` 结论不可独立核实**：Runner 称退出后/删除后 `cookie_list` 为「No cookies found」（`operation-58`/`operation-82`），但两次记录的 `output` 均被省略，我无法从证据复核该断言。该断言仅用于说明「浏览器已清 Cookie」，不影响 E3/E4（重放显式恢复了原值并有请求头证据）。属辅助记录缺口，不阻塞。
3. **引用编号存在轻微错位**：`execution.md` 部分 operation 编号与实际内容略有偏差（如步骤 9 以 `operation-91/92` 指代登录 401，实际 401 网络记录在 `operation-92`，`operation-91` 为点击）。所引内容均可在证据中找到，属引用精度问题，不影响结论。

## 7. 覆盖缺口与无法确认项

- **无 base commit / 无变更清单**：只能对当前 target 整体验收，结论不可归因到具体提交，也不代表线上环境。
- **未覆盖（超出本场景授权，仅记录）**：7 天 Session 有效期、`/health` 数据库降级分支、认证写请求 Origin 403、注册/登录限流 429、按 Run 查删端点鉴权与效果（侦察中 `GET /api/luowang/test-data/:runId` 无 Token 访问返回 401，未使用任何 Token）。
- **产品「删除」的数据库层完整性**未直接观察（无 DB 只读入口）；E4 依据「原 Cookie 401 + 原凭据 `INVALID_CREDENTIALS` + 页面提示删除成功」判定，符合场景期望表述。
- **测试数据收尾**：预置账号已由场景自身经 `DELETE /api/me` 删除（属被测业务行为）；Harness 统一收尾核验与域清理由 Harness 在最终 Main 后处理，不属本审核范围。

## 8. 结论

- **AUTH-LOGIN-001：passed（4/4 适用期望均有独立可复核证据）**。
- 本批无场景新增/修改/废弃（`scenarioChanges=null`），无场景维护结果需保留或修正；审核未发现需要 Main 补造规则或补做无关测试的缺口。
- 未发现已确认产品缺陷；上述第 6 节三项均为辅助证据/引用精度问题，已分别说明其不阻塞的理由。
