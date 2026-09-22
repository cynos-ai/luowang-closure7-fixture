# 审核报告：AUTH-LOGIN-001（登录状态恢复）

## 1. 审核范围与依据

- 固定 target：`fa6242b3105f1c01d7b82f363d145aca7e25ba16`（与 `plan.md` Harness 元数据、`selectedScenarioSnapshot.targetCommit` 一致）。
- 计划：`plan.md`，`planHash = e13230d0b48664d34e1e1abcf350e8abd1ba469433a18d1ea4d5c62e07cf3e51`，与 `query_source_reads(scope=plan)` 返回的 planHash 一致；`sourceReferences` 15 项均可在 `query_source_reads` 中找到对应回执（`returned-range` 2 项、`full-file` 13 项，其中 `src/server/app.ts`、`src/server/security/auth.ts`、`src/server/config.ts`、`src/web/App.tsx` 为 `redacted: true` 的脱敏全文）。
- 维护：`scenarioChanges = null`，`read_run_artifact("scenario-changes.patch")` 返回“工件不存在”，与计划 §3“本轮无场景维护动作”一致。
- 执行清单：`## execution_scenarios` 仅 `AUTH-LOGIN-001` 一项，`selectedScenarioSnapshot` 冻结正文 `redacted: false`、字数与源一致，未被裁剪。
- 审核对象：`execution.md`、94 个 evidence 文件（7 张截图、3 个 console 日志、12 个页面快照、72 个 operation 命令回执），其中逐条读取了 operation-1…-72、3 个 console 日志、2 个页面快照，并逐一读取 7 张截图（读取图片先于打开 `execution.md`）。

## 2. 逐场景结果

### AUTH-LOGIN-001：`passed`

四项适用期望均由本 Run 的真实浏览器操作与观察支持。

**期望 A：刷新后显示同一用户 —— 确认**
- 登录后页面快照（operation-11）显示已登录态标题「你好，[REDACTED]。」与「当前登录邮箱是 [REDACTED]。」，含「退出登录」「删除测试账号」按钮；登录响应体（operation-14，#5 response-body）`authenticated:true`、含 `user.id`/邮箱/displayName/`createdAt`。
- 刷新（operation-15 `browser_navigate`）后快照（operation-17）仍为同一已登录态；刷新期间网络（operation-16，filter `api/auth`）**只有** `GET /api/auth/status => 200`，**没有新的 `POST /api/auth/login`**，说明刷新沿用原 Session；刷新后 `status` 响应体（operation-18，#4）`user.id` 与登录响应相同。
- 截图 `auth-login-001-02-logged-in.png` 与 `auth-login-001-03-after-refresh.png`（sha256 均为 `c1d1a2b4…`）画面一致：显示名与邮箱一致，页面无错误提示；经 `read_evidence_image` 实际读取确认。

**期望 B：退出后页面回到登录状态 —— 确认**
- 退出网络（operation-23）：`POST /api/auth/logout => 200`；响应体（operation-25，#5）`{"authenticated":false,"user":null}`；响应头（operation-27）`date: Tue, 22 Sep 2026 21:25:51 GMT`。
- 退出后快照（operation-24）回到「登录 Cynos」并显示「已安全退出。」；截图 `auth-login-001-04-after-logout.png` 实际读取确认同一文案，表单回到空态、无遮挡。

**期望 C：退出后的 Session（原 Cookie）访问受保护接口 401 —— 确认**
- 退出前读取 Cookie（operation-20 `cookie_list` / operation-21 `cookie_get`）：存在 `cynos_session`，属性 `httpOnly: true`、`sameSite: Strict`、`secure: false`，harness 值引用 `credential-b01dfdde…`。
- 恢复该退出前 Cookie（operation-29，restore-input 引用同为 `credential-b01dfdde…`），并复核存在（operation-30，observed-browser 引用仍为 `credential-b01dfdde…`，属性一致）。
- 受保护请求（operation-31/‑32）：`GET /api/me => 401 Unauthorized`；该请求真实 request-headers（operation-33，#1 request-headers，`credentialReferences.source = observed-request-header`，引用同为 `credential-b01dfdde…`）显示 `cookie: [REDACTED]`；响应体（operation-34）`{"error":{"code":"UNAUTHORIZED","message":"请先登录","requestId":"req-n"}}`，响应头（operation-35）`x-request-id: req-n`、`date: Tue, 22 Sep 2026 21:25:56 GMT`。
- 关键关联成立：读取 → 恢复 → 实际请求头三处的值引用为同一会话值，401 不是“未带 Cookie 的平凡 401”。console 日志 `console-2026-09-22T21-25-56-621Z.log` 独立记录 `401 (Unauthorized) @ /api/me`。

