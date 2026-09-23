# 审核报告 · Run 01M36K2ZQ9ZP6GXDVXKDXVZVYF

## 0. 审核范围与依据

- 固定 target：`e05391cb5684a56408394964b2666e265dff0679`；`scenarioMode=autonomous`，`initialization=false`，`browserRequired=true`。
- 计划 `plan.md` 元数据 `planHash=8fc7526cd6da91fc30d74975d09502b8e8206e86a17f62b5ed6ccf9734e7dbce`，与 `query_source_reads(scope=plan)` 返回值一致；计划引用来源与覆盖声明自洽。
- `## execution_scenarios` 仅一行：`AUTH-LOGIN-001`。动态上下文 `scenarioChanges=null`，无 `scenario-changes.patch`；计划第 3 节声明“零新增/零修改/零 deprecated”，与事实一致（未发现维护 patch，故不采信“已维护”叙述，也不存在需核对的变更）。
- Harness 冻结的选定场景正文（`selectedScenarioSnapshot`）`sourceSha256=contentSha256=6f60babb…c64f7`，非 redacted，与计划读取回执 `2bdfbfb2…` 对 `docs/scenario-testing/scenarios/AUTH-LOGIN-001.md` 的 `contentHash` 相同，说明冻结正文即仓库中该 approved 场景原文。
- `blockingReasons=[]`。
- 审核方法：先读计划与场景原文，再独立核对 62 条 command 证据、14 份浏览器快照、3 张截图；形成判断后才读 `execution.md` 对照。以下结论凡属 Reviewer 自身观察，均据原始记录注明，不替 Runner 补写结论。

## 1. 执行实际情形（Reviewer 独立核对）

- `operation-1`（07:37:27.305Z）为 scenario-progress `begin_scenario_execution`（`scenarioId=null`, `scope=auxiliary`）；`operation-2`（07:37:28.470Z）才是 `start_scenario AUTH-LOGIN-001`；`operation-62`（07:38:47.148Z）`finish_scenario`，`completed=["AUTH-LOGIN-001"]`。本 Run 所有 `playwright-mcp-tool-result` 均归属 `AUTH-LOGIN-001`，无跨场景操作、无第二场景记录。
- 全流程 62 次操作中 3 次为截图、1 次读取删除账号提示页等：真实浏览器导航/快照/点击/填表/网络记录、Cookie 读写与请求头观察均可对应，`browserRequired=true` 与实际执行相符。
- 目标为一次性非生产 fixture（`http://cu10-dual-retry3-target:3100`），测试账户为 Run 前缀合成账户。

## 2. 逐场景结果

### AUTH-LOGIN-001 · 登录状态恢复 — **failed**

适用期望取场景正文“期望”四条，逐条核对：

| 期望（场景原文） | 独立核对到的实际观察 | 判定 |
| --- | --- | --- |
| 刷新后显示同一用户 | 登录后（`operation-7` 快照）显示已登录视图与显示名 `…-preset`；`operation-9` 重新加载后 `operation-10` 仍为同一已登录视图；`operation-11/12/13` 显示刷新触发的 `GET /api/auth/status` 为 200，响应体含与登录一致的用户 id（`1e46dd0c-…`）、显示名。 | passed |
| 退出后页面回到登录状态 | `operation-15` 点击“退出登录”后 `operation-16` 快照回到登录表单并含“已安全退出。”；`operation-17` 记录 `POST /api/auth/logout` 200。 | passed |
| 退出后的 Session 访问受保护接口返回 401 | 退出后仅写回退出前固化的原值（`operation-20`，`restore-input` 引用 `credential-36c9db…`，与 `operation-8` 的 `observed-browser` 引用相同）；`operation-21` 导航触发受保护接口，`operation-24` / 快照 `page-…07-37-54-501Z.yml` 页面正文直接呈现完整用户 JSON（含同一用户 id）；`operation-26/29` 复现同一结果；`operation-31` 记录该状态请求的请求头携带同一 `credential-36c9db…` 值（`observed-request-header`），`operation-32` 响应体 `{"authenticated":true,"user":{…}}`。**实际为 200 且仍认证，而非 401**。 | **failed** |
| 删除测试账号后旧 Session 和原凭据均不可用 | `operation-41` UI“删除测试账号”后 `operation-42` 页面提示“测试账号及其会话已删除。”；`operation-43/44` 记录 `DELETE /api/me` 200，响应体 `{"deleted":true,"authenticated":false,"user":null}`。随后仅写回删除前固化的原值（`operation-45`，引用 `credential-6a9d60ee…`，与 `operation-40` 的 `observed-browser` 引用相同）：`operation-46/47` 页面又回到已登录视图，`operation-49` 请求头携带同一 `credential-6a9d60ee…` 值，`operation-50` 响应体 `{"authenticated":true,"user":{…}}` → 旧 Session 仍可用。清理 Cookie 后用**原凭据**重新登录：`operation-55/56` 提交、`operation-57` 页面进入已登录视图、`operation-58/59` `POST /api/auth/login` 200 且响应体 `{"authenticated":true,…}` → 原凭据仍可登录。 | **failed** |

