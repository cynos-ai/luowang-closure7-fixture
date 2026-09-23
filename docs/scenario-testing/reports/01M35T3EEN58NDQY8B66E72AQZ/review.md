# Review：AUTH-LOGIN-001（Closure 7 独立测试仓库 · 首次初始化）

- Run：`01M35T3EEN58NDQY8B66E72AQZ`（manual，initialization=true，scenarioMode=autonomous）
- Target：`ef468e7c94d023d36da1e88254af90cdcc934b21`（baseCommit=null，includedCommits=[] → 只作 target 整体验收，不可归因到具体改动）
- 执行环境（证据）：非生产 fixture `http://cu4-initialization-target:3100`
- `browserRequired: true`，`blockingReasons: []`

## 0. 审核方式与独立性

本审核先读 `plan.md` 与冻结的 `selectedScenarioSnapshot`，再经 `list_evidence_files` 逐一读取原始证据（98 条 operation 记录、18 份页面快照、3 份 console 日志、2 条 command、11 张截图全部实读），形成独立判断后才打开 `execution.md` 对照。以下结论凡属本人观察即归 Reviewer，Runner 报告内容按原文表述引用并注明其归属。

未读取源码、未执行命令、未获取账号、未写目标仓库；`query_source_reads` 仅查阅读回执元数据。

## 1. 计划、冻结场景与前置核对

- 计划与冻结快照一致：`planHash=4f116901c4848bfd021001966e69bb1b948d412bca6d339393fa07919375d129` 与计划开头 Harness 元数据一致（`query_source_reads(scope="plan")` 返回同值）。
- 冻结场景 `AUTH-LOGIN-001` 正文 `sourceSha256=6f60babb…`（未 redacted）与静态阶段对 `docs/scenario-testing/scenarios/AUTH-LOGIN-001.md` 的 `contentHash=6f60babb…`（回执 `6d98a0eb-583f-4752-8c40-e4a366dff96d`，full-file）一致 → 计划所读场景正文即本次执行定义，无被替换风险。
- `scenario-changes.patch` 不存在，与计划「本轮不新增/修改/rename/deprecated 长期场景」的声明一致。计划唯一 `## execution_scenarios` 为 `AUTH-LOGIN-001`，正式执行集合即此 1 项。
- 计划中 `src/server/security/auth.ts`、`src/server/app.ts` 等回执为 `redacted:true`（fullSafeText 仅覆盖已返回脱敏文本），因此计划第 6 节的静态实现描述属脱敏文本理解，不可作为期望是否成立依据；本审核的判定全部改以运行观察为准，与计划第 7 节要求一致。

## 2. 逐场景结果

### AUTH-LOGIN-001 登录状态恢复 —— **passed**

适用期望 A–D 全部有充分实际观察支持；步骤 1–6 均已执行；需要记录项齐全。执行记录显示正式场景操作均带 `scope:"scenario", scenarioId:"AUTH-LOGIN-001", declared:true`（operation-31…operation-97），场景开始/结束事件分别见 operation-30（`start_scenario`，sequence 32，`00:23:09.999Z`）与 operation-98（sequence 100，`00:24:08.181Z`）。

**步骤 1 / 前置：用测试账户登录**
- 表单以 Run 前缀预置账号填写，截图 `auth-login-001-step1-filled-login-form.png`（sha `a0eb2a87…`）实读可见邮箱为 `luowang-01m35t3een58ndqy8b66e72aqz-preset@example…`、口令栏为掩码，未见明文。
- `POST /api/auth/login => 200`（operation-35，sequence 37）；响应体 `{"authenticated":true,"user":{"id":"766f1a5e-d962-4f3a-9298-f2a8e39d1b16","displayName":"luowang-01M35T3EEN58NDQY8B66E72AQZ-preset",…}}`（operation-39，sequence 41）。
- 登录后快照显示 Welcome 视图与「退出登录 / 删除测试账号」按钮（operation-34，sequence 36）；截图 `auth-login-001-step1-logged-in.png`（sha `8f6286d2…`）实读一致。
- 新 Session Cookie `cynos_session`：`httpOnly: true, secure: false, sameSite: Strict`，`domain: cu4-initialization-target, path: /`（operation-36，sequence 38；同属性亦见 operation-45/55/71/81）。

