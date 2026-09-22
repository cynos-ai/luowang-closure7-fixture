# 审核记录：AUTH-LOGIN-001（Run `01M348D1DVD9S0J9YTJ6Y8JTSB`）

- 固定 target：`6405a45b6889ad92cf7cfbce12d8ec22b5040f23`（`baseCommit = null`、`includedCommits = []`）
- 执行清单（`plan.md` 唯一 `## execution_scenarios`）：`AUTH-LOGIN-001`
- 审核对象：本 Run 的原始 command/浏览器/图片证据（先读证据形成判断，后读 `execution.md` 对照）
- 审核主体：Reviewer（模型）独立核对；本记录不声称人工复核
- 时间说明：以下时间均取自 Harness 捕获的同一工具时钟（工具返回值与截图文件名时间）；不换算为真实绝对时间，也不推断服务器时钟已校准

## 1. 结论摘要

| 场景 | 判定 | 依据强度 |
| --- | --- | --- |
| AUTH-LOGIN-001 登录状态恢复 | **passed** | 期望 A/B/C/D 四项均有独立实际操作与前后状态证据；Cookie 读取属性、退出/删除状态码、重放请求头与响应体齐备 |

- 未发现产品缺陷；未创建/关联 Issue。
- 无阻塞项影响本场景判定；`plan.md` 已登记的能力缺口（`GET /health`）不在本场景期望范围内，不改变结论。
- 关键自评：本轮最容易被"看起来通过"掩盖的是期望 C/D 的"原 Session 可区分性"。我按证据逐一核对了「退出/删除前读取的真实 Cookie → 重放时请求头中确实携带同一凭据 → 响应 401」这条链，而非只看 401 状态码，见 §3.3、§3.4。

## 2. 场景选择与计划核对

- 计划仅复用 target 内 approved 场景 `AUTH-LOGIN-001`，未新增/修改/rename/deprecated 场景，与请求"本轮不改动长期场景资产"一致；`scenario-changes.patch` 在本次 Run 工件中**不存在**（读取返回"工件不存在"），与 `scenarioChanges = null`、计划"不产出 patch"的声明一致，不存在"已维护但无变更"的虚述。
- 场景正文（Harness 冻结快照，`redacted: false`）的四项期望与"需要记录"四项均属适用期望：前置（存在非生产测试账户、允许第一方 Cookie）在本 Run 成立（预置账号 + 登录后 Cookie 正常写入），无原文条件未触发、也无授权排除。
- 计划要求的关键可观察能力（读取真实 Cookie、Cookie 固化/恢复、查看真实受保护请求的 request-headers 与响应）在本 Run 由 Playwright MCP 实际提供并实际使用（`browser_cookie_get`/`browser_cookie_set`/`browser_network_request` 均有场景范围回执），非仅声明。
- `browserRequired = true` 与真实执行一致：本 Run 存在真实浏览器操作回执（导航、快照、截图、Cookie、网络请求），截图非预置合成材料。

## 3. 逐场景结果：AUTH-LOGIN-001 —— passed

以下证据引用采用与 `execution.md` 相同的 `operation-N.json` 文件口径（文件内 `sequence = N+1`），并补注序列号以便复核。

### 3.1 期望 A：刷新后显示同一用户 —— 通过

- 登录：`browser_fill_form`（`operation-64.json`，序列 65）填入预置邮箱/口令（参数值脱敏为 `[REDACTED]` + 不透明 `valueReference`），`login-form-filled.png`（`operation-65.json`，序列 66 截图）显示真实表单已填写、密码以掩码呈现；点击「登录」（`operation-66.json`，序列 67）后欢迎态快照（`operation-67.json`，序列 68）显示 `你好，luowang-01M348D1DVD9S0J9YTJ6Y8JTSB-preset。` 与当前邮箱（快照内脱敏）。
- 刷新：`browser_navigate` 重新加载 `/`（`operation-70.json`，序列 71），随后快照（`operation-71.json`，序列 72，新文档 ref 前缀 `f1e*`）仍显示**同一 displayName**；两页面文本一致，登录态在整页重载后恢复。
- 截图：`after-login-welcome.png`、`after-refresh-same-user.png`（我逐张读取，两张均呈现同一欢迎态）。
- 记录项：`browser_cookie_get`（`operation-72.json`，序列 73）返回 `httpOnly: true, secure: false, sameSite: Strict, path: /`。
- 我的判断：期望 A 成立；"同一用户"由刷新前后 displayName 一致 + 登录态恢复支持，邮箱在快照中脱敏，但单账户场景下不影响同一性判断。

