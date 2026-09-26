# 审核报告：已批准登录与注册场景（Run 01M3E20CPNZ88WHADECPSQEG34）

- 固定 target：`0defd30be3761c7ad8ba66bfd96d65737f54245b`（base `f287add3d4054491f2ed5714cbb044a38a133f50`）
- 计划：`plan.md`（planHash `cf08cb92c5f8ffb04a91c8bd6d068da0e447ce1a0acc009120c7e34ae545227c`）。经 `query_source_reads(scope="plan")` 核对，返回 planHash 与计划开头 Harness 元数据一致；计划引用的场景正文 `AUTH-LOGIN-001.md`（contentHash `6f60babb…`）、`AUTH-REGISTRATION-001.md`（contentHash `4a339eb5…`）与该 Run `selectedScenarioSnapshot` 冻结正文的 contentSha256 逐一对应，且冻结正文 `redacted: false`。计划中「不新增/不修改/不废弃场景」的维护声明与 `scenarioChanges = null`（无 `scenario-changes.patch`，已确认该工件不存在）一致。
- `browserRequired = true`，动态上下文 `blockingReasons` 为空。本 Run 确有实际浏览器执行依据（下面引用的 playwright-mcp 操作回执与浏览器截图/快照），故声明与执行相符，不属「仅有快照却宣称执行」的情形。
- 执行集合严格取自计划唯一 `## execution_scenarios`：`AUTH-LOGIN-001` → `AUTH-REGISTRATION-001`，二者均在 `scenario-progress` 中按序 `start_scenario`/`finish_scenario` 声明。

审核方法：先在受控工具中读取计划与冻结正文，再逐一读取本 Run 的原始命令/浏览器证据（含 16 张截图全部经 `read_evidence_image` 实读）并形成独立判断，最后才打开 `execution.md` 对照。以下结论除注明外均为 Reviewer 依据原始记录的独立判断，不沿用 Runner 的判定用语。

---

## 一、逐场景结果

### AUTH-LOGIN-001 登录状态恢复 — passed

冻结正文 4 项适用期望逐项独立核对：

| 期望 | Reviewer 判断 | 依据（本 Run 原始记录） |
| --- | --- | --- |
| 刷新后显示同一用户 | 确认 | operation-34.json（登录后快照「你好，…loginui」+ 邮箱）/ operation-37.json（重导航）/ operation-38.json（同一用户，邮箱一致）；截图 `login-001-run-account-logged-in.png` 与 `login-001-run-after-refresh.png`（两张 sha256 相同 `61c62084…`，画面均为同一登录态欢迎页） |
| 退出后页面回到登录状态 | 确认 | operation-40.json（点击退出）/ operation-41.json（登录表单 +「已安全退出。」）；截图 `login-001-run-after-logout.png` 实读为登录表单且含「已安全退出。」提示条 |
| 退出后 Session 访问受保护接口返回 401（须携带退出前会话重放） | 确认 | 退出前会话引用取自已观察 Cookie（operation-53.json，`credential-192adda…`，attributes 含 `httpOnly: true, sameSite: Strict`）→ operation-57.json 以 `source: "restore-input"` 恢复同一引用 → operation-58.json 导航 → operation-59.json 网络 `/api/me => [401]` → operation-60.json 请求头回执的 `credentialReferences` 为 `observed-request-header`、同一 `credential-192adda…`，且 `cookie: [REDACTED]` 确有发送。**该期望要求的「请求头确实携带该会话」已由请求头观察独立满足**，不是仅凭「未带 Cookie 的 401」。另见 console 日志 `console-2026-09-26T05-14-05-423Z.log` 记录 `/api/me` 401 |
| 删除账号后旧 Session 和原凭据均不可用 | 确认 | 旧会话：operation-57～60 的同一会话重放仍 401（如上）；删除：operation-54.json（点击「删除测试账号」）/ operation-55.json（登录态 +「测试账号及其会话已删除。」），截图 `login-001-run-after-delete.png` 实读一致；原凭据：operation-63.json 重填原邮箱/口令 → operation-64.json（`alert`「邮箱或密码不正确」）→ operation-66.json（`POST /api/auth/login => [401]`）→ operation-67.json 响应体 `INVALID_CREDENTIALS` → operation-68.json 请求体确为被删账户原邮箱与原口令（值已脱敏）。截图 `login-001-run-deleted-relogin-failed.png` 实读为「邮箱或密码不正确」告警 |

