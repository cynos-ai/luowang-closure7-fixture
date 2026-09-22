# 审核记录 —— AUTH-LOGIN-001（登录状态恢复）

## 0. 审核范围与方法

- Run `01M34QS6B81CCJ2CYYG88SZ1CH`；target `f287add3d4054491f2ed5714cbb044a38a133f50`；`scenarioMode=autonomous`；`browserRequired=true`；`blockingReasons=[]`。
- 计划执行集合（唯一）：`AUTH-LOGIN-001`（approved，正文来自本 Run 冻结的 `selectedScenarioSnapshot`，`redacted=false`，contentSha256 与 sourceSha256 一致）。`scenario-changes.patch` 不存在，`scenarioChanges=null` —— 与计划「本轮无场景维护」一致。
- 独立核对顺序：先读 `plan.md` 与冻结场景正文 → `list_evidence_files` → 直接读取全部 77 个 `operation-*.json`、`command-1.json`、13 个页面快照/3 个控制台日志与 9 张截图 → 最后才读 `execution.md`。以下所有判断基于我本人读取的原始记录；与 `execution.md` 的出入单独列出。
- 本审核只读，不执行命令、不补测、不修改目标仓库；Run 结束后临时数据收尾由 Harness 处理，不作为测试阻塞项。

## 1. 逐场景结果

### AUTH-LOGIN-001 —— passed

冻结正文四项适用期望全部有充分运行时观察支持，未发现产品不符合预期的行为，无未闭合的适用期望。逐项依据（引用证据文件名 + 文件内 `sequence` 字段与工具名）：

| 期望（场景原文） | 结果 | 独立核对到的运行时依据 |
| --- | --- | --- |
| A 刷新后显示同一用户 | 符合 | `operation-5.json`（seq5，`browser_fill_form`，以凭据引用 `credential-1fda51…`/`credential-ee51…` 填入）→ `operation-8.json`（seq8，点击登录）→ `operation-9.json`（seq9，`browser_snapshot`：已登录区显示同一用户问候与「退出登录」「删除测试账号」）→ `operation-12.json`（seq12，重新导航加载页面）→ `operation-14.json`（seq14，刷新后仍为同一已登录用户，未回登录表单）→ 保护接口 `GET /api/auth/status` 200 且响应体（`operation-18.json`，seq18）含 `user.id=8c7eb925-5cbf-4fc6-9a6d-50842b6a63a9`、`createdAt=2026-09-22T14:19:41.299Z`。刷新后的 `GET /api/me` 亦为 200（`operation-22.json`），其 request-headers（`operation-24.json`，seq24，`observed-request-header: cynos_session = credential-7ac05d…`）证明请求确实携带会话 Cookie。 |
| B 退出后页面回到登录状态 | 符合 | `operation-30.json`（seq30，点击「退出登录」）→ `operation-31.json`（seq31，`POST /api/auth/logout => [200] OK`）→ `operation-32.json`（seq32，快照显示登录表单 + 提示「已安全退出。」）→ 截图 `after-logout.png` 目视确认登录表单、提示文案与空表单域（我本人读取）。logout 请求 headers（`operation-33.json`，seq33）载明携带 Cookie。 |
| C 退出后的 Session 访问受保护接口返回 401 | 符合 | 退出**前**真实 Cookie 读取：`operation-19.json`/`operation-25.json`（seq19/seq26，`browser_cookie_get`，`observed-browser: credential-7ac05d…`）。退出后 `operation-34.json`（seq35，`browser_cookie_set`，`restore-input: credential-7ac05d…`，即与退出前同一值引用）→ `operation-35.json`（seq36，`browser_cookie_get` 回读为同一引用）→ `operation-36.json`（seq37 导航）→ `operation-37.json`（seq38，`GET /api/me => [401] Unauthorized`）→ 401 页面体 `UNAUTHORIZED/请先登录`（`page-2026-09-22T14-22-47-183Z.yml`，`operation-38.json` seq39）→ **排除平凡 401**：该 401 请求的 request-headers（`operation-39.json`，seq40，`observed-request-header: cynos_session = credential-7ac05d…`）与退出前读取值同一引用，且无其他鉴权头。 |
| D 删除后旧 Session 与原凭据均不可用 | 符合 | 重新登录：`operation-45.json`（seq45，原凭据引用填入）→ `operation-47.json`（seq47 点击）→ `operation-48.json`（seq48，`POST /api/auth/login => [200] OK`）。删除**前**真实 Cookie：`operation-50.json`（seq51，`observed-browser: credential-16feee…`，与退出前会话为不同值，符合「重新登录签发新会话」）。删除：`operation-53.json`（seq54 点击「删除测试账号」）→ `operation-55.json`（seq55，`DELETE /api/me => [200] OK`）→ 响应体 `{"deleted":true,"authenticated":false,"user":null}`（`operation-58.json`，seq59）→ 页面提示「测试账号及其会话已删除。」（`page-2026-09-22T14-23-01-664Z.yml`，`operation-56.json` seq56）。旧 Session 校验：`operation-59.json`（seq60，`restore-input: credential-16feee…`，与删除前读取同引用）→ `operation-60.json`（seq61 导航）→ `operation-61.json`（seq62，`GET /api/me => [401]`）→ 401 体（`page-2026-09-22T14-23-06-558Z.yml`）→ request-headers（`operation-63.json`，seq64，`observed-request-header: credential-16feee…`）证明 401 时该删除前 Cookie 确已随请求发出。原凭据校验：清 Cookie 后 `operation-68.json`（seq69，同一凭据引用填入）→ `operation-71.json`（seq72 点击）→ `operation-72.json`（seq73，`POST /api/auth/login => [401]`）→ 响应体 `INVALID_CREDENTIALS/邮箱或密码不正确`（`operation-77.json`，seq77）→ 页面 alert「邮箱或密码不正确」（`page-2026-09-22T14-23-15-762Z.yml`）→ 截图 `post-delete-login-rejected.png`（我本人目视确认提示条、已填邮箱与掩码密码）。终态登录请求中**未见 cookie 头**（`operation-75.json`，seq75），与「先清理 Cookie 再用原凭据登录」一致。 |