### 3.2 期望 B：退出后页面回到登录状态 —— 通过

- 点击「退出登录」（`operation-74.json`，序列 75）后快照（`operation-76.json`，序列 77）显示登录表单 + 提示文案 `已安全退出。`；截图 `after-logout-login-state.png`（我读取确认提示与登录表单同在）。
- 网络列表（`operation-77.json`，序列 78）：`POST /api/auth/logout => [200] OK`（退出后 HTTP 状态已记录）。
- Cookie 侧：退出后 `browser_cookie_list`（`operation-75.json`，序列 76）无任何凭据引用（同 Run 内此前/此后的 `cookie_list` 均会列出 `cynos_session` 引用，故判定为 Cookie 已被清除；该回执正文被省略，此为模式推断而非逐字读取）。
- 我的判断：期望 B 成立。

### 3.3 期望 C：退出后的原 Session 访问受保护接口返回 401 —— 通过

- 退出前真实 Cookie 已固化：`operation-72.json`（序列 73）`observed-browser` 引用 `credential-64047edc…`（Harness 保证同 Run 内同引用即同值）。
- 退出并清 Cookie 后**未重新登录**，用上述原值恢复：`browser_cookie_set`（`operation-79.json`，序列 80，`source: restore-input`，同一引用）。
- 重放：`browser_navigate` 到 `/api/me`（`operation-80.json`，序列 81）→ 网络列表（`operation-82.json`，序列 82）`GET /api/me => [401]`；请求详情（`operation-83.json`，序列 84）显示请求头 **确实携带** `cookie: [REDACTED]`，且 `observed-request-header` 引用与退出前读取值相同（`credential-64047edc…`）；响应体（`operation-84.json`，序列 85）为 `{"error":{"code":"UNAUTHORIZED","message":"请先登录",…}}`；控制台日志 `console-2026-09-22T09-55-07-611Z.log` 记录该 `/api/me` 401。
- 我的判断：301 与"丢 Cookie 的未认证 401"已区分——请求头带有同一真实会话值仍 401，支持"退出撤销了服务端会话"。计划早期记录的"退出未撤销会话"疑点在本次观察中**未复现**（此为 Reviewer 依据本 Run 证据的判断）。

### 3.4 期望 D：删除后旧 Session 与原凭据均不可用 —— 通过