- 「需要记录」项均已具备：登录/刷新用户资料（operation-34/37）、退出后 HTTP 状态（operation-59 = 401）、Cookie 属性 `HttpOnly=true` / `SameSite=Strict`（operation-16/35/53；`secure:false` 属 HTTP 非生产环境，计划已明确不属期望项）、删除后提示与旧会话/原凭据结果（如上）。
- 计划关注的 open Issue #2（退出不撤销服务端 Session）与 Issue #1（删除账号未真正删除）在本次固定 target 上均**未复现**；此处仅作本次当次判定，不追改历史 Run、不关闭 Issue。
- 结论：4 项适用期望均有充分实际观察支持，**passed**。

### AUTH-REGISTRATION-001 新用户注册 — passed

| 期望 | Reviewer 判断 | 依据（本 Run 原始记录） |
| --- | --- | --- |
| 页面显示欢迎信息 | 确认 | operation-74.json（切换注册表单）/ operation-75.json（昵称/邮箱/密码字段出现）/ operation-77.json（填入三字段）/ operation-80.json（提交后欢迎视图「你好，…reg」+ 邮箱 `…-reg@example.test`）；截图 `reg-001-register-form.png`、`reg-001-form-filled.png`（实读为已填昵称/邮箱/密码）、`reg-001-welcome.png`（实读为欢迎视图） |
| `GET /api/auth/status` 返回已登录用户 | 确认 | operation-83.json（网络列表含 `POST /api/auth/register => [201]`，op-85 响应体 `authenticated:true` + 用户对象）；operation-86.json 导航后 operation-87.json 页面正文即 status 载荷 `{"authenticated":true,"user":{id/email/displayName/createdAt}}`；截图 `reg-001-auth-status.png` 实读为该 JSON（`authenticated:true`，邮箱 `…-reg@example.test`，`createdAt "2026-09-26T05:14:45.911Z"`）。注：该导航回执的 arguments 为空，未直接记录 URL；判定基于响应载荷与截图内容，非仅凭文件名 |
| 数据库不保存明文密码（持久层） | 确认（受限范围） | operation-88.json（`source: "controlled-test-account-storage"`）：`accounts=2`、`argon2id=2`、`other=0`，满足计划预先约定的判定条件（accounts ≥ 1、argon2id = accounts、other = 0）。**独立旁证（Reviewer 推断）**：查询发生在 05:14:57，此时库中除本 Run 的 `-login`/`-reg` 两个标记账户外，还存在此前登录成功的预设账户（「v061 dedicated synthetic seed」），若该聚合统计全库账户则计数应 ≥3，实测 2 与「仅统计本 Run 标记账户」的声明相容。该聚合仍只覆盖运行应用数据库中本 Run 标记账户的口令列格式，不覆盖其他行/位置/生产库，不构成「全库/生产无明文」的绝对结论 |
| 删除后可删除账号，原邮箱密码随后不能再登录 | 确认 | operation-91.json（点击「删除测试账号」）/ operation-92.json（登录态 +「测试账号及其会话已删除。」），截图 `reg-001-after-delete.png` 实读一致；operation-95.json 重填原邮箱/口令 → operation-96.json（`alert`「邮箱或密码不正确」）→ operation-98.json（`POST /api/auth/login => [401]`）→ operation-99.json 请求体确为被删账户原邮箱与原口令（脱敏）；截图 `reg-001-deleted-relogin-failed.png` 实读一致 |

- 「需要记录」项均已具备，并额外补齐了计划要求的持久层聚合结果及其受限范围说明。
- 结论：4 项适用期望均有支持，其中期望 3 按计划预先约定的受限口径成立，**passed**（保留下述受限范围，不扩大为绝对结论）。

---

## 二、已确认产品问题

**无。** 本次两场景的全部适用期望均与实际观察一致，未发现产品缺陷；`AUTH-LOGIN-001` 对应的两条 open Issue（#1 删除账号未真正删除、#2 退出不撤销服务端 Session）在本次固定 target 上未复现。由于本批 base→target 无认证业务代码变化（仅有 `src/server/test-data-cleanup.ts` 只读聚合路由、其测试与文档），本结论只说明当前 target 既有场景行为，不代表项目整体无问题，也不据此关闭 Issue。

