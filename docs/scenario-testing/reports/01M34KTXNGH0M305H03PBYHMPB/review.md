# 审核报告：AUTH-LOGIN-001（登录状态恢复）— Closure 7 双缺陷验收

- Run：`01M34KTXNGH0M305H03PBYHMPB`；`targetCommit = e09b0f377d1414fa3da2c65bcbbc2406421dec4d`；`scenarioChanges = null`（无 patch）；`browserRequired = true`。
- 审核对象：计划 `plan.md`、Runner `execution.md`、本 Run 冻结的选定场景正文 `AUTH-LOGIN-001`（`redacted = false`，已完整读取），以及本 Run 的原始 command/浏览器/截图证据。
- 审核主体：本次审核由模型 Agent 独立完成，通过 `list_evidence_files` + `read_command_evidence` / `read_browser_evidence` / `read_evidence_image` 只读核对；未执行任何补测、未读取账号、未访问其他路径。本流程不声称人工复核。
- 时间口径：下文时间均来自 Harness 捕获记录（`Z`）。这些时刻属于同一捕获时钟，仅用于表达先后与间隔；不据此声称目标服务器时钟已校准。

## 1. 计划与场景质量评估

- 场景选择：计划仅执行 `## execution_scenarios` 中的 `AUTH-LOGIN-001`（approved）。该场景正文的四项期望正好覆盖本请求的两个缺陷后果——期望 C（退出后旧 Session 访问受保护接口应 401）对应「退出不撤销服务端 Session」，期望 D（删除后旧 Session 与原凭据均不可用）对应「删除返回成功但不删除账号或 Session」。选择恰当，无重要遗漏、无错误合并。
- 维护声明：`scenarioChanges = null`，计划声明「不新增、不修改、不 rename、不 deprecated 长期场景，不产出 patch」。与冻结上下文一致（唯一场景正文 `contentSha256 = 6f60babb…`，无 patch），未出现「已维护」而无变更的叙述。此项成立。
- 计划已把四项期望全部标为适用（均为通过必要条件），未把 C/D 降级为「实现细节」或「不可控」，检查设计（恢复真实 Cookie + 读 request-headers/响应）足以区分「UI 表现」与「服务端状态」，写法清楚可执行。
- 计划第 2 节主动记录的「仓库快照源码文本显示 logout 会删 session、deleteAccount 会删 users，与『已注入两缺陷』的声明不一致，且 base→target 无源码差异」这一环境/构建不确定项被保留且未被用于预判结果——符合「不得以代码阅读预判、结果只由运行时观察判定」的要求。

## 2. 独立证据核对（Reviewer 观察）

以下观察均由我直接读取原始记录得出，归为本 Reviewer 的观察；与 `execution.md` 的对照见第 5 节。

### 2.1 登录与刷新（期望 A）

- `operation-2`：`start_scenario(AUTH-LOGIN-001)`，13:11:45.371；此前仅有 `operation-1` 的 `begin_scenario_execution`（13:11:44.898）。第一项浏览器操作 `operation-3`（`browser_navigate`）在其之后，顺序符合计划约束。
- `operation-4/5/6/7`：真实 UI 填表并点击登录；`operation-7` 快照显示登录态视图「你好，luowang-01M34KTXNGH0M305H03PBYHMPB-preset。」及「退出登录」「删除测试账号」按钮。
- `operation-8/9`：`POST /api/auth/login => 200`，响应体 `{"authenticated":true,"user":{"id":"2b65b3d8-7c21-43e5-b77f-ba9ea95aeb8b","displayName":"luowang-01M34KTXNGH0M305H03PBYHMPB-preset","createdAt":"2026-09-22T13:10:43.641Z", …}}`。
- `operation-10`：登录后读取 `cynos_session`（`observed-browser`，引用 `credential-6731e16c304074f8a7a5184bc36b9f48`，属性 `httpOnly: true, sameSite: Strict, secure: false, domain: closure7-dual-target, path: /`）。
- `operation-11/12`：导航（等价于刷新）后快照仍为同一登录态用户（快照 `page-2026-09-22T13-11-56-884Z.yml`，sha256 `d0ab1188…`）。
- `operation-15/16`：刷新后 `GET /api/auth/status` 的 request-headers 携带 `cookie`（`observed-request-header`，引用 `credential-6731e…`，与登录后读取值同一引用 → 同一 Run 内精确同值），响应体 user 的 `id`/`displayName`/`createdAt` 与登录响应逐字一致。
- 观察结论：刷新后仍是同一用户、继续使用原 Session；`email` 在工具输出中被脱敏为 `[REDACTED]`，故逐字 email 比较不可得，其余三字段一致 + 页面欢迎态共同支持。**与我核对的 `execution.md` 判定一致：期望 A 满足。**

