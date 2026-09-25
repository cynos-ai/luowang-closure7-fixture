# 审核报告：Cynos Website 已有场景非生产回归（Run 01M3C8S9ZFZ6YGRGGVGRH2XRRQ）

审核角色：Reviewer（模型，独立上下文）。审核对象：`plan.md`、本 Run 原始证据（81 条 `operation-*.json`、19 个 `page-*.yml`、5 个 console 日志、8 张截图）、`execution.md`。
未读 `scenario-changes.patch`：该工件不存在（`scenarioChanges: null`，`read_run_artifact` 返回“工件不存在”），与计划“本 Run 无场景 patch”一致。
计划元数据 `planHash = 0dceba6dea68d4b68be0d19d471b672c695b9729cecdaaccb6f4d4fa22eaf7e9`，与 `plan.md` 开头 Harness 元数据一致；`query_source_reads(scope=plan)` 返回同一 planHash。
`selectedScenarioSnapshot` 冻结的两份场景正文（AUTH-LOGIN-001 `contentSha256 6f60babb…`、AUTH-REGISTRATION-001 `4a339eb5…`，均 `redacted:false`）与计划引用的场景读取回执（`09ee4064…`、`b9f225e9…`，`full-file`）哈希一致；即本例未发生“计划正文与冻结正文不一致”。

## 1. 结论汇总

| 场景（按执行顺序） | Reviewer 判定 | 依据强度 |
| --- | --- | --- |
| AUTH-LOGIN-001 登录状态恢复 | **passed** | 4 项适用期望均有实际运行观察；期望 3/4 为非平凡会话重放 |
| AUTH-REGISTRATION-001 新用户注册 | **passed** | 4 项适用期望均有运行观察；期望 3 为受限范围聚合 |

已确认产品 Bug：**0 个**。发现的问题均为记录/证据归属层面的问题（第 5 节），不改变上述产品结果。
未完成项：无场景级 blocked；存在 1 项无法判定的异常（§5.1）与若干覆盖面缺口（第 6 节，多数为计划已声明的边界）。

## 2. 执行范围与方式核对

- 正式执行集合来自计划唯一的 `## execution_scenarios`：`AUTH-LOGIN-001` → `AUTH-REGISTRATION-001`，与 `operation-2/3/56/81` 的 `scenario-progress` 事件顺序一致，无越集执行。
- `requiresBrowser: true` 与实际执行相符：`operation-*.json` 中含真实 Playwright MCP 操作（`browser_navigate`、`browser_snapshot`、`browser_fill_form`、`browser_click`、`browser_cookie_get/set/list`、`browser_network_request(s)`、`browser_take_screenshot`），并有对应快照文件落盘。`browserRequired` 声明与真实执行一致。
- 场景维护：计划声明“不新增、不修改、不废弃”，无 patch，与 `scenarioChanges: null` 及不存在的 `scenario-changes.patch` 相符；本 Run 未出现“已维护但无变更”的矛盾叙述。
- 计划缺口自述（无产品 diff、draft 场景未执行、持久层级联未静态确认、口令覆盖面受限）与本次实际执行情况相符，未发现计划正文与执行相冲突的断言（无“归还/恢复”类与断言矛盾的条款）。

## 3. AUTH-LOGIN-001 登录状态恢复：passed

场景正文适用期望 4 项，逐项核对如下（引用为稳定证据文件名）。

1. **刷新后显示同一用户 —— 满足。**
   `operation-19` 导航重载、`operation-20` 快照显示欢迎态（`hello` 标题 + 邮箱 `luowang-01m3c8s9zfz6ygrggvgrh2xrrq-loginui@example.com`），与 `operation-16`（登录后欢迎态）为同一用户与同一邮箱；截图 `auth-login-001-after-reload.png`（与 `auth-login-001-after-register.png` 同一 sha256 `e70e419f…`）视觉确认“你好，Login UI Tester。/ 当前登录邮箱 …-loginui@example.com”。
2. **退出后页面回到登录状态 —— 满足。**
   `operation-24` 点击“退出登录”，`operation-25` 快照为登录表单 + “已安全退出。”，截图 `auth-login-001-after-logout.png` 显示同一状态；`operation-26` 网络列表记录 `POST /api/auth/logout => 200`。
