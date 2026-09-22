# 审核记录：AUTH-LOGIN-001 登录状态恢复

- Run：`01M34GE6SGXEQZYHN3Y4HMW4BX`；固定 target `6a07377a4f41880f8869ccd8b4106acc5b4aa321`（base `6405a45b6889ad92cf7cfbce12d8ec22b5040f23`）。
- 审核对象：`plan.md`（`## execution_scenarios` 仅一项 `AUTH-LOGIN-001`）、动态上下文冻结的选定场景正文、本次上传的原始命令/浏览器/截图证据、`execution.md`。
- `scenario-changes.patch`：本 Run **不存在**（`read_run_artifact` 返回「Run 工件不存在」），与计划「本轮不做任何场景资产维护、不产出 patch」的声明一致。
- `browserRequired = true`，且有实际 Playwright MCP 操作记录（`source: playwright-mcp-tool-result` 的 navigate/click/fill_form/snapshot/cookie_* /network_request 等），声明与实际执行一致。
- 审核主体为模型；本记录不声称任何人工复核。

## 一、场景选择与维护声明核对

- 计划仅选用 target 内已存在的 approved 场景 `AUTH-LOGIN-001`，理由为 base→target 净变化仅 `docs/changes/cynos-website-auth/spec.md` 契约澄清（新增已确定行为 10）加两份历史报告/审核文档，无源码变化。所选场景正文覆盖请求的业务承诺（登录→刷新仍同一用户、退出后回登录态、退出后原 Session 受保护接口 401、删除账号后旧 Session 与原凭据失效），未见重要遗漏或错误合并。
- 计划声明「不新增/修改/rename/deprecated 任何长期场景」，且无 patch 文件，二者一致。
- 计划明确把 draft/未授权场景（AUTH-LOGIN-002、AUTH-REGISTRATION-001/002）及重复邮箱、弱密码、Origin、限流、会话有效期等边界列入「不在授权范围」，属合理的范围声明，未用来豁免本场景内的适用期望。
- 场景正文冻结快照 `redacted=false`，`sourceSha256 == contentSha256`，无脱敏缺口影响判断。

## 二、逐场景结果

### AUTH-LOGIN-001 登录状态恢复 —— `passed`

以下为 Reviewer 独立读取原始证据（不依赖 execution.md 叙述）后得出的判断；引用均为本次证据文件名。

**前置与进度**
- `start_scenario(AUTH-LOGIN-001)`（`operation-8.json`，seq8）在首个场景浏览器操作（`operation-9.json` 截图，seq9）之前；`finish_scenario`（`operation-76.json`，seq78，completed 含 `AUTH-LOGIN-001`）在最后一步观察（seq77）之后，无补报时序。
- 初始未登录态：`GET /api/auth/status => 200 {"authenticated":false,"user":null}`（`operation-5.json` seq7，`operation-3.json` 快照）。

**期望 A —— 刷新后显示同一用户（含 spec 第 10 条：继续用原 Session；ID/邮箱/昵称与登录响应一致）—— 满足**
- 登录响应 `POST /api/auth/login => 200`（`operation-11.json` seq13、`operation-12.json` seq14）：`user.id = b867ee0d-5c7c-4c71-8659-11afe70d6bdf`，`displayName = luowang-01M34GE6SGXEQZYHN3Y4HMW4BX-preset`，`createdAt = 2026-09-22T12:11:21.274Z`，`email = [REDACTED]`（Harness 脱敏）。页面进入欢迎态（`operation-10.json` seq12；截图 `auth-login-001-02-logged-in.png`）。
- 刷新后 `GET /api/auth/status => 200`，`authenticated:true`，`user.id/displayName/createdAt` 与登录响应逐项相同（`operation-20.json` seq20、`operation-21.json` seq21）；页面文本仍为同一用户欢迎态（`operation-19.json` seq19；`page-2026-09-22T12-13-08-249Z.yml`）。
- 「继续用原 Session」：登录后读取的 `cynos_session`（引用 `credential-8fe32e010db77659a21d926e6811edd0`，`operation-15.json` seq17）与刷新后读取值**同一引用**（`operation-22.json` seq22），即复用原会话而非新建。
- `email` 在响应体中均被脱敏，无法逐字比较；但登录后与刷新后的页面行为证据——截图 `auth-login-001-02-logged-in.png` 与 `auth-login-001-03-after-refresh.png` 的 sha256 完全相同（`22b677…0071e`），且同步对比响应体中的 `id`、`displayName`、`createdAt` 完全一致——共同支持「恢复资料与登录响应一致」。`id` 仅由响应体支撑，页面不含 id，符合计划口径。

