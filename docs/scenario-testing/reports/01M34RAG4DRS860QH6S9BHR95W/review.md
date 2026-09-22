# 审核报告：AUTH-LOGIN-001 登录状态恢复（Run `01M34RAG4DRS860QH6S9BHR95W`）

- 固定版本：`targetCommit = f287add3d4054491f2ed5714cbb044a38a133f50`（plan 记为 `baseCommit e09b0f3… → target f287add…`）。
- 计划 `## execution_scenarios`：仅 `AUTH-LOGIN-001`（approved）。`scenarioChanges = null`，**无 `scenario-changes.patch`**，本 Run 未产出场景 patch。
- `browserRequired = true`（Main 的执行意图声明）。本轮实际存在 Playwright MCP 浏览器操作记录（`browser_navigate` / `browser_click` / `browser_fill_form` / `browser_cookie_get|set|list` / `browser_network_request(s)` / `browser_take_screenshot` / `browser_console_messages` / `browser_close`），因此声明与执行一致；`browserRequired` 本身未被当作能力或结果证明使用。
- 审核方式：先读 plan 与冻结场景正文（`selectedScenarioSnapshot`，`redacted=false`，`sourceSha256` 与内容哈希一致），再通过 `list_evidence_files` 逐一读取 65 份 `operation-*.json`、11 份 `page-*.yml`、3 份 console 日志与 7 张截图，最后读 `execution.md` 对照。下述判断凡属我新得出的，均标注为 Reviewer 观察；引用 Runner 时只转述其工件原意。

## 1. 逐场景结果

### AUTH-LOGIN-001 登录状态恢复 —— passed

四项适用的明列期望均有本 Run 运行时观察支撑，且关键关联（「401 由携带旧 Session Cookie 的真实请求产生」）已闭合。

**期望 A：刷新后显示同一用户 —— passed（Reviewer 观察）**
- 登录：`operation-8` 点击后页面进入已登录态（`operation-9` 快照含 `YOU ARE IN`、`你好，[REDACTED]。`、`当前登录邮箱是 [REDACTED]`、含「退出登录」「删除测试账号」按钮）；`POST /api/auth/login => 200`（`operation-10`、`operation-11`，请求头 `origin`/`referer` 指向同一 host）。
- 刷新：`operation-13` 重新加载后，`operation-14` 快照仍为同一已登录用户（显示名与邮箱与登录后一致，`[REDACTED]`）；刷新触发的 `GET /api/auth/status => 200`（`operation-16`），响应体（`operation-17`）为 `authenticated: true`、`user.id = 172d2044-…`、`displayName` 与页面一致。
- 「沿用原 Session」：刷新前的会话 Cookie（`operation-12`，Run 内引用标识 `credential-1d5353…`）在刷新前已存在于浏览器，刷新页面仅发出 `GET /api/auth/status`，未出现新的 `POST /api/auth/login`（`operation-16`），说明刷新沿用原会话而非重新登录。
- 截图 `after-refresh-same-user.png` 经我实际读取，画面为已登录用户面板，与快照一致。
- 说明：Runner 在 3.2 写「与登录后会话用户 id 一致」，但登录响应体未能取回（见 §4），该「两处 id 比对」我无法独立复核；不过「刷新后为同一用户」由登录后/刷新后页面快照的同一显示名与邮箱、以及刷新后 status 返回具体用户共同支持，故期望本身成立。

**期望 B：退出后页面回到登录状态 —— passed（Reviewer 观察）**
- `operation-19` 点击「退出登录」触发 `POST /api/auth/logout => 200`（`operation-20`）；退出请求详情（`operation-22`）显示请求头携带 Cookie，其 Run 内引用标识与 `operation-12` 退出前读到的会话 Cookie 相同（`credential-1d5353…`）。
- `operation-21` 快照回到「登录 Cynos」并提示「已安全退出。」；截图 `after-logout-login-state.png` 我实际读取确认：绿色提示「已安全退出。」、邮箱/明文密码输入框均已回到占位符空态。两处一致。
- Runner 3.4 称 `operation-23` 返回「Cookie 'cynos_session' not found」。该条收据的 `output` 被省略、`credentialReferences` 为空数组，我只能确认「退出后读取该 Cookie 未再取得可引用值」，与「已清除」一致，但无法复核其字面提示；这属于原文不可读，不影响期望 B 判定。