3. **退出后的 Session 访问受保护接口返回 401 —— 满足（非平凡）。**
   `operation-18`（退出前 `browser_cookie_get cynos_session`，`observed-browser` 引用 `credential-ea7376ff…`，属性 `httpOnly: true, sameSite: Strict, path: /`）→ `operation-29`（`browser_cookie_set`，`restore-input` 引用同为 `credential-ea7376ff…`）→ `operation-30` 导航 → `operation-31` `GET /api/me => 401` → `operation-32` 该请求请求头 `cookie` 的 `observed-request-header` 引用 **同为 `credential-ea7376ff…`**，响应头 `x-request-id: req-zx` → `operation-33` 响应体 `UNAUTHORIZED/请先登录`，`requestId` 一致；`page-2026-09-25T12-33-10-327Z.yml` 与 console 日志 `console-2026-09-25T12-33-10-290Z.log`（`/api/me 401`）互证。该 401 是**携带退出前会话**取得的，而非“未带 Cookie 的 401”，故不适用 Reviewer 手册中“weak replay”失效条件。
4. **删除测试账号后旧 Session 和原凭据均不可用 —— 满足。**
   - 旧会话：`operation-39`（重登后 `browser_cookie_get`，`observed-browser` 引用 `credential-acb5e1d4…`）→ `operation-44`（`browser_cookie_set`，`restore-input` 引用同为 `credential-acb5e1d4…`）→ `operation-46` `GET /api/me => 401`，其 `observed-request-header` 引用亦为 `credential-acb5e1d4…`（`x-request-id: req-107`，`page-2026-09-25T12-33-31-040Z.yml` 及 console 日志 `console-2026-09-25T12-33-31-011Z.log` 互证）。
   - 原凭据：`operation-49/50` 用同邮箱+同口令引用再次登录 → `operation-51` `POST /api/auth/login => 401` → `operation-52` 页面提示“邮箱或密码不正确”，截图 `auth-login-001-relogin-after-delete.png` 视觉确认该提示与所填邮箱。
   - 删除动作本身：`operation-40` 点击、`operation-41` 提示“测试账号及其会话已删除。”、`operation-42` `DELETE /api/me => 200`、截图 `auth-login-001-after-delete.png`。

**需要记录项**均已交付：登录/刷新后资料（邮箱、头像“L”、昵称快照内脱敏）、退出后 HTTP 状态（logout 200 / 重放 me 401）、Cookie 属性（HttpOnly、SameSite=Strict；`secure:false` 系 HTTP 非生产，期望未要求）、删除后提示 + 旧会话 401 + 原凭据 401。

**与 open Issue 的关系**：Issue #2（退出不撤销服务端 Session）、Issue #1（删除账号未真正删除）对应期望在本 Run、本 target 上均未复现。该“未复现”是 Reviewer 依据上述运行证据的观察，归 Reviewer；Runner 在 `execution.md` 中亦写明同一结论并限定范围，不构成对缺陷不存在的断言。

## 4. AUTH-REGISTRATION-001 新用户注册：passed

1. **页面显示欢迎信息 —— 满足。** `operation-61/62` 填写并提交，`operation-63` `POST /api/auth/register => 201 Created`，`operation-64` 快照显示欢迎态与邮箱 `...-reg@example.com`，`operation-65` 响应体 `authenticated:true` + 用户 id；截图 `auth-registration-001-welcome.png` 视觉确认“你好，Reg Tester。/ …-reg@example.com”。
2. **`GET /api/auth/status` 返回已登录用户 —— 满足。** `operation-67` 重载 → `operation-68` 网络列表 `GET /api/auth/status => 200` → `operation-69` 响应体 `{"authenticated":true,"user":{… email …-reg@example.com …}}`，与注册响应同一 user id；`operation-71` 快照再次显示欢迎态。
3. **数据库不保存明文密码 —— 在本 Run 标记账户范围内满足。** `operation-70`（`controlled-test-account-storage`）在注册后、删除前记录 `accounts: 2, argon2id: 2, other: 0`，覆盖本 Run 两个标记账户。此为受限聚合：不覆盖其他行、其他位置或生产库，Runner 与计划均已标注该边界，Reviewer 采信其作为“本 Run 标记账户口令列为 Argon2id 摘要、无明文”的证据，不作绝对结论。
4. **可从欢迎页删除测试账号、原邮箱密码随后不能再登录 —— 满足。** `operation-72` 点击删除 → `operation-73` `DELETE /api/me => 200` → `operation-74` 提示“测试账号及其会话已删除。”+ 回到登录态（截图 `auth-registration-001-after-delete.png`）；`operation-76/77` 用原邮箱与原口令登录 → `operation-78` `POST /api/auth/login => 401` → `operation-79` 页面“邮箱或密码不正确”，截图 `auth-registration-001-relogin-after-delete.png` 视觉确认。