- 重新登录（步骤 6 前半）：`operation-88.json`（序列 89）填写、`operation-89.json`（序列 90）点击，欢迎态快照（`operation-91.json`，序列 92）；网络列表（`operation-94.json`，序列 95）显示 `POST /api/auth/login => [200] OK`。新会话 Cookie 与退出前不同值（`operation-90.json`，序列 91，`credential-3093ac82…`），说明重新登录签发了新会话。
- 删除前固化真实 Cookie：`operation-90.json`（序列 91）属性 `httpOnly: true, sameSite: Strict`；截图 `before-delete-welcome.png`（欢迎态）。
- 删除：点击「删除测试账号」（`operation-93.json`，序列 94）→ `DELETE /api/me => [200] OK`（`operation-94.json`，序列 95）。
- 删除提示（页面行为，UI 观察）：快照（`operation-95.json`，序列 96）显示 `测试账号及其会话已删除。` + 登录表单；截图 `after-delete-login-state.png`（我读取确认提示文案在页面上可见）。删除后 `cookie_list`（`operation-96.json`，序列 97）无凭据引用。
- 旧 Session 不可用：用删除前读取的原值恢复（`operation-98.json`，序列 99，`restore-input` 引用 `credential-3093ac82…`）→ `/api/me`（`operation-99.json`，序列 100）→ `[401]`（`operation-100.json`，序列 101 网络列表）；请求详情（`operation-100.json`，序列 101）显示请求头携带 `cookie: [REDACTED]`，引用同为 `credential-3093ac82…`；响应体（`operation-101.json`，序列 102）`UNAUTHORIZED / 请先登录`。
- 原凭据不可用：返回登录表单用原邮箱 + 口令提交（`operation-104.json`，序列 105 填写 / `operation-105.json`，序列 106 点击）→ `POST /api/auth/login => [401]`（`operation-106.json`，序列 107）；页面 `role="alert"` 显示 `邮箱或密码不正确`（快照 `operation-107.json`，序列 108）；响应体（`operation-108.json`，序列 109）`{"error":{"code":"INVALID_CREDENTIALS",…}}`；截图 `original-credentials-rejected.png`（我读取确认为登录表单 + 红色错误提示，密码以掩码显示）。控制台 `console-2026-09-22T09-55-29-498Z.log` 记录该 `/api/auth/login` 401。
- 我的判断：期望 D 三项（删除提示、旧 Session 401 且带 Cookie 可区分、原凭据被拒）均成立。

### 3.5 场景"需要记录"项 —— 全部取得

| 记录项 | 实际观察 | 证据 |
| --- | --- | --- |
| 登录/刷新后用户资料 | 两次均显示同一 displayName（+ 当前邮箱，于快照内脱敏） | `operation-67.json`、`operation-71.json`；`after-login-welcome.png`、`after-refresh-same-user.png` |
| 退出后 HTTP 状态 | `POST /api/auth/logout => 200`；随后 `GET /api/me => 401` | `operation-77.json`、`operation-82.json`/`operation-83.json` |
| Cookie 是否 HttpOnly / SameSite=Strict | `httpOnly: true`、`sameSite: Strict`（另 `secure: false`、`path: /`） | `operation-72.json`、`operation-90.json` |
| 删除后提示 | `测试账号及其会话已删除。` | `operation-95.json`；`after-delete-login-state.png` |
| 旧 Session 结果 | 退出后原 Cookie → 401；删除后原 Cookie → 401（均携带 Cookie） | `operation-79/80/83/84.json`、`operation-98/99/100/101.json` |
| 原凭据登录结果 | `POST /api/auth/login => 401`，`INVALID_CREDENTIALS` | `operation-106/107/108.json` |

## 4. 已确认产品问题

无。本 Run 未观察到与场景期望相违的产品行为，也未观察到非预期错误（控制台仅记录被期望的 401 资源加载错误：`console-2026-09-22T09-52-39/56/59`、`09-55-07/26/29` 六个日志，均为 `/api/me` 或 `/api/auth/login` 的 401）。

## 5. 与 `execution.md` 的核对（报告符合实际性）