### 2.2 退出（期望 B）

- `operation-17/18`：点击「退出登录」；网络记录 `POST /api/auth/logout => 200`。
- `operation-19`：快照回到登录表单并显示「已安全退出。」（快照 `page-2026-09-22T13-12-01-502Z.yml`，sha256 `cd1baf6b…`）。
- `operation-20`：该退出请求的 request-headers 携带原 `cynos_session`（引用 `credential-6731e…`）。
- 观察结论：退出后页面回到登录态。**期望 B 满足。**

### 2.3 退出后重放旧 Session（期望 C）→ 违反

- `operation-23`：`cookie_set(cynos_session, …)`，`restore-input` 引用 `credential-6731e…`（即退出前读取的同一真实值，非猜测、非占位符）。
- `operation-24`：`cookie_get` 返回 `observed-browser` 引用 `credential-6731e…`，确认恢复成功且与退出前同值。
- `operation-25/27`：导航 `GET /api/me`，页面呈现用户 JSON。
- `operation-28`：network 记录 `1. [GET] /api/me => [200] OK`。
- `operation-29`：该响应 headers 为 200（`content-type: application/json; charset=utf-8`，`date: Tue, 22 Sep 2026 13:12:06 GMT`，与该次导航时刻一致）。
- `operation-30`：该请求 request-headers 携带 `cookie`，`observed-request-header` 引用 `credential-6731e…`——与退出前读取值同引用，证明是**同一真实旧凭据被重放**。
- `operation-31`：响应体 `{"user":{"id":"2b65b3d8-7c21-43e5-b77f-ba9ea95aeb8b", …}}`（完整用户资料）。
- 截图 `logout-session-still-valid-api-me.png`（sha256 `ea19df27…`）：页面为 `/api/me` 返回的用户 JSON。
- 观察结论：退出接口返回 200、UI 亦清 Cookie，但退出前 Session 被重放后仍能取到受保护资料（200 而非 401）。**期望 C 有充分运行时证据被违反 → 缺陷 1 成立。** 该 200 来自带有该 Cookie 的实时导航请求（记录中有对应 request-headers/response-headers），不是缓存或旧响应。

### 2.4 删除测试账号（期望 D）→ 违反（两个观测点均违反）

检查点 a：删除前 Session 是否仍可用

- `operation-40`：重新登录后读取**新** Session（`observed-browser` 引用 `credential-e54b38ebd50804adbd20870a8a093edf`，与退出前值不同）。
- `operation-42/43`：点击「删除测试账号」；网络记录 `DELETE /api/me => 200`。
- `operation-44`：快照显示登录表单与提示「测试账号及其会话已删除。」（快照 `page-2026-09-22T13-12-23-166Z.yml`）。
- `operation-45`：`DELETE /api/me` 响应体 `{"deleted":true,"authenticated":false,"user":null}`。
- `operation-46`：`cookie_list`（输出略，Runner 述为 `No cookies found`）。
- `operation-47/48`：`cookie_set` 恢复删除前新值（`restore-input` 引用 `credential-e54b38eb…`），随后 `cookie_get`（`observed-browser` 同引用）确认恢复。
- `operation-49/50/51`：导航 `GET /api/me` → `1. [GET] /api/me => [200] OK`，页面呈现用户 JSON。
- `operation-52/53`：响应 200（`date: Tue, 22 Sep 2026 13:12:27 GMT`）；request-headers 携带 `cookie`（`observed-request-header` 引用 `credential-e54b38eb…`）。
- `operation-54`：响应体回到完整用户资料。
- 截图 `delete-session-still-valid-api-me.png`（sha256 `ea19df27…`）。
- 观察结论：删除返回成功且 UI 提示已删除后，删除前的 Session 仍有效。**违反期望 D 的「旧 Session 不可用」。**

检查点 b：原凭据是否仍可用