**期望 D：删除测试账号后旧 Session 与原凭据均不可用 —— 确认**
- 重新登录（同一原凭据，构成“删除前原凭据仍有效”对照）：operation-37 一次 `browser_fill_form` 因快照引用过期返回 `isError:true`（`Ref f1e41 not found`），随后重新快照（operation-38）再填写成功（operation-39），点击（operation-41）；网络（operation-42）`POST /api/auth/login => 200`，响应体（operation-45）`user.id` 与首次登录相同。该失败为重试性质，未改变被测对象或降低期望。
- 删除前读取 Cookie（operation-44）：新会话值引用 `credential-978b7261…`（与退出前值不同，属重新登录后的新会话）。
- 删除：`DELETE /api/me => 200`（operation-47），响应体（operation-49）`{"deleted":true,"authenticated":false,"user":null}`；删除后快照（operation-48）回到登录页并显示「测试账号及其会话已删除。」；截图 `auth-login-001-06-after-delete.png` 实际读取确认该文案（邮箱输入框保留已填值）。
- 旧 Session：恢复删除前 Cookie（operation-51，restore-input 引用 `credential-978b7261…`），复核存在（operation-52，同引用）；`GET /api/me => 401`（operation-53/‑54），该请求 request-headers（operation-55，observed-request-header 引用同为 `credential-978b7261…`）显示 `cookie: [REDACTED]`；响应体（operation-56）`UNAUTHORIZED`、`x-request-id: req-w`（响应头 operation-57）。console 日志 `console-2026-09-22T21-26-11-909Z.log` 独立记录 `401 @ /api/me`。
- 原凭据：清除 Cookie（operation-61，`expires: 0`），`cookie_list` 无返回引用（operation-62），重载（operation-63）后以原凭据登录 → `POST /api/auth/login => 401`（operation-67），响应体（operation-69）`{"error":{"code":"INVALID_CREDENTIALS","message":"邮箱或密码不正确","requestId":"req-19"}}`；页面快照（operation-68）显示 alert「邮箱或密码不正确」，截图 `auth-login-001-07-deleted-credential-rejected.png` 实际读取确认；console 日志 `console-2026-09-22T21-26-19-068Z.log` 记录 `401 @ /api/auth/login`。

**“需要记录”项（辅助记录）—— 已具备**
登录/刷新后资料（operation-14/-18/-45）、退出后 HTTP 状态（operation-23 的 200 与受保护接口 401，operation-32/-54）、Cookie 的 `HttpOnly` 与 `SameSite=Strict`（operation-21/-30/-44/-52 均为 true/Strict；`secure:false` 未在场景中要求，不作为缺陷）、删除后提示与旧 Session/原凭据结果（operation-48、-54、-67）均已记录。

## 3. 已确认产品问题

无。本 Run 未发现与场景四项期望相悖的实际行为，未识别出产品缺陷；按计划 §7 本轮亦未创建或关联 Issue（`execution.md` §5 有此声明，但该声明不在可核验证据范围内，仅作转述）。

## 4. 场景设计、遗漏与维护声明

- 场景选取合适：`AUTH-LOGIN-001` 为唯一 approved 且在本轮授权范围内，四项期望可观察、步骤对应到实际操作；未发现重要遗漏或错误合并。
- `AUTH-ORIGIN-001`（draft）等未进入清单，符合请求约束；`## execution_scenarios` 非空，本轮不属于“零执行场景”。
- 维护声明成立：无 `scenario-changes.patch`，未见任何场景文件改动迹象，与“无新增/修改/rename/deprecated”一致。
- `browserRequired = true` 与真实执行一致：本 Run 存在大量带时间戳的 Playwright MCP 工具回执（导航、填表、点击、截图、Cookie 读写、网络请求回放）与页面快照/console 日志，可支持“确实发生过浏览器执行”，不是仅有预置合成材料。