- 场景进度：`start_scenario`（序列 61，`scenarioId=AUTH-LOGIN-001`）在首个场景浏览器操作（序列 62）之前；`finish_scenario`（序列 111）在最后一张截图（序列 110）之后；场景范围操作（序列 62–110）均标记 `scenarioId=AUTH-LOGIN-001、declared=true`，无跨场景或事后补报的操作。`execution.md` 的"已完成 1/1、passed"与证据一致。
- 记录口径：`execution.md` 对 `operation-N.json` 的引用与我逐条核对的内容一一对应（登录/刷新/退出/重放/删除/原凭据登录各步骤及状态码均无错引或夸大）。其"退出后 `cookie_list` 为空""删除后 `cookie_list` 为空"基于回执中无凭据引用得出，`cookie_list` 正文本身被省略，属合理推断；我在 §3.2 已按此口径表述。
- 需说明的差异（不影响结论）：
  1. `begin_scenario_execution`（序列 60）与 `finish_scenario`（序列 111）事件的 `scenarioId` 为 `null`、`scope=auxiliary`（`completed=["AUTH-LOGIN-001"]`），只有 `start_scenario`（序列 61）直接携带场景 ID。这是 Harness 进度事件的记录形态问题，不改变场景操作归属；`execution.md` 未提及该形态，也未据此做任何成功声明。
  2. 本 Run 早期 `operation-1…operation-59` 为侦察范围（`scope=initialization-reconnaissance`，含一次被拒的 `curl` 尝试：`command-1.json` 返回 `COMMAND_NOT_ALLOWED`，未获 `/health` 结果）。`execution.md` 的证据清单只列 `operation-63…109`，但上传收据覆盖全部文件；这些侦察操作未被叙述，也不属于场景执行范围，不构成本场景的判定依据或缺口。`execution.md` 关于"未执行 `run_fixture_command`、未独立探测 `/health`"的说明与该回执一致（被拒的命令不是 `run_fixture_command`）。
  3. 三张欢迎态截图（`after-login-welcome.png`、`after-refresh-same-user.png`、`before-delete-welcome.png`）sha256 相同。`execution.md` 如实记录并解释为"欢迎态视觉一致"。我的补充：字节相同本身不能区分"视觉一致"与"复用同一张图"，但期望 A 另有独立快照证据（序列 72，整页导航后的新文档快照仍显示同一用户），故该点不影响期望 A 成立。
- 来源归属：`execution.md` 明确声明其观察为"Agent（模型）在受控工具下的观察，非人工复核"，与本审核中的 Reviewer 观察区分清楚；本记录中"未复现退出未撤销会话"等结论归 Reviewer 判断，未写成 Runner 已判定。

## 6. 覆盖缺口与未验证项

1. `GET /health` 未验证（受控命令层拒绝 `curl`，无替代通道）。属验证能力缺口，不在 `AUTH-LOGIN-001` 期望范围，不影响本场景结论，但不得计入"已通过"。
2. 无 base/included commits：结论只对固定 target 整体成立，不能归因到具体提交或改动。
3. 场景索引与索引 Run 历史为空，检索效率受限，不影响本次以 target 正文为基准的判定。
4. 场景步骤的执行等价性：步骤 2"刷新"以整页 `browser_navigate` 重载 `/` 实现（等价性可接受）；步骤 5 以"恢复原 Cookie 后导航 `/api/me`"实现，比 UI 路径更直接地满足计划对"原 Session 可区分"的要求。二者均未降低断言强度，但差别如实记录。
5. 未执行且不在本轮授权范围：`AUTH-REGISTRATION-001/002`、`AUTH-LOGIN-002`（draft），以及重复邮箱 409、弱密码 400、Origin 403、限流 429、7 天会话有效期等边界；本审核结论不扩展到这些范围。
6. 截图内可见 Run 前缀测试账号邮箱（页面本身渲染），而快照文本对该邮箱做了脱敏；这属于快照与截图的内容差异，不影响"删除提示/错误提示可见"这一观察，也不涉及口令复述（口令始终以掩码呈现）。

## 7. 数据登记与清理状态（非本审核阻塞项）

- 场景内已通过 UI 实际删除所用预置账号（`DELETE /api/me => 200`）；侦察阶段另行使用的 `-recon` 账号亦已在侦察中删除（`recon-deleted-account-login-rejected.png`）。
- `execution.md` 已用 `register_test_data` 登记 Run 前缀账号供 Harness 收尾，并明示"登记不代表已清理"。测试后临时数据清理由 Harness 在最终 Main 后处理，不属本次审核结论，也不构成本场景阻塞。

## 8. 审核结论

`AUTH-LOGIN-001` 判定 **passed**：期望 A/B/C/D 及"需要记录"各项均有本 Run 实际浏览器操作与原始证据支持；期望 C/D 已通过"原 Cookie 值固化—重放—请求头携带同一值—401"链条与"未携带 Cookie 的 401"区分开；未发现产品缺陷。缺项与偏差（`/health` 未验证、无变化归因、进度事件 `scenarioId` 形态、截图哈希相同、侦察操作未叙述）均已在本记录中保留，且均不改变本场景判定。