**期望 B —— 退出后页面回到登录状态 —— 满足**
- `POST /api/auth/logout => 200`（`operation-24.json` seq26），响应体 `{"authenticated":false,"user":null}`（`operation-27.json` seq29）；页面回到登录表单并显示提示「已安全退出。」（`operation-23.json` seq25；`page-2026-09-22T12-13-13-816Z.yml`；截图 `auth-login-001-04-after-logout.png`）；退出后 `cynos_session` 已不存在（`operation-26.json` seq28 cookie_get 无引用）。

**期望 C —— 退出后的 Session 访问受保护接口返回 401（携带真实凭据、可区分）—— 满足**
- 退出后把退出前固化的同一会话 Cookie（引用 `credential-8fe32e…`）重新设置到浏览器（`operation-30.json` seq30，`source: restore-input`），再访问 `GET /api/me => 401 Unauthorized`（`operation-34.json` seq36；页面 `page-2026-09-22T12-13-23-522Z.yml`；控制台 `console-2026-09-22T12-13-23-488Z.log` 记录 401）。
- 可区分性由请求头证据支持：该 `GET /api/me` 的 request-headers 明确包含 `cookie` 头，其引用与退出前会话同值（`operation-35.json` seq37，`source: observed-request-header`，引用 `credential-8fe32e…`），说明是「携带真实旧凭据被重放仍 401」，而非「未携带凭据的未认证 401」。`GET /api/auth/status` 同请求下返回 `authenticated:false`（`operation-31.json` seq33）。

**期望 D —— 删除账号后旧 Session 与原凭据均不可用 —— 满足**
- 重新登录：清 Cookie 回到登录表单后用原凭据登录成功，`POST /api/auth/login => 200`（`operation-42.json` seq44、`operation-44.json` seq46），新 `cynos_session`（`credential-9915f48a86c31679c406072a3ea41397`，`operation-45.json` seq47）。删除前真实受保护请求 `GET /api/me => 200 OK`（`operation-49.json` seq51、`operation-51.json` seq51），request-headers 携带该新会话 Cookie（`operation-52.json` seq52）。
- 删除前读取真实 Cookie（`operation-54.json` seq56）并截图 `auth-login-001-05-before-delete.png`。
- 删除：`DELETE /api/me => 200 OK`（`operation-58.json` seq60）；页面回到登录态并显示提示「测试账号及其会话已删除。」（`operation-57.json` seq59；`page-2026-09-22T12-13-44-443Z.yml`；截图 `auth-login-001-06-after-delete.png`）；Cookie 已清除（`operation-59.json` seq61）。
- 删除后核验旧 Session：重新设置删除前固化的会话 Cookie（引用 `credential-9915…`，`operation-61.json` seq63），`GET /api/me => 401 Unauthorized`（`operation-63.json` seq65），request-headers 明确携带该 Cookie（`operation-64.json` seq66，`source: observed-request-header`），响应体 `UNAUTHORIZED / 请先登录`（`operation-65.json` seq67）；控制台 `console-2026-09-22T12-13-49-234Z.log` 记录 401。
- 删除后核验原凭据：清 Cookie 后用原邮箱与口令登录，`POST /api/auth/login => 401`（`operation-73.json` seq75），响应体 `INVALID_CREDENTIALS / 邮箱或密码不正确`（`operation-75.json` seq77），页面 `role=alert` 显示「邮箱或密码不正确」（`operation-72.json` seq74；`page-2026-09-22T12-13-59-527Z.yml`；截图 `auth-login-001-07-after-delete-relogin-rejected.png`，该图保留真实已填写表单，未清空）；控制台 `console-2026-09-22T12-13-55-219Z.log` 记录 login 401。