## 5. 与 `execution.md` 的差异、归因与覆盖缺口（均不影响结论）

1. **初始导航早于 `start_scenario`**：operation-2（`browser_navigate`，21:25:38.517Z）与 operation-4（快照）标注 `scenarioId: null`、`scope: auxiliary`，早于 operation-3 的 `start_scenario`（21:25:39.382Z）。这是我的观察：它属初始页面加载，正式场景步骤（填写/点击等）均在 `start_scenario` 之后，不改变被测对象或断言含义。但 `execution.md` §1/§5 称“执行顺序与计划一致”“无时序偏差”，未记录此先后细节，属轻度表述过度。
2. **“退出后 No cookies found”证据不可直接复核**：`execution.md` §2 步骤 4 引 operation-28 得出“No cookies found”，而该回执 `output` 为省略文本，仅 `credentialReferences` 为空。此结论在我可读证据中只能由“无返回引用”间接支持；期望 C 不依赖它（关键是 operation-29/-30/-33 的恢复与请求头关联），故不构成阻塞。同理 operation-62 的“无返回引用”支持 Cookie 已清除。
3. **归因精度**：`execution.md` §1 称 `begin_scenario_execution` 声明了 `["AUTH-LOGIN-001"]`，但 operation-1 回执中 `scenarioId: null`、`completed: []`，该声明不出现在回执内；§2 步骤 5 把 401 状态挂在 operation-31（navigate）上，而状态码实际来自 operation-32/-34。属表述归因问题，不影响观察事实。
4. **收尾登记未获证据支持**：`execution.md` §6 称已 `register_test_data` 登记账户，但 94 个 evidence 中无对应回执。此为收尾事项，按共同规则由 Harness 负责，且删除行为已在场景内验证（`DELETE /api/me => 200 {"deleted":true}`），不影响产品结论。
5. **时间口径**：仅有响应 `date` 头（21:25:43 / 21:25:51 / 21:25:56 / 21:26:11 GMT）与 Harness 上传时间（21:26:39Z 起）可比对先后，未获服务器时钟校准依据；`execution.md` §1/§5 未声称时钟已校准，与证据一致。
6. **未读取的辅助证据**：部分页面快照（如 `/api/me` 的 125 字节快照 page-2026-09-22T21-25-56-656Z.yml）未逐一读取；它们属可选的辅助材料，适用期望已由网络回执、请求头与截图支持，故不构成覆盖缺口。
7. **计划层面的不确定项**（沿用计划 §8，未在本轮消解）：无 base，无法给出 base↔target 变更清单；`query_run_history` 为空，历史 Run 结果不可从受控接口取得；同仓历史报告仅作线索，不作为本轮证据。

## 6. 脱敏与边界

- 本报告与所引工件均以 `[REDACTED]` 指代邮箱、displayName、口令与完整 Cookie 值，未复述任何凭据值；Cookie 仅以 harness 值引用（如 `credential-b01dfdde…`、`credential-978b7261…`）区分会话来源。
- 审核未执行命令、未读取账号、未读取目标仓库任意路径历史 Issue；未自行补测。
- 测试数据清理由 Harness 在最终 Main 后处理，本轮不据此判定通过或失败；场景自身的删除行为已按实际证据（operation-47/-49、operation-54、operation-67）判定。

## 7. 结论

- `AUTH-LOGIN-001`：**`passed`**。四项适用期望（刷新同一用户、退出回登录态、退出后原 Cookie 访问受保护接口 401、删除后旧 Session 与原凭据均不可用）均有真实操作与可复核证据支持，且 401 的 Cookie 关联经 `observed-request-header` 值引用闭环。
- 未发现产品缺陷，未发现影响判定的场景遗漏或执行偏差；上述第 5 节问题均为记录/归因层面的轻度偏差，不改变结论，建议在最终汇总中如实保留来源归属。