- `operation-56/57`：清理 Cookie（`cookie_set(expires=0)`，`restore-input` 引用 `null`）。
- `operation-58/59`：导航到首页并确认显示登录表单。
- `operation-60`：再次填表，`邮箱`/`密码` 的 `valueReference` 分别为 `credential-82f70e5016dc64e1c84818d0896b89c4` / `credential-af1f7f0c943736ecee3fe69708f66bb4`——与初始登录（`operation-5`）及删除前重登（`operation-38`）所用引用相同，确证为**原凭据**。
- `operation-61/62/63`：点击登录 → `POST /api/auth/login => 200`，页面重新显示登录态用户。
- `operation-64`：登录响应体 `{"authenticated":true,"user":{"id":"2b65b3d8-7c21-43e5-b77f-ba9ea95aeb8b", …}}`（同一用户 id）。
- 截图 `relogin-after-delete-succeeded.png`（sha256 `1c4140b3…`）：登录态用户中心。
- 观察结论：删除后用原凭据仍能登录，账号行未删除。**违反期望 D 的「原凭据不可用」。**

**期望 D 有充分运行时证据被违反 → 缺陷 2 成立（账号与会话均未被清理）。**

### 2.5 场景要求记录的其它项

- Cookie 标志：`httpOnly: true`、`sameSite: Strict`、`secure: false`（`operation-10/24/40/48`），已记录。
- 删除后的提示：「测试账号及其会话已删除。」（`operation-44` 快照）；旧 Session `GET /api/me => 200`；原凭据 `POST /api/auth/login => 200`。均已记录。
- 控制台：`operation-66`（输出略）。该条为辅助项，不改变结论；本次未据其做通过判定。

## 3. 逐场景结果

| 场景 | 结果 | 依据 |
| --- | --- | --- |
| AUTH-LOGIN-001（登录状态恢复） | **failed** | 期望 A、B 有充分观察支持；期望 C、D 有充分运行时证据被违反（见第 2.3、2.4 节）。 |

- 期望 A：passed（`operation-10/11/12/15/16`）。限制：email 逐字比较受工具脱敏限制，已如实标注，不影响「同一用户、继续原 Session」的确认。
- 期望 B：passed（`operation-17/18/19`）。
- 期望 C：failed（`operation-23/24/25/27/28/29/30/31` + 截图 `logout-session-still-valid-api-me.png`）。
- 期望 D：failed（a：`operation-43/45/47/48/49/50/52/53/54` + 截图 `delete-session-still-valid-api-me.png`；b：`operation-56…64` + 截图 `relogin-after-delete-succeeded.png`）。

## 4. 已确认产品缺陷（预期 / 实际差异与复现条件）

两缺陷由不同接口、不同观察点独立确认，非同一现象的两面。

**缺陷 1 —— 退出登录不撤销服务端 Session**
- 预期（场景期望 C / 规格行为 6）：`POST /api/auth/logout` 撤销当前 Session；退出后旧 Session 访问受保护接口应返回 401。
- 实际：`POST /api/auth/logout => 200`（`operation-18`）；UI 清 Cookie 并显示「已安全退出。」（`operation-19`）；但恢复退出前同一 `cynos_session` 值后 `GET /api/me => 200` 并返回完整用户资料（`operation-28/29/30/31`，request-headers 确认携带该 Cookie）。
- 最小复现：登录 → 读取 `cynos_session` → UI 退出 → 恢复该值 → `GET /api/me` → 期望 401，实际 200。

**缺陷 2 —— 删除账号返回成功但未删除账号与会话**
- 预期（场景期望 D / 规格行为 9）：删除时用户行与全部关联 Session 原子删除；旧 Cookie 与原凭据随后均不可用。
- 实际：`DELETE /api/me => 200`，响应体 `{"deleted":true,…}`，UI 提示「测试账号及其会话已删除。」；但（a）删除前的 Session 重放 `GET /api/me => 200`（`operation-50/52/53/54`）；（b）清理 Cookie 后用原凭据 `POST /api/auth/login => 200`（`operation-62/63/64`）。
- 最小复现：登录 → 读取新 `cynos_session` → UI 删除账号 → 恢复该值 `GET /api/me`（期望 401，实际 200）→ 清 Cookie 用原凭据登录（期望失败，实际 200）。

上述为 Reviewer 独立确认；是否创建 Issue 及 key 由最终 Main 按流程决定，本报告不代为创建。

## 5. 与 execution.md 的一致性核对