场景结论：**failed**。E1、E2 通过；E3、E4 两项适用期望均被充分实际观察证伪，场景内不残留未确认的适用期望。

截图核对（Reviewer 独立读取）：
- `auth-login-001-refresh-loggedin.png`（sha256 `6825f66f…`）：真实已登录页面，显示同一用户与邮箱文案，支撑 E1。
- `auth-login-001-e3-me-after-logout.png`（sha256 `e1dd7cc4…`）：浏览器直接呈现 `Pretty-print` 工具栏 + 受保护接口返回的完整用户 JSON，支撑 E3 被证伪（退出后原 Session 仍取到用户资料）。
- `auth-login-001-e4-login-after-delete.png`（sha256 `6825f66f…`）：内容为已登录视图，与 `operation-57` 快照一致，支撑“删除后原凭据仍可登录”。

## 3. 已确认产品缺陷（预期 / 实际差异与复现条件）

### 缺陷 A：退出登录未撤销服务端 Session（对应 E3）
- 预期（spec 行为 6 + 场景 E3）：`POST /api/auth/logout` 撤销当前 Session，退出后同一 Session 访问受保护接口应 401。
- 实际：退出（logout 200）后，仅写回退出前的同一 Session 原值，受保护接口仍返回完整用户资料（`operation-21/24`，截图 `…e3-me-after-logout.png`），后续 `GET /api/auth/status` 亦为 200 `authenticated:true`（`operation-31/32`，请求头确证携带退出前固化的同一引用值）。
- 复现条件：登录 → 固化 `cynos_session` → UI 退出 → 写回同一 `cynos_session` → 请求受保护接口 `/api/me` 或 `/api/auth/status`，即得 200 与用户资料。
- 说明：logout 自报 200/`{"authenticated":false}` 只是客户端状态，不能作为服务端撤销依据；运行时观察显示服务端 Session 未失效。

### 缺陷 B：删除账号接口返回成功但未删除账号 / Session（对应 E4）
- 预期（spec 行为 9 + 场景 E4）：删除成功后旧 Cookie 与原凭据均不可用（用户行与关联 Session 删除）。
- 实际：`DELETE /api/me` 返回 `{"deleted":true,…}`（`operation-44`），但删除前 Session 原值写回后仍取到用户资料（`operation-49/50`、`operation-47` 页面已登录视图）；原凭据重新登录仍 200（`operation-58/59`）并进入已登录视图（`operation-57`，截图 `…e4-login-after-delete.png`）。
- 复现条件：登录 → 固化 `cynos_session` → UI 删除账号（页面提示“测试账号及其会话已删除。”）→ 写回同一 Session 值请求受保护接口，仍 200；或以原邮箱口令重新登录，仍成功。
- 说明：与缺陷 A 相互独立（A 在退出路径、B 在删除路径），二者在本次运行中分别被观察到。

缺陷 A、B 与本计划所述请求（目标注入两处缺陷、对应历史 Issue #2/#1）在运行行为上一致；但**无 base/变更清单，无法归因到具体提交，也不代表生产环境**。计划第 2 节指出的“静态实现看似符合 spec 6/9”与运行观察的冲突，由本 Run 运行证据裁决为“目标运行行为确实存在两处缺陷”，静态阅读未作为结论依据。

## 4. 检查发现（Reviewer 观察，与产品结论分开）

以下均为 Reviewer 独立发现，均**不影响**第 2、3 节已由正反两面证据支持的产品结论；如实列出以便下游知悉：