**期望 C：退出后的 Session 访问受保护接口返回 401 —— passed（Reviewer 观察）**
- 恢复退出前真实 Cookie：`operation-25`（`restore-input` 引用 `credential-1d5353…`）；`operation-26` 复核该 Cookie 在浏览器中存在且属性不变（`credential-1d5353…`）。
- 真实受保护请求：`GET /api/me => 401 Unauthorized`（`operation-27` 导航、`operation-28` 状态）。
- **关键关联闭合**：`operation-29` 的请求详情显示该 `/api/me` 请求头确实携带 Cookie，其 `observed-request-header` 引用为 `credential-1d5353…` —— 与退出前读取、退出请求所携带的同一会话值一致。响应体（`operation-30`）`{"error":{"code":"UNAUTHORIZED","message":"请先登录","requestId":"req-n"}}`，与响应头 `x-request-id: req-n` 对应；`page-2026-09-22T14-30-24-559Z.yml` 亦为同一 JSON，console 日志 `[8ms] … 401 … /api/me` 一致。
- 因此 401 不是「未携带 Cookie 的平凡 401」。计划 §7 指出的既往 blocked Run 缺口（旧 Cookie 与实际请求头之间缺关联）在本轮已被证据闭合。

**期望 D：删除测试账号后旧 Session 与原凭据均不可用 —— passed（Reviewer 观察）**
- 重新登录（`operation-35` 填写、`operation-37` 点击、`operation-38` `POST /api/auth/login => 200`、`operation-39` 已登录快照），同时构成「删除前原凭据仍有效」的对照。
- 删除前读取真实 Cookie：`operation-40`，为新的会话值（Run 内引用 `credential-4056a9…`），属性 `httpOnly: true, sameSite: Strict`。
- 删除：`operation-41` 点击「删除测试账号」→ `DELETE /api/me => 200`（`operation-42`）；删除请求详情（`operation-44`）请求头携带 `credential-4056a9…`，与删除前读取值一致；删除后快照（`operation-43`）回到登录态并提示「测试账号及其会话已删除。」，截图 `after-delete-notice.png` 我实际读取确认同一提示与保留的邮箱填写值。
- 旧 Session：`operation-46` 恢复删除前 Cookie（`credential-4056a9…`）→ `GET /api/me => 401`（`operation-47`、`operation-48`）；`operation-49` 请求详情显示请求头确实携带该 Cookie（引用 `credential-4056a9…`），响应体（`operation-50`）`{"code":"UNAUTHORIZED"…}`，页快照 `page-2026-09-22T14-30-40-992Z.yml` 与 console 401 日志一致。关联闭合。
- 原凭据：清除 Cookie（`operation-51`，`operation-52` 复核无可引用 Cookie）→ 用原凭据登录：`operation-55` 填写的邮箱/口令 Run 内引用（`credential-993e…`、`credential-12909a…`）与首次登录 `operation-5` 完全相同；`POST /api/auth/login => 401`（`operation-58`）、响应体（`operation-62`）`{"error":{"code":"INVALID_CREDENTIALS","message":"邮箱或密码不正确","requestId":"req-14"}}`；快照（`operation-59`）显示 `alert: 邮箱或密码不正确` 且表单保留填写态，截图 `deleted-cred-login-rejected.png` 我实际读取确认。
- 两条「不可用」路径均成立，期望 D 通过。

**「需要记录」项核对**：登录/刷新后用户资料有页面快照；退出后 HTTP 状态（logout 200、`/api/me` 401）有记录；Cookie 为 `httpOnly: true`、`sameSite: Strict`（`secure: false`，与 HTTP 访问环境一致，场景未要求 `secure`，不构成缺陷）；删除后提示、旧 Session 与原凭据结果均有记录。唯「登录接口响应体中的用户资料」未取回（见 §4）。

## 2. 已确认的产品问题

无。本 Run 未观察到与 plan §2 所述既往历史缺陷（「退出不撤销 Session、删除不生效」）方向一致的运行时现象：退出后旧 Cookie 得 401、删除后旧 Cookie 与原凭据均 401。因此无「预期/实际差异」及复现条件可写。按 plan 约定，本轮不创建、不关联 Issue；上述历史缺陷方向与固定 target 源码文本的不一致属于既往记录性限制，本轮不据此作任何归因。

## 3. 场景选择与维护声明核对

- **选择**：仅 `AUTH-LOGIN-001`（approved），与请求授权和 `## execution_scenarios` 一致；draft 场景（含新合并的 `AUTH-ORIGIN-001`）与未授权的 `AUTH-REGISTRATION-001` 未进入执行清单，无越权执行证据（`begin_scenario_execution`→`start_scenario(AUTH-LOGIN-001)`→`finish_scenario(AUTH-LOGIN-001)` 各一次，`operation-1/2/64`）。
- **场景文本**：冻结正文的步骤与四项期望可观察、无歧义，覆盖登录保持、退出撤销、删除失效三条后果；未发现本批重要遗漏、重复或错误合并，也没有依据要求新增场景。
- **维护声明**：plan 称「维护动作：无」，且 `scenarioChanges = null`、无 patch 文件，两者一致；本 Run 没有出现「已维护/已新增」之类的无依据叙述，故无可被证伪的维护声明。plan 中 base→target 仅 `docs/**` 变更、产品契约不变的说法我无仓库读取权限，无法独立核实，仅作为 Main 的声明保留（见 §5）。
- **执行完整性**：步骤与 plan §5 一致（先 `start_scenario`、退出前/删除前读 Cookie、恢复后读取真实请求头与响应、清晰截图、`finish_scenario`、`browser_close`）；未发现降低期望、替换测试对象或用代码阅读代替执行的情况。`operation-3`/`operation-13` 的 `browser_navigate` 参数未被捕获，我无法复核具体 URL，但刷新后的页面快照与 status 请求表明加载的是同一应用页面，属等价操作。