- 结果、期望分级（A/B pass，C/D fail）与场景 failed 的结论与我从原始证据得出的判断一致；Runner 未把任何适用期望降级为可选，也未把未确认项写成通过。
- Runner 引用的关键证据编号（`operation-7/9/10/15/16/17/18/19/20/22/23/24/28/29/30/31/40/43/45/47/48/50/52/53/54/62/63/64/66` 及快照文件）与原始记录逐一对应，未见凭空引用或张冠李戴。
- 步骤描述与原始记录相符：第一项执行工具确为 `start_scenario`（`operation-2`），全部浏览器操作在其后，`finish_scenario` 在最后（`operation-67`）；未见场景外执行或跨场景补写。
- `execution.md` 第 6 节「无改变前置/操作/断言含义的偏差」基本成立。唯一需注意的操作细节：`operation-24`、`operation-48` 是在 `cookie_set` 之后再次 `cookie_get` 以核对恢复成功。计划约束 3 要求「同一状态不得重复轮询/重复读取」。Runner 已在第 6 节披露该读取属恢复核对而非重复读取新业务状态，我核对后认同其不改变断言含义（核对的是刚写入的受控值，未产生新的业务状态读数），故不视为影响验证目标的偏差。
- 我个人另注意到一处 Runner 未点明、但不影响结论的观察：`logout-session-still-valid-api-me.png` 与 `delete-session-still-valid-api-me.png` 的 sha256 完全相同（均为 `ea19df27…`），即两次「Session 仍有效」检查的截图像素一致；同理 `after-refresh-logged-in.png` 与 `relogin-after-delete-succeeded.png` 相同（`1c4140b3…`，Runner 已提及其一对）。截图本身因此不能区分两个时刻。区分这两个时刻的是各自独立的网络记录与时序收据（`operation-32` 于 13:12:11.413、`operation-55` 于 13:12:30.425；`operation-28/29` 与 `operation-50/52` 为相互独立的两组 request/response），故该截图重复不影响 C、D 各自已被充分证据确认。此为我的观察，不归为 Runner 已提出。
- `execution.md` 第 7 节如实说明因缺陷 2 账号实际未被删除、需由 Harness 收尾，未提交「清理完成」声明；符合要求。

## 6. 覆盖缺口、限制与不确定性

- **email 脱敏**：期望 A 的 email 逐字比较因工具输出脱敏不可得，已以 `id`/`displayName`/`createdAt` 与页面欢迎态共同支撑并标注。判定不受影响。
- **环境来源不确定（计划第 2 节保留项）**：固定 target 仓库快照源码文本（logout 会删 `auth_sessions`、deleteAccount 会删 `users`）与请求声明的「已注入两缺陷」不一致，且 base→target 无源码差异；本 Run 运行时观察到的行为与「已注入缺陷」一致。该不一致指向运行目标与仓库快照可能非同一构建，属环境/构建归属问题。本 Run 无法从审核侧消解，结果只归因于运行时观察，不归因到具体源码差异。此为记录性限制，不构成对本场景 failed 判定的削弱。
- **未授权/未覆盖范围**（本轮不执行，也不因此降级本场景期望）：`AUTH-LOGIN-002`、`AUTH-REGISTRATION-001/002` 及重复邮箱 409、弱密码/无效邮箱 400、Origin 403、限流 429、Session 有效期等边界。本报告结论不扩展到这些范围。
- **无阻断项**：本 Run `blockingReasons = []`；未发现必要原文、截图、视觉能力或证据缺失导致无法判断的情形；四项期望均可判定（A/B 满足，C/D 违反）。无未验证的适用期望遗留。
- **凭证安全**：原文 Command 证据未出现口令明文，`fill_form` 等输入以 `credential-*` 引用标识并标注 `[REDACTED]`；我未在报告中复述任何口令或 Cookie 值。需说明：本审核仅就可见证据核对，未执行凭据扫描，故不就「凭据零泄漏」作任何绝对声明。

## 7. 审核结论

- `AUTH-LOGIN-001` 在固定 target `e09b0f377d…` 上运行时结果为 **failed**：期望 A、B 满足，期望 C、D 有充分运行时证据被违反。
- 计划选型与检查设计恰当，维护声明（无变更、无 patch）与上下文一致；Runner 报告与原始证据相符，可作为最终 Main 的整理依据。
- 两个独立产品缺陷（退出不撤销服务端 Session；删除返回成功但不删除账号与会话）经 Reviewer 独立核对确认，预期/实际差异与最小复现见第 4 节。是否创建两个独立 Issue 由最终 Main 按其流程执行。
- 无阻塞、无未闭合的关键验证；测试数据（因缺陷 2 仍存在的账号）由 Harness 在最终 Main 后收尾。