**「需要记录」项**
- 登录/刷新后用户资料、退出后 HTTP 状态（logout 200 / me 401）、Cookie `httpOnly: true` 与 `sameSite: Strict`（登录后、刷新后、删除前三次读取：`operation-15/22/45/54.json`）、删除提示、删除后旧 Session（401）与原凭据登录结果（401 INVALID_CREDENTIALS）均有实际观察支持。
- 截图覆盖 `auth-login-001-01…07` 七个现场，均为真实页面状态；退出态截图 `04` 显示「已安全退出。」、删除态 `06` 显示「测试账号及其会话已删除。」、重试被拒截图 `07` 显示错误提示——与快照一致，未见为改善外观而清空/覆盖表单或切换状态的迹象。

四项适用期望与「需要记录」项均有实际观察支持，且未发现违反期望的行为，故本场景独立判为 `passed`。

## 三、已确认产品问题

无。本次未发现与场景期望不符的产品缺陷；退出后旧 Session 重放 401、删除后旧 Session 与原凭据均失效、Cookie 属性符合 `HttpOnly`/`SameSite=Strict` 等行为均被实际观察支持。

## 四、执行记录问题（不影响产品结论）

1. **证据引用编号轻微不精确**：`execution.md` 期望 C 段把 `/api/me` 401 的 request-headers 证据引作 operation-33/34，实际携带 cookie 头的请求头证据为 `operation-35.json`（seq37）。核对该段所依赖的全部原始证据均存在且支持结论，属引用编号的文档精度问题，不改变判定。
2. **辅助侦察失败已被正确排除**：`command-1.json`（`curl` 被命令白名单拒绝）、`command-2.json`（`node tests/e2e/smoke.ts` 因缺 `dist/server/main.js` 构建产物 exit 1，`MODULE_NOT_FOUND`）均未计入正式场景，`execution.md` 亦如实标注其不计入正式场景、目标可达性改由浏览器实际访问确认。该处理合理，但这两次失败说明 CLI 侧不可用于验证目标服务，本 Run 的目标服务仅经浏览器侧证据确认。

## 五、覆盖缺口与限制

- base→target 无源码变化（仅 spec 文档澄清 + 历史报告），结论只对固定 target 整体成立，不能归因到具体代码差异。
- 本场景未覆盖（计划明确排除，且不在授权范围）：draft/未授权场景 AUTH-LOGIN-002、AUTH-REGISTRATION-001/002，以及重复邮箱 409、弱密码/无效邮箱 400、Origin 403、限流 429、7 天 Session 有效期等边界；本审核结论不扩展到这些范围。
- 受影响但不改变结论的一点：`email` 字段在 API 响应体中均被 Harness 脱敏，逐字一致性依赖页面截图（02 与 03 同一 sha256）与 `id`/`displayName`/`createdAt` 的响应体一致性共同支撑，而非响应体逐字比较。
- 测试后 Run 级临时数据清理由 Harness 收尾，不属于本次审核；场景内测试账号已按业务步骤删除（`DELETE /api/me => 200`）。

## 六、汇总

- 计划 `## execution_scenarios` 的 1 个场景：`AUTH-LOGIN-001` = **passed**。
- 已确认产品 Bug：0。
- 阻塞项：0（无适用期望未确认，无必要证据缺失，无关键覆盖遗漏未消解）。
- 场景资产维护：无 patch、无新增/修改/rename/deprecated，与计划一致。
- 清理：场景内删除已完成；Run 级清理由 Harness 收尾，不影响本审核结论。
- 声明归属：上述产品行为判断中，执行与记录由 Runner/MCP 操作产生，结论由本 Reviewer 依据原始证据独立作出；本次无人工复核。