关键推断说明（我的判断，非前序角色的结论）：对本轮最重要的期望 C、D，「Cookie 值 ↔ request-headers ↔ 响应」三段关联在本 Run 内闭合——证据中的 `credentialReferences` 只在同一 Run 内比较等值，我把「退出前/删除前 observed-browser 引用」与「restore-input 引用」与「401 请求的 observed-request-header 引用」三者逐一比对为同一引用，因此 401 不能由「未携带 Cookie 的平凡 401」解释。这与历史 Run `01M34KTXNGH0M305H03PBYHMPB`（同一场景在 base 上 failed：旧 Cookie 重放仍 200）方向相反，说明本轮观察到的行为在该 target 上未被复现为缺陷；但本轮结论只覆盖本 Run 的观察，不代表历史 Issue #1/#2 已被流程性关闭。

场景「需要记录」项核对结果：登录/刷新后用户资料（`operation-18.json`，同一 `id` 与 `createdAt`）；退出后 HTTP 状态 200（`operation-31.json`）；Cookie `HttpOnly=true`、`SameSite=Strict`（`operation-19.json`/`operation-25.json`/`operation-51.json` 的 `observed-browser` 属性）；删除后提示、旧 Session 401、原凭据 401（见期望 D 行）。均已落盘。

## 2. 已确认产品问题

- 本轮**未发现**可归因于产品的缺陷：四项适用期望所对应的实际行为与冻结场景正文一致，无 failed 状态。
- 非缺陷观察（不构成 Bug，供参考）：`cynos_session` 的 `secure=false`（`operation-19.json`），与目标环境为 HTTP（`http://closure7-retest2-target:3100`）一致；场景「需要记录」只要求 HttpOnly 与 SameSite，未要求 Secure，故不影响判定。
- 无复现条件可写：没有已确认缺陷。

## 3. 报告与执行记录符合度（与 `execution.md` 的差异）