---

## 三、对 Runner 报告的核对（报告符合实际，个别引用索引轻微不精确）

- 结果清单与顺序（`AUTH-LOGIN-001` → `AUTH-REGISTRATION-001`，均 passed）与原始证据一致，未见把未验证项写作通过、或把通过写作未验证的情况。
- 关键断言经独立复核成立：退出后重放 401 的请求头确实携带退出前会话（operation-60 的 `observed-request-header` 引用与恢复引用同一）；删除后原凭据登录 401（请求体确为被删账户）；期望 3 的受限范围已被 Runner 明确写出，未拔高为绝对结论。
- 轻微不精确（不影响结论）：`execution.md` 少数证据引用索引有 ±1 偏移，例如把注册后的 status JSON 记为 `operation-86.json`（实际内容在 `operation-87.json`）、把注册场景登录请求体记为 `operation-97.json`（实际在 `operation-99.json`）。按 operation-N 对应 sequence N+1 的规律，其引用与内容基本可对上，属引用编号不严谨，不改变任何验证结果。此类记录问题与产品结果分别表达：**产品结论不变**。
- Runner 主动披露两项偏差（先用预设账户跑一遍、再改用 Run 前缀账户重复并以其证据判定；持久层以等价的受控只读聚合替代 target 新增 storage 路由），与原始操作序列（operation-7～22 为预设账户过程、operation-24 起为 Run 账户过程）吻合，披露属实。

---

## 四、覆盖缺口与无法确认事项（如实保留）

1. **持久层期望的覆盖边界**：`operation-88.json` 仅覆盖运行应用数据库中本 Run 标记账户（查询时 2 个）的口令列格式，不覆盖其他行、其他位置或生产库；该观察也不能替代登录验证或被删账号的后续清理核验。聚合工具 `inspect_test_account_storage` 的具体实现未在本 Run 展开，其「仅统计本 Run 标记账户」的口径依赖受控来源声明（Reviewer 只能给出上述相容性旁证，不能独立复算）。
2. **登录场景的预设账户来源**：`AUTH-LOGIN-001` 首轮使用预设账户「v061 dedicated synthetic seed」（operation-10 快照），其创建来源不在本 Run 记录内；该次仅用于首轮流程，判定证据已改由 Run 前缀账户（`-loginui`）承载。预设账户在场景内未被删除，属非本 Run 创建数据。
3. **注册密码长度**：`reg-001-form-filled.png` 中密码字段为掩码，无法从截图精确核对 ≥12 字符，仅能由注册成功（201）间接支持；冻结场景 `## 期望` 未单列该断言，故不影响判定。
4. **未执行范围**：draft 场景 `AUTH-LOGIN-002`、`AUTH-REGISTRATION-002`、`AUTH-ORIGIN-001` 不在执行集，本 Run 不作判定；run-scoped 查删/聚合接口契约（默认关闭、鉴权拒绝、范围精确、级联、幂等、其他 Run 保留）未在本 Run 独立验证，本 Run 仅将该只读聚合用作期望 3 的观察手段。`DELETE /api/me` 是否以数据库级联清除 `auth_sessions` 未作静态确认，仅由运行观察（旧会话重放 401）判定。
5. **一次工具拒绝**：`command-1.json` 记录内联解释器命令被拒（`COMMAND_NOT_ALLOWED`），与业务结果无关，未绕过边界。
6. **时间**：应用侧时间（注册 `createdAt`、响应头）与 Harness 证据时间分属不同来源、无可比校准时钟，本报告未作跨来源精确时间断言。
7. **人工复核缺位**：本流程全部为模型执行与审核，无人工复核记录。

---

## 五、总体结论

- `AUTH-LOGIN-001`：**passed**（4/4 适用期望经本 Run 浏览器与网络原始证据独立确认）。
- `AUTH-REGISTRATION-001`：**passed**（4/4 适用期望确认；期望 3 按计划预先约定的受限持久层口径成立）。
- 已确认产品缺陷：**无**；覆盖缺口与受限范围见第四节。
- 测试数据清理由 Harness 在最终 Main 后处理，不属本次审核结论（Runner 仅登记未声明完成，符合计划）。最终 Main 可直接依据本报告与 `plan.md` 整理，无需回读运行记录。