## 4. 报告与证据的差异（均不影响产品结论）

1. `execution.md` §7 复述了测试账号标识（即页面显示的 displayName / 账号前缀字面值），与 plan §1 约束 8「一律不得复述邮箱、displayName、账号前缀」不一致；同一份工件的 3.1 却把该显示名写作 `[REDACTED]`，脱敏纪律不一致。此为工件记录规范问题，不改变测试结论；本审核不复述该值。（截图按 plan §1 约束 7 需保留真实已填表单，画面中可见合成邮箱与掩码密码，属要求保留的状态。）
2. Runner 3.6 称 `operation-34/39/43/54/59` 等之外还参考了未列出的收据；实际其 §5 证据索引与我所读偏差不大，未发现引用不存在的证据 ID。
3. `operation-7`（`browser_click`，`isError: true`，耗时 2ms）为首次点击未成功的调用；其后 `operation-8` 点击成功并触发登录。Runner 将其解释为「使用已弃用的 `ref` 参数被工具拒绝」，该解释的依据（调用参数）在收据中被省略，我无法复核，只能确认「存在一次失败点击、随后重试成功」，且 `operation-9` 显示失败调用未造成页面状态偏移。
4. Runner 3.2 关于「登录后会话用户 id 一致」的比对、3.4/3.6 中引述的 Cookie 清除提示字面值，均超出我可读的原始记录范围（响应体/输出被省略）。上述三点属 Runner 的陈述强于可读证据，我据原始记录另行判断，未采信其作为通过依据。

## 5. 覆盖缺口与无法确认事项

- **登录响应体缺失**：为取 `POST /api/auth/login` 响应体，`operation-18` 报 `Request #5 not found`（刷新后请求索引重置），故「登录后的用户资料 API 响应」未记录；登录前后用户身份一致性依赖页面快照与刷新后 status 响应。属「需要记录」项的部分缺口，不使期望 A 失效。
- **命令收据的输出省略**：`operation-12/23/26/32/40/52` 中 Cookie 相关 `output` 均被省略，Cookie 的存在性与属性依据 `credentialReferences` 的 `attributes`/引用标识判断；这足以闭合 C/D 的关键关联，但个别提示字面值不可复核。
- **工具来源与归属**：全部操作收据 `source` 为 `playwright-mcp-tool-result`，`execution.scenarioId = AUTH-LOGIN-001`，时间顺序与 `start/finish_scenario` 一致，未发现跨场景或后补事件；`browser_close` 的 `scenarioId` 为 `null`（`scope: auxiliary`），属收尾调用，不构成进度记录问题。
- **时间**：仅使用 Harness 收据时间与响应 `date` 头表达先后与间隔（如 `operation-29` 响应 `date: 14:30:24 GMT` 与收据时间先后一致），未据此声称目标服务器时钟已校准。
- **未覆盖范围**：`AUTH-LOGIN-002`、`AUTH-REGISTRATION-001`、`AUTH-REGISTRATION-002`、`AUTH-ORIGIN-001` 及重复邮箱 409、弱密码 400、Origin 403、限流 429、Session 有效期等边界本轮未执行，结论不外推。
- **仓库状态**：我无目标仓库读取权限，`baseCommit→targetCommit` 的文件变更范围、场景文件哈希与仓库当前 HEAD 的一致性无法独立核实；本审核基于 Harness 冻结的场景正文、Run 内证据与 plan 声明。

## 6. 数据收尾

场景步骤 6 本身要求删除测试账号，`DELETE /api/me => 200` 与「测试账号及其会话已删除。」为被测行为而非清理动作。Runner 已登记该账号供 Harness 收尾核验；清理结果不属于本次审核范围，也不影响上述判定。

## 7. 结论

- **AUTH-LOGIN-001：passed**（期望 A/B/C/D 逐项均有本 Run 运行时证据，C/D 的关键关联已闭合：携带退出前/删除前真实 Cookie 的 `GET /api/me` 分别返回 401，且请求头引用与原 Cookie、原凭据引用可对应）。
- **已确认产品 Bug：无**。
- **影响结论的缺口：无**；存在次要记录性缺口（登录响应体未取回、部分 Cookie 输出省略、`execution.md` §7 脱敏不一致），均已如实列出，不改变逐项判定。
- 本次审核未发现需要新建场景或补测的必要项，也不同意任何将未验证期望移入「限制」的处理。