1. **计划约束 #1 与实际首事件不完全一致（轻微）**：计划要求“第一项执行工具必须是 `start_scenario`”，实际首个进度事件是 `operation-1 begin_scenario_execution`（`scope=auxiliary`），`start_scenario` 为第二个事件（`operation-2`）。顺序仍为“声明 → 开始 → 执行 → 结束”，场景归属正确，不改变验证结论；按事实记录，不据此认定通过或失败。
2. **受保护接口请求详情未被网络列表收录（证据链已旁证，非阻塞）**：`operation-22/23/25/27` 的 `browser_network_requests` 结果为空（仅提示静态请求未显示，且 `includeStatic=true` 亦未返回），故 `/api/me` 的显式 HTTP 状态码未取得；`execution.md` 第 5 节已如实记录此点。E3 判定依赖“页面正文 `operation-24` + 紧随的状态请求请求头 `operation-31`（同一 `credential-36c9db…`）与响应体 `operation-32`”交叉印证，足以支撑“原 Session 仍认证”，故不阻塞；E4 的旧 Session 断言则有完整请求头 `operation-49` + 响应体 `operation-50`。审核不将“正文呈现用户 JSON”等同于显式 200 状态码，二者分别表述。
3. **Cookie 清理步骤的输入值不可追溯（轻微，不影响结论）**：`operation-33/51/61` 三次 `browser_cookie_set`（均带 `expires:"1"`，用于清理 Cookie）使用的 `restore-input` 引用为 `credential-d2a756…`，该引用在本 Run 从未作为 `observed-browser` 或 `observed-request-header` 出现，无法确证其来源（疑似占位/任意值以满足调用）。因 `expires:"1"` 使清理语义成立，且清理后页面确实回到未登录（`operation-36`、`operation-54`），故不影响 E3/E4 结论。但 `execution.md` 第 5 节“未猜测或新造 Cookie，未使用脱敏占位符作为恢复参数”一句，仅对“恢复（restore）”步骤（`operation-20`、`operation-45` 均使用正确观察值）成立，不宜扩大为“所有 Cookie 输入均可追溯”。
4. **两张截图字节相同（说明性）**：`auth-login-001-refresh-loggedin.png` 与 `auth-login-001-e4-login-after-delete.png` sha256 相同（`6825f66f…`）。二者本应呈现同一“已登录视图”页面状态（`operation-57` 快照与之一致），内容与结论自洽；但该 `e4` 截图因此不含独立的新画面信息，E4 的判定主要依据 `operation-57/58/59`。
5. **`execution.md` 缺陷 A 第 6 步文字截断**：正文在“请求头 `cookie: [REDACTED]`”后中断，未写完该句结论；对照原始 `operation-31/32` 可补齐其意指，不影响判定，但工件表述不完整。
6. **口令未被复述**：所有 command 证据与浏览器快照中的凭据字段均为 `[REDACTED]`；`execution.md` 未复述账号、口令或完整 Cookie。三张截图中可见合成测试账户邮箱等填写内容（Harness 按配置处理），属被测页面的正常业务显示，非受控口令；本报告不复述该值，也不作“无任何泄漏”的绝对声明。

## 5. 覆盖缺口与无法确认事项

- **数据库层未核验**：无只读 DB 入口，删除是否真正作用于用户行/Session 行未从存储层确认（计划第 7 节已声明）。E4 依据“旧 Session 200 + 原凭据登录 200 + 接口自报 `deleted:true`”，属 API/界面层充分证据，缺陷 B 成立不依赖 DB 直查。
- **不可归因提交 / 不代表生产**：无 base commit 与变更清单，只能整体验收。
- **计划第 7 节的超范围项未执行**（Session 有效期、`/health` 降级、Origin 403、注册/登录限流 429、按 Run 查删端点等），本次结论不外推至这些范围。
- 未发现重要漏测：场景“需要记录”的四项（登录/刷新资料、退出后 HTTP 状态、Cookie 属性 HttpOnly 与 SameSite=Strict、删除后提示与旧 Session/原凭据结果）均已记录；Cookie 属性由 `operation-8` 记为 `httpOnly: true, sameSite: Strict, secure: false`（`secure:false` 与非 HTTPS 非生产 fixture 相符）。
- 合并项核对：1 个执行场景、2 个已确认产品缺陷（缺陷 A、B）、0 个未验证适用期望；场景数与期望数口径与明细一致，无重复计数。

## 6. 与 `execution.md` 的一致性

- 场景清单、执行顺序、逐场景结果为 failed、缺陷 A/B 的预期与实际差异、证据索引，与 Reviewer 独立核对结果一致；`execution.md` 未把 Runner 自身的判断强加于 Reviewer，其结论可由原始记录复核。
- 第 4 节列出的偏差（首事件、缺失的 `/api/me` 状态码、Cookie 清理输入）属记录保真度与覆盖说明问题，`execution.md` 对其中第 2 点已自行披露；不影响产品结果。
- `browserRequired=true` 与实际浏览器执行相符；未见以“合成材料”替代真实执行的迹象。

## 7. 结论

- `AUTH-LOGIN-001`：**failed**（E1 通过、E2 通过、E3 失败、E4 失败）。
- 已确认两个独立产品缺陷：退出不撤销服务端 Session（A）与删除账号返回成功但不生效（B），均有真实 UI 操作 + 真实 Cookie 固化/写回 + 真实请求头与响应体证据支持，可复现。
- 无 blocked 情形：本批唯一场景的关键适用期望均已由实际观察闭合（通过或证伪），不残留未决的关键疑问。
- 数据清理为 Harness 收尾事项（`operation-61` 已清 Cookie；合成账户已登记 `cleanupScope=website-accounts`），其最终结果不改变本报告的产品结论。