1. **执行时序表述不准确（记录准确性问题，不影响结果）**：`execution.md` 第 1 节与第 7 节称被拒绝的 `node -e` 探测「发生在场景开始前」「侦察期」。原始记录显示 `command-1.json` 的 `sequence=20`、`startedAt=2026-09-22T14:21:12.249Z`，而 `start_scenario`（`operation-4.json`，seq4）在 `14:20:57.232Z`，即该命令被拒发生在**已声明场景之后**，属场景窗口内的执行尝试。该命令被工具以 `COMMAND_INVALID` 拒绝、未产生任何数据（`declared=true, completed=[]`，无输出），因此不改变任何期望判定；但「在场景开始前」的表述与记录不符，应更正为「场景执行期间被受控命令策略拒绝、未作为证据使用」。
2. **个别证据引用与内容不完全对应（轻微）**：`execution.md` 3.2 以 `operation-18.json` 作为 `GET /api/me` 的响应体来源；该文件实际是 `GET /api/auth/status`（index 4）的响应体。用户公开资料（`id`/`createdAt`）确实取自该 200 响应，期望 A 支持成立，但本轮**未**留存 `GET /api/me` 200 的响应体。「刷新后显示同一用户」由刷新后快照（`operation-14.json`）+ 该 200 响应 + `/api/me` 200 列表（`operation-22.json`）共同支持，结论不受影响。
3. **`cookie_list` 输出在捕获记录中被省略**：`execution.md` 3.6 称 `cookie_list` 返回「No cookies found」（`operation-41.json`/`operation-65.json`），但这两条捕获记录 `output` 为 `[Output omitted…]`，我无法据存档独立核对这句断言。该清 Cookie 事实由独立证据佐证：清 Cookie 后的登录请求 headers 中不含 `cookie`（`operation-75.json`，seq75），且该次登录返回 401。故属「辅助断言不可独立核对」，不影响已成立的适用期望。
4. 其余引用（`operation-25/26`、`operation-30~39`、`operation-50/55/56/58/59/60/61/63/72/73/75/76`）经逐一比对，文件内容与 `execution.md` 描述一致。
5. 计划声明 `browserRequired=true` 与真实执行一致：证据中可见真实 `browser_navigate`/`browser_snapshot`/`browser_fill_form`/`browser_click`/`browser_cookie_*` 操作、页面快照与控制台日志，非仅读取既有材料。
6. 数量一致性：`execution.md` 尾部声明「已上传 103 个 evidence 文件」，`list_evidence_files` 返回 9 图 + 77 operation + 1 command + 3 console + 13 page = 103，一致。`finish_scenario` 记录（`operation-77.json` 所在末条，seq78）标记 `completed=["AUTH-LOGIN-001"]`，与声明执行集合一致。

## 4. 覆盖与限制（不影响本次 passed，供下游保留）

- 仅覆盖 `AUTH-LOGIN-001`。`AUTH-ORIGIN-001`（draft）、`AUTH-LOGIN-002`（draft）、`AUTH-REGISTRATION-001`（approved 未授权）、`AUTH-REGISTRATION-002`（draft）及其边界（重复邮箱、弱密码/无效邮箱、Origin 403、限流 429、7 天会话有效期等）本轮未验证，结论不外推。
- 截图层面：三张已登录态截图（`after-login.png`、`pre-logout-logged-in.png`、`pre-delete-logged-in.png`）字节完全相同（sha256 `7ea4f6ea…`），三张填表截图（`login-form-filled.png`、`relogin-form-filled.png`、`relogin-original-credentials-filled.png`）亦完全相同（sha256 `4b602aef…`），与「页面状态未变」相符，不是缺陷；已登录态截图为视口截图，底部「删除测试账号」按钮仅部分可见（裁切），该按钮的存在与点击效果由 DOM 快照（`operation-9.json`）与 `DELETE /api/me 200` 独立支持，故不降低期望 D 的支持强度。
- 我按受控工具实际读取了本 Run 全部 9 张截图并据此描述观察；截图内容由模型/工具渲染，无人工复核记录，本审核不声称人工确认。
- 时间：本审核引用的时间戳均为 Harness 捕获记录内的合成时钟（同一 Run 内可比较），不代表真实服务器时钟已校准。
- 未复述任何邮箱、displayName、口令或完整 Cookie；`credentialReferences` 仅作等值引用使用。

## 5. 聚合结论

- `AUTH-LOGIN-001`：**passed**（四项适用期望 A/B/C/D 全部由运行时证据支持，无未闭合项、无产品缺陷）。
- 本批未发现必须补测的场景缺口：请求授权的唯一场景已完整承载「登录 → 刷新保持 → 退出撤销会话 → 删除账号并使旧会话/原凭据失效」闭环，且场景正文步骤 1–6 与四项期望在证据中逐一可核。
- 计划层面无错误需要上游修正；第 3 节所列三处为 `execution.md` 的记录准确性/引用精度问题（时序表述、`operation-18` 归属、`cookie_list` 输出不可独立核对），均不影响已成立的场景结果，建议最终 Main 在整理时按第 3 节如实保留来源与更正。
- 数据收尾：本轮测试账号在场景步骤内已删除（`DELETE /api/me => {deleted:true}`），Run 级清理状态由 Harness 收尾核验，不属本次审核结论。