**需要记录项**（注册结果、页面昵称、会话恢复、删除后提示与重登失败）均已交付。注：`execution.md` 将昵称记录为“快照对昵称值脱敏”，与截图实际显示明文昵称（合成昵称 “Login UI Tester” / “Reg Tester”）略有出入，属记录表述不精确，不影响判定（见 §5.3）。

## 5. 发现的问题（均不改变产品结论）

### 5.1 首次浏览器登录 401 的成因无法从证据判定（未定性，非产品 Bug 结论）
`operation-7` 以脱敏值填写登录表单、`operation-9` 提交后 `operation-11` 页面提示“邮箱或密码不正确”，console 日志 `console-2026-09-25T12-32-35-249Z.log` 记录该 `POST /api/auth/login => 401`（页面会话起点 12:32:35 + 7645ms ≈ 12:32:43，与提交流程时序吻合）。`execution.md` 将该现象解释为“受控浏览器工具不替换口令占位符，直接输入字面量导致 401”，并据此改用 UI 注册新账号完成登录流程，同时声明 HTTP 建立的 `...-login@example.com` 未用于浏览器登录。
- 关键限制：`browser_fill_form` 回执对填写值一律脱敏为 `value: [REDACTED]` 并给出 `valueReference`，因此**无法从捕获工件判断当时实际提交的是占位符字面量还是凭据值**；两种解释（占位符未被替换 / 邮箱与口令并非该 HTTP 账号的真实凭据）都无法排除。Runner 的因果说明属其推断，本次审核无法独立复核，也不构成“产品 Bug”确认。
- 影响面：该次失败发生在为满足前置而做的建号尝试中，不属于场景任一明列期望；随后以真实浏览器注册（`operation-15 => 201`）与真实表单登录（`operation-36/37/38 => 200`，页面回到欢迎态）分别成立，故不影响期望 1–4 的判定，也不使场景降级为 blocked。**未决部分**：“用经 `POST /api/auth/register` 建立的账号进行浏览器登录”这条路径在本 Run 未被有效验证（既未确认成功，也未确认失败），后续如需覆盖应另行授权验证。

### 5.2 部分记录表述超出捕获证据
- `execution.md` 称“退出后 `browser_cookie_list` 为空（operation-28），Cookie 已被清理”。`operation-28` 的输出在回执中为 `[Output omitted; this receipt records operation timing, not a business verdict]`，**该“为空”的结论无法由捕获证据复核**。退出导致 Cookie 清理可由 `operation-25`（回到登录态）与 `operation-26`（logout 200）间接支持，但“列表为空”本身应标注为未复核。不影响期望 2 的判定。
- `execution.md` 多处引用“请求头确实携带 cookie”，该判断经 Reviewer 对照 `operation-23/32/46` 的 `observed-request-header` 引用成立（§3 第 3、4 项），此处无问题；仅上一条属超范围表述。

### 5.3 `execution.md` 中含会话凭据的字面片段（卫生问题）
`execution.md` 在描述退出前/删除前会话时写入了会话 Cookie 值的**短字面片段**（形如 `xxxx…xxxx`），而非仅使用 Harness 引用 ID（`credential-ea7376ff…`、`credential-acb5e1d4…`）。本次审核不重复其内容。建议后续以引用 ID 代替任何凭据值片段；该问题不影响测试结论，也未见口令明文或完整 Token 落盘（`execution.md` 仅写“自选合成口令”“≥12 字符”，未复述口令值）。