**步骤 2–3 / 期望 A：刷新后显示同一用户 —— 符合**
- 重新加载 `/`（operation-40，sequence 42，`browser_navigate`，即真实再次加载）。刷新后快照仍显示同名用户与同一按钮组（operation-41，sequence 43）；截图 `auth-login-001-step3-after-refresh.png`（sha `8f6286d2…`，与登录后帧逐字节相同）。
- 刷新后 `GET /api/auth/status => 200`，响应体为同一 `id=766f1a5e-…`、同一 displayName（operation-43、44，sequence 45/46）；刷新后 Cookie 值引用 `credential-9d58d31f4afc6348add773b56320628c` 与登录后相同（operation-45，sequence 47）。
- 结论：以「刷新后真实快照 + auth/status 响应体指向同一账户」判定通过，归 Reviewer 判断；Runner 的对应结论见 execution.md「期望 A」，其依据与上列记录相符。

**步骤 4 / 期望 B：退出后页面回到登录状态 —— 符合**
- 退出前读取并固化真实 `cynos_session`（operation-45，sequence 47，`observed-browser`，引用 `credential-9d58…`）。
- `POST /api/auth/logout => 200`（operation-47，sequence 49）；该请求 request-headers 携带 `cookie`，引用为 `credential-9d58…`（即退出前原 Session，operation-50，sequence 52，来源 `observed-request-header`）；响应体 `{"authenticated":false,"user":null}`（operation-53，sequence 55）。
- 退出后页面快照回到登录表单并显示「已安全退出。」（operation-48，sequence 50）；截图 `auth-login-001-step4-after-logout.png`（sha `7dcf2925…`）实读可见该提示与空表单。
- 退出后 `browser_cookie_list`（operation-51，sequence 53）`credentialReferences` 为空 → 浏览器侧已无 `cynos_session`。
- 需要记录项「退出后 HTTP 状态」：logout 本身 200；退出后「原 Session 访问受保护接口」401，见期望 C。

**步骤 5 / 期望 C：退出后的 Session 访问受保护接口返回 401 —— 符合（已排除弱观察）**
- 恢复方式：`browser_cookie_set` 写回退出前固化的同一值（`restore-input`，引用 `credential-9d58…`，operation-54，sequence 56；属性 httpOnly/secure/sameSite 与原始一致），`browser_cookie_get` 回读为同一引用（operation-55，sequence 57）。
- 关键观察：以该恢复 Cookie 访问受保护接口 `GET /api/me`（document 导航，operation-63，sequence 65）→ 页面状态 `[401] Unauthorized`；该请求 request-headers 明确带 `cookie`，且引用为 `credential-9d58…`（`observed-request-header`，operation-65，sequence 67）；响应体 `{"error":{"code":"UNAUTHORIZED","message":"请先登录","requestId":"req-1a"}}`（operation-66，sequence 68）；页面快照 `page-2026-09-23T00-23-34-102Z.yml` 正是该 JSON 错误体；console 日志 `console-2026-09-23T00-23-34-062Z.log` 记录「401 (Unauthorized) @ …/api/me」。
- 关联链成立：请求头观察值（`observed-request-header`）= 恢复输入值（`restore-input`）= 退出前浏览器实际持有值（`observed-browser`），三者在本 Run 内为同一引用；因此该 401 是「服务端收到退出前原 Session 后拒绝」，不是丢 Cookie 造成的未认证 401。计划第 7 节期望 C 要求的证据形态已满足，不存在「关联较弱」的缺口。
- 归 Reviewer 的结论：期望 C 符合；Runner 的相同判定见 execution.md「步骤 5 / 期望 C」。

**步骤 6 / 期望 D：删除账号后旧 Session 和原凭据均不可用 —— 符合**
- 重新登录原账号：`POST /api/auth/login => 200`（operation-76，sequence 78）；新 `cynos_session` 引用 `credential-9cc27c998c12007957f2665f5cd8bff5`，与退出前值不同（operation-71、73，sequence 73；值不复述），可支持「退出后重登产生新会话」。
- 删除前固化真实 Cookie（operation-71，sequence 73，`observed-browser`）。
- 点击「删除测试账号」：`DELETE /api/me => 200`，请求头携带删除前的 `cynos_session`（引用 `credential-9cc27…`，operation-78，sequence 80）；响应体 `{"deleted":true,"authenticated":false,"user":null}`（operation-79，sequence 81）。
- 删除后提示：快照显示「测试账号及其会话已删除。」（operation-74，sequence 76）；截图 `auth-login-001-step6-after-delete.png`（sha `e05d6b55…`）实读一致。删除后 `browser_cookie_list` 空（operation-77，sequence 79）。
- 旧 Session 重放：写回删除前固化值（`restore-input`，引用 `credential-9cc27…`，operation-80，sequence 82；回读 operation-81，sequence 83），访问 `GET /api/me` → 页面 `[401] Unauthorized`，请求头 `cookie` 引用同为 `credential-9cc27…`（operation-83，sequence 85；来源 `observed-request-header`）；页面快照 `page-2026-09-23T00-23-52-114Z.yml` 为对应 JSON 错误；console 日志 `console-2026-09-23T00-23-52-080Z.log` 记录同一次 401。
- 原凭据重登：以原邮箱与原口令提交（operation-89，sequence 91）→ `POST /api/auth/login => 401`，响应体 `{"error":{"code":"INVALID_CREDENTIALS","message":"邮箱或密码不正确","requestId":"req-1r"}}`（operation-91/92/93，sequence 93/94/95）；快照与截图 `auth-login-001-step6-relogin-original-credentials.png`（sha `376b96eb…`）实读可见「邮箱或密码不正确」且保持未登录；console 日志 `console-2026-09-23T00-23-54-557Z.log` 记录该 401。（注：该次登录请求亦携带了注入的旧 Cookie，但不改变 401 INVALID_CREDENTIALS 的结论。）

**需要记录项对照（全部落实）**

| 记录项 | 实际结果 | 稳定证据引用 |
|---|---|---|
| 登录后用户资料 | `luowang-01M35T3EEN58NDQY8B66E72AQZ-preset`（id 766f1a5e-…） | operation-34、operation-39；截图 step1-logged-in |
| 刷新后用户资料 | 同一 id / displayName | operation-41、operation-44 |
| 退出后 HTTP 状态 | logout 200；原 Session 访问 `GET /api/me` → 401 UNAUTHORIZED | operation-47/50/53、operation-65/66；page-…00-23-34-102Z.yml |
| Cookie 是否 HttpOnly / SameSite=Strict | `httpOnly: true`、`sameSite: Strict`（`secure: false`，与 HTTP 环境一致） | operation-36（另见 operation-45/55/71/81） |
| 删除后提示 | 「测试账号及其会话已删除。」 | operation-74；截图 step6-after-delete |
| 删除后旧 Session | 携带删除前原 Session 的 `GET /api/me` → 401 | operation-80/83/84；page-…00-23-52-114Z.yml |
| 原凭据登录结果 | 401 INVALID_CREDENTIALS，页面「邮箱或密码不正确」 | operation-89/92/93；截图 step6-relogin-original-credentials |

## 3. 执行是否跑到位、报告是否符合实际

- 步骤覆盖：步骤 1–6 齐全，无跳过、无换对象、无降低期望；受保护接口按计划用 `GET /api/me`（场景语「受保护的用户资料接口」）。
- 方法等价性：步骤 2 以 `browser_navigate` 再次加载根路径实现「刷新」（等效可接受）；期望 C/D 采用计划第 7 节规定的「固化原 Cookie → 恢复 → 重放真实请求 → 查 request-headers 与响应」。Runner 报告中的 operation 序号引用与本人实读的记录逐条对得上（例：退出请求头=operation-50、`/api/me` 401 详情=operation-65、删除请求头=operation-78、删除后重放=operation-83、原凭据 401=operation-92/93），未见把未做的操作写成已完成。
- 归 Reviewer 的观察：execution.md 存在两处不精确，均不影响结论——(a)「已清除重放用的临时 Cookie 并关闭页面（operation-95/96 显示 No cookies found）」中，清 Cookie 的 `browser_cookie_set(expires=0)` 实为 operation-95（sequence 97），空列表为 operation-96（sequence 98），而 `browser_close` 是 operation-97（sequence 99），未引用；(b) 预检查项引用 operation-27/28（sequence 29/30）确为场景开始前的辅助导航与快照，与「场景之外」的表述一致，但其 `scope` 记为 `auxiliary, declared:false`，非 recon 阶段记录。
- 记录异常（Harness 侧）：场景开始事件 operation-30 记为 `scenarioId:"AUTH-LOGIN-001", scope:"scenario"`，而结束事件 operation-98 记为 `scenarioId: null, scope:"auxiliary"`，仅以 `completed:["AUTH-LOGIN-001"]` 体现归属。即 execution.md 所写「`start_scenario(AUTH-LOGIN-001)` → `finish_scenario(AUTH-LOGIN-001)`」在「结束事件带场景 ID」这一点上超出实际记录内容；场景确实开始且被声明完成（completed 列表含该 ID），故对结果判定无影响，但记录标签不一致宜由后续角色知悉。
- 截图与结论的对应：`auth-login-001-step5-replay-after-logout.png` 采集于 `00:23:32`，早于 `/api/me` 重放导航（`00:23:34`，operation-63），实读画面为登录表单（sha `7d5c3dcb…` 与 recon-01 相同），不是 401 响应画面；期望 C 的决定性依据是 operation-65/66 的请求头+响应，以及 `page-…00-23-34-102Z.yml` 的错误体快照。截图命名易让读者误以为它本身即重放结果，属证据组织问题，不改变结论。
- 视觉核对：11 张截图全部实读，均为真实页面、全页范围，未见为改善证据而清空/遮盖；填写现场保留（step1-filled、step6-after-delete、step6-relogin 检出可见表单值），Welcome 视图右下「删除测试账号」按钮在画面下缘部分可见（非控件被遮挡，仅视口裁切）。