### 5.4 场景进度记录的一处标注异常
`operation-55` 事件为 `finish_scenario`，其 `completed: ["AUTH-LOGIN-001"]`，但 `scenarioId` 字段写为 `AUTH-REGISTRATION-001`；紧接着 `operation-56` 才是 `start_scenario: AUTH-REGISTRATION-001`。即 AUTH-LOGIN-001 的完成事件被标了下一场景的 ID。按事件内容（completed 列表、时序）与 `operation-81` 最终 `completed: ["AUTH-LOGIN-001","AUTH-REGISTRATION-001"]` 判断，实际执行顺序与计划一致，未见“事后补报场景”或跨场景错位操作；`execution.md` 中“无事后补报顺序”的表述就此点属**记录元数据瑕疵**，非执行事实错误。另有 `operation-54`（口令聚合）无 `scenarioId` 字段、在 AUTH-LOGIN-001 结束与 AUTH-REGISTRATION-001 开始之间调用，`execution.md` 已如实说明其为跨场景辅助观察，Reviewer 认可该说明；`operation-70`（注册后）才是注册场景期望 3 的对应证据。

## 6. 覆盖缺口与无法确认事项

1. **口令不落明文**仅覆盖本 Run 标记账户的口令列格式（`operation-70`），不含其他行/位置/生产库，不构成“全库无明文”结论（与计划缺口 3 一致）。
2. **持久层级联**（`DELETE /api/me` 是否级联清除 `auth_sessions`）未做静态确认，本 Run 以运行观察（删除后旧会话 401）实际判定；本次审核未读源码，不补做静态结论。
3. **draft 场景**（AUTH-LOGIN-002、AUTH-REGISTRATION-002、AUTH-ORIGIN-001）不在执行集，未作通过/失败判断；run-scoped 清理接口契约未执行，属计划声明范围外。
4. **无产品 diff**：base↔target 变化清单（`c995b76d…`，2 项，均为 `docs/scenario-testing/reports/01M3B9TQ1D6MKEJ0Z96QXBRPAE/` 下的报告工件）来自计划侧读取回执；本次审核按角色边界未读仓库，diff 结论以计划回执为准，结论仅限当前 target 的既有场景行为。
5. **计划中 `src/server/app.ts`、`src/server/security/auth.ts` 与历史 review.md 的读取回执标记 `redacted: true`**，计划对其行为描述属其声明，本次审核不把它当作产品行为证据；两场景的全部判定均以运行证据为准。
6. **时间**：应用侧时间（响应头 `date`、注册响应 `createdAt`）与 Harness 证据上载时间同处 2026-09-25T12:32–12:35Z 区间且次序自洽；console 日志的相对毫秒以各自页面会话起点为原点，可与对应操作时刻对齐（如 12:32:35 起点 +7645ms ≈ 12:32:43 的登录提交），但两者无共同校准时钟，故本审核不给出跨来源的精确事件时间断言。
7. **人工复核缺位**：本流程全部为模型角色执行与审核，无人工复核记录；本文中“截图视觉确认”均为模型读图结果，不等于人工复核。

## 7. 对 `execution.md` 一致性的总评

- 结论清单（2 场景、均 passed）与 Reviewer 独立判定一致；`execution.md` 对期望 3/4 使用会话重放并要求请求头携带该会话，与原始记录相符，未见降低期望或把“未带 Cookie 的 401”当作通过依据。
- 偏差披露充分：Runner 主动说明了登录会话获取方式的改变及其理由，并说明未使用 HTTP 建立账号登录；该偏差不改变场景操作对象与断言含义，不构成 blocked 条件。
- 需修正（应回写同一 writer，无需改变结论）：§5.2 的“Cookie 列表为空”应改为未复核；§5.3 的凭据片段应替换为引用 ID；§5.4 可补一句进度事件 `scenarioId` 标注异常。

## 8. 数据与收尾（不属本次审核判定范围）

`execution.md` 登记 3 条 Run 标记账户（`...-login` 仍存在，`...-loginui`、`...-reg` 已在场景内通过 `DELETE /api/me` 删除并验证），并明确“不声明清理完成”。按要求，测试后临时数据清理由 Harness 在最终 Main 之后处理，本次审核不据此阻塞；场景内 `DELETE /api/me` 属期望 4 的业务操作，未被用作清理完成依据（Runner 亦如此表述）。