## 4. 已确认产品问题

无。本 Run 未发现与 `AUTH-LOGIN-001` 期望相冲突的产品行为：退出确实撤销服务端会话（原 Session 重放 401）、删除账号确实使旧 Session 与原凭据失效（401 / 401 INVALID_CREDENTIALS）、刷新保持登录、退出后 UI 回登录态。

关于计划第 6 节记录的两条 open Issue（#1 删除后旧账号/会话仍可用、#2 退出不撤销服务端 Session）：本 Run 的运行观察**未复现**其描述行为。此为 Reviewer/执行记录在本 target 上的观察，不代表对 Issue 历史范围或状态的判断；本 Run 亦无创建/关联 Issue 的证据。

## 5. 覆盖缺口与无法确认项

1. **Session 有效期（计划记为 7 天）未验证**：场景未要求，本 Run 即时观察不能支持时长结论。属已知未覆盖项。
2. **清理接口启用状态未知**：本 Run 未调用 `GET|DELETE /api/luowang/test-data/<RunID>`，无法判断 `CYNOS_TEST_DATA_CLEANUP_TOKEN` 是否配置；不影响场景结论。
3. **计划 §1 表述「完整执行六个隔离 Session」未在运行中体现为六个隔离会话**：本 Run 使用单一浏览器上下文（仅末尾一次 `browser_close`，operation-97），期望 C/D 以 Cookie 注入+重放达成。该表述的具体指代无法从本 Session 工件确认；若其字面要求六个彼此隔离的浏览器会话，则本 Run 未提供对应证据。因场景全部适用期望已按计划规定方式闭合，此项不改变 `AUTH-LOGIN-001` 的 passed 判定，但如实列为待澄清项。
4. **脱敏读取范围**：`src/server/security/auth.ts`、`src/server/app.ts` 等回执 `redacted:true`，其隐藏内容不在覆盖范围内，本审核未据其判断实现正确性（也不需要）。
5. **Cookie 引用语义**：`credentialReferences` 只表示「本 Run 内值相同」。本 Run 中以该同一性把「恢复输入」「请求头观察」「浏览器观察」三者关联，足以支持期望 C/D；不据此推断跨 Run 或跨时间的行为。
6. **历史 Run 查询为空**：`query_run_history` 对本 target 与 `AUTH-LOGIN-001` 均无记录，仓库内却存在 `docs/scenario-testing/reports/**` 历史报告文件；本 Run 结论不依赖历史记录。

## 6. 清理状态

- 场景内按步骤 6 实际删除测试账号（业务行为，删除生效已由期望 D 验证）；重放用临时 Cookie 已清除（operation-95，sequence 97），随后 `browser_cookie_list` 为空（operation-96，sequence 98），页面已关闭（operation-97，sequence 99）。
- 测试后临时数据收尾由 Harness 在最终 Main 后处理，不属本次审核或测试阻塞。
- 本审核未在证据中看到明文口令或 Cookie 值（表单值、Cookie 值均以 `[REDACTED]`/占位形式出现；截图中口令为掩码）；此为本人对所读证据的观察，不构成对全部工件或环境「无任何泄漏」的绝对声明。

## 7. 结论

- **AUTH-LOGIN-001：passed**。期望 A（刷新后同一用户）、B（退出后回到登录态）、C（退出后原 Session 访问受保护接口 401，且请求头证据显示确实携带退出前原 Session）、D（删除后旧 Session 401 且原凭据登录 401）均以实际运行观察充分支持。
- 无已确认产品 Bug；无阻塞项。计划/报告层面的记录标签与引用精度问题、step5 截图时序命名问题、以及第 5 节的未覆盖项已如实列出，均不影响本场景判定，供最终 Main 保留来源与措辞。
