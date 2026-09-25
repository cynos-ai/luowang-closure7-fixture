---
run_id: 01M3C8S9ZFZ6YGRGGVGRH2XRRQ
trigger: manual
base_commit: 751b75095fd2faf9f37136f35eaaacda368770f9
target_commit: 4f870803f4a741af2966f43c7a4b30bda9e6790d
included_commits: []
result: passed
started_at: 2026-09-25T12:31:34.478Z
finished_at: 2026-09-25T12:37:13.107Z
scenario_results:
  - id: AUTH-LOGIN-001
    result: passed
  - id: AUTH-REGISTRATION-001
    result: passed
confirmed_bugs: []
---

# 最终报告：Cynos Website 已有场景非生产回归（Run 01M3C8S9ZFZ6YGRGGVGRH2XRRQ）

本报告汇总本 Run 的计划与独立审核，不重复执行测试、不重做证据审核。结论来源区分：Runner 的执行记录（`execution.md`）、Reviewer 的独立审核（`review.md`）与本报告作者的整理，均如实标注。

## 1. 范围与固定版本

- 请求（manual 触发）：对当前 `scenario-testing` 固定提交执行**已有场景**的非生产回归；仅使用合成数据，所有新数据以本 Run ID 标记，结束时验证清理。
- `base_commit = 751b75095fd2faf9f37136f35eaaacda368770f9`，`target_commit = 4f870803f4a741af2966f43c7a4b30bda9e6790d`，`included_commits = []`。
- `scenarioMode = autonomous`，`initialization = false`，`scenarioChanges = null`；本 Run 无场景 patch（`scenario-changes.patch` 不存在，与计划“不新增、不修改、不废弃”一致；Reviewer 独立读取该工件亦返回“不存在”）。
- 正式执行集合取自计划唯一的 `## execution_scenarios`，顺序即执行顺序：`AUTH-LOGIN-001` → `AUTH-REGISTRATION-001`。本批不存在“零执行场景”情形，清单非空且两项均已执行。
- 按计划：base↔target 变化清单共 2 项，全部为 `docs/scenario-testing/reports/01M3B9TQ1D6MKEJ0Z96QXBRPAE/` 下新增的测试报告工件，无产品源码变化。计划据此仍按请求对现有 approved 场景做全量回归；该 diff 结论来自计划侧读取回执，Reviewer 依角色边界未读仓库，采信计划回执并限定结论范围。

## 2. 逐场景结果

| 场景（按计划顺序） | 最终结果 | 依据来源 |
| --- | --- | --- |
| AUTH-LOGIN-001 登录状态恢复 | passed | Reviewer 独立判定；4 项适用期望均有实际运行观察 |
| AUTH-REGISTRATION-001 新用户注册 | passed | Reviewer 独立判定；4 项适用期望均有运行观察 |

计划与审核在结果上一致，无聚合冲突；`blockingReasons` 为空，Reviewer 报告未出现“同场景原文期望未验证且无原文条件不适用/明确授权排除依据”的情形，故不触发 blocked 覆盖规则。

### AUTH-LOGIN-001（passed）

Reviewer 对照原始证据逐项判定（依据归 Reviewer）：

1. 刷新后显示同一用户 —— 满足。`operation-19`（重载）、`operation-20`（快照欢迎态，与 `operation-16` 登录后为同一用户同一邮箱）。截图 `auth-login-001-after-reload.png`（与 `auth-login-001-after-register.png` 同一 sha256 `e70e419f1e7a3ce8df85608617b4976816ae5512302fadee71ffbc6abdde4960`）。
2. 退出后页面回到登录状态 —— 满足。`operation-24`（点击“退出登录”）、`operation-25`（快照为登录表单 + “已安全退出。”）、`operation-26`（网络列表 `POST /api/auth/logout => 200`）。截图 `auth-login-001-after-logout.png`。
3. 退出后的 Session 访问受保护接口返回 401 —— 满足（非平凡）。退出前 `operation-18` 取得会话引用 `credential-ea7376ff…`（`httpOnly: true, sameSite: Strict, path: /`）→ `operation-29` 恢复 → `operation-30` 导航 → `operation-31` `GET /api/me => 401` → `operation-32` 该请求请求头 cookie 引用同为 `credential-ea7376ff…`（`x-request-id: req-zx`）→ `operation-33` 响应体 `UNAUTHORIZED/请先登录`，requestId 一致；`page-2026-09-25T12-33-10-327Z.yml` 与 `console-2026-09-25T12-33-10-290Z.log` 互证。Reviewer 明确该 401 系**携带退出前会话**取得，不属“未带 Cookie 的 401”。
4. 删除测试账号后旧 Session 和原凭据均不可用 —— 满足。旧会话：`operation-39` 取得引用 `credential-acb5e1d4…` → `operation-44` 恢复 → `operation-46` `GET /api/me => 401`，其请求头引用亦为 `credential-acb5e1d4…`（`x-request-id: req-107`，`page-2026-09-25T12-33-31-040Z.yml`、`console-2026-09-25T12-33-31-011Z.log` 互证）。原凭据：`operation-49/50` 用同邮箱同口令再登录 → `operation-51` `POST /api/auth/login => 401` → `operation-52` 页面“邮箱或密码不正确”，截图 `auth-login-001-relogin-after-delete.png`。删除动作：`operation-40`、`operation-41`（提示“测试账号及其会话已删除。”）、`operation-42`（`DELETE /api/me => 200`），截图 `auth-login-001-after-delete.png`。

“需要记录”项（登录/刷新后资料、退出后 HTTP 状态、Cookie `HttpOnly`/`SameSite=Strict`、删除后提示与旧会话及原凭据结果）均已交付。`secure:false` 系 HTTP 非生产环境，期望未要求，Reviewer 已说明。

### AUTH-REGISTRATION-001（passed）

1. 页面显示欢迎信息 —— 满足。`operation-61/62`（填写并提交）、`operation-63`（`POST /api/auth/register => 201 Created`）、`operation-64`（快照欢迎态）、`operation-65`（响应体 `authenticated:true` + 用户 id）；截图 `auth-registration-001-welcome.png`。
2. `GET /api/auth/status` 返回已登录用户 —— 满足。`operation-67`（重载）→ `operation-68`（`GET /api/auth/status => 200`）→ `operation-69`（响应体含同一 user id）；`operation-71`（快照欢迎态）。
3. 数据库不保存明文密码 —— **在本 Run 标记账户范围内**满足。`operation-70`（受控只读聚合，注册后、删除前）记录 `accounts: 2, argon2id: 2, other: 0`，覆盖本 Run 两个标记账户。Reviewer 采信其为“本 Run 标记账户口令列为 Argon2id 摘要、无明文”，并明确该结论不覆盖其他行、其他位置或生产库，不构成“全库无明文”结论。
4. 验证完成后可从欢迎页删除测试账号、原邮箱密码随后不能再登录 —— 满足。`operation-72`（点击删除）→ `operation-73`（`DELETE /api/me => 200`）→ `operation-74`（提示“测试账号及其会话已删除。”、回到登录态，截图 `auth-registration-001-after-delete.png`）；`operation-76/77` 用原邮箱原口令登录 → `operation-78`（`POST /api/auth/login => 401`）→ `operation-79`（“邮箱或密码不正确”，截图 `auth-registration-001-relogin-after-delete.png`）。

## 3. 已确认产品 Bug 与 Issue 决策

**本 Run 已确认产品 Bug：0 个。** Reviewer 独立审核结论为两大场景均 passed、无已确认产品 Bug；Runner 亦未登记产品级失败。因此 `confirmed_bugs` 为空，无 `create`/`link` 决策，本 Run 不产生也不关联任何 Issue。

对计划的已知 open Issue 的回归结果（Reviewer 判定，归 Reviewer）：

- Issue #2「退出登录接口不撤销服务端 Session」对应 AUTH-LOGIN-001 期望 3（退出后会话访问受保护接口 401）：本 Run、本 target 上**未复现**。
- Issue #1「删除账号接口返回成功但未删除账号与会话」对应 AUTH-LOGIN-001 期望 4（删除后旧会话与原凭据不可用）：本 Run、本 target 上**未复现**。

两项“未复现”均为 Reviewer 依据上述运行证据的当次观察，非 Runner 交付的结论，也不代表缺陷不存在或已修复；结论仅限本 Run 与固定 target。Runner 在 `execution.md` 中亦写明同方向的限定表述。两条 Issue 均为 open 状态、且指向与本次相同的登录/删除行为，后续 Run 若复现同类失败，应关联既有 Issue 而非新建。

> 说明：上述“未复现”不等于把两条 open Issue 判定为已关闭或无效；本报告不修改任何 Issue 状态，也不声明跨 Run 无重复。

## 4. Issue 查询覆盖情况

对本次两个 Bug 候选做了受限候选查询：以计划列出的两条 open Issue 标题作为候选依据（Bug key 为 Issue #1 / #2 的场景期望，本 Run 无 Runner 分配的 bug key），两次查询均返回 `ok` 并各自命中 1 条 open Issue（见 §3，含候选地址）。另以场景 ID 与通用关键词查询（`AUTH-LOGIN-001`、`AUTH-REGISTRATION-001`、登录状态恢复、新用户注册等）返回 `empty`。

由于本次已确认产品 Bug 为 0 个，查询结果未用于任何 create/link 决策；不存在查询 `unavailable` 的情形，故本报告不设“Issue 查询覆盖缺口”章节。该查询仅表明在受控候选集中未发现与本 Run 新增失败对应的 Issue，不构成对全量 Issue 库的绝对覆盖声明。

## 5. 未完成事项、限制与未决问题

### 5.1 无法判定的异常（Reviewer §5.1，未定性）

首次浏览器登录返回 401（`operation-7/9/11`，`console-2026-09-25T12-32-35-249Z.log` 记录该 `POST /api/auth/login => 401`）。Runner 在 `execution.md` 中将其解释为“受控浏览器工具不替换口令占位符，直接输入字面量导致 401”，并据此改用 UI 注册新账号完成登录流程，声明 HTTP 建立的 `...-login@example.com` 未用于浏览器登录。

Reviewer 指出该因果说明是 Runner 的**推断**，无法独立复核：`browser_fill_form` 回执对填写值一律脱敏为 `[REDACTED]` 并给出 `valueReference`，故无法从捕获工件判断当时提交的是占位符字面量还是凭据值；两种解释均无法排除。Reviewer 明确该现象**未定性、不构成产品 Bug 确认**，且不属场景任何明列期望，不影响期望 1–4 的判定。遗留的未决部分：**“用经 `POST /api/auth/register` 建立的账号进行浏览器登录”这条路径在本 Run 既未确认成功、也未确认失败**；如后续需要覆盖，应另行确认授权后验证。

### 5.2 记录表述超出捕获证据（Reviewer §5.2）

`execution.md` 称“退出后 `browser_cookie_list` 为空（operation-28），Cookie 已被清理”。Reviewer 指出 `operation-28` 的输出在回执中为 `[Output omitted; …]`，该“为空”结论**无法由捕获证据复核**；退出导致 Cookie 清理仅能由 `operation-25`（回到登录态）与 `operation-26`（logout 200）间接支持，“列表为空”本身应标注为未复核。不影响期望 2 的判定。Reviewer 对 `execution.md` 中“请求头确实携带 cookie”的表述经对照 `operation-23/32/46` 的 `observed-request-header` 引用后认为成立，此处无问题。

### 5.3 记录卫生问题（Reviewer §5.3）

`execution.md` 在描述退出前/删除前会话时写入了会话 Cookie 值的短字面片段，而非仅使用 Harness 引用 ID（`credential-ea7376ff…`、`credential-acb5e1d4…`）。Reviewer 未重复其内容，建议后续一律以引用 ID 代替任何凭据值片段。本报告不复述该片段。Reviewer 未发现口令明文或完整 Token 落盘（`execution.md` 仅写“自选合成口令”“≥12 字符”）。该问题不影响测试结论。

### 5.4 记录元数据瑕疵（Reviewer §5.4）

`operation-55` 为 `finish_scenario`，`completed: ["AUTH-LOGIN-001"]`，但 `scenarioId` 标为 `AUTH-REGISTRATION-001`；`operation-56` 才是 `start_scenario: AUTH-REGISTRATION-001`。按事件内容与 `operation-81` 最终 `completed: ["AUTH-LOGIN-001","AUTH-REGISTRATION-001"]` 判断，实际执行顺序与计划一致；`execution.md` 中“无事后补报顺序”的表述在此点上属记录元数据瑕疵，非执行事实错误。另有 `operation-54`（口令聚合）无 `scenarioId`、位于两场景之间，`execution.md` 已如实说明为跨场景辅助观察，Reviewer 认可；注册场景期望 3 的对应证据是注册后的 `operation-70`。

### 5.5 覆盖面缺口（计划已声明，Reviewer 复核一致）

1. **无产品 diff**：base↔target 仅新增测试报告工件；回归结论只说明当前 target 的既有场景行为，不代表项目整体无问题。
2. **持久层级联未静态确认**：`DELETE /api/me` 是否级联清除 `auth_sessions` 未读迁移/PRAGMA 定义，本 Run 仅以运行观察（删除后旧会话 401）判定；Reviewer 依角色边界未读源码，不补做静态结论。
3. **口令不落明文的覆盖面**：受控只读聚合仅覆盖本 Run 标记账户的口令列格式（`operation-70`），不含其他行、其他位置或生产库；不构成“不存在任何明文口令”的绝对结论。
4. **draft 场景未执行**：`AUTH-LOGIN-002`、`AUTH-REGISTRATION-002`、`AUTH-ORIGIN-001` 不在执行集，本 Run 未对其作通过/失败判断；其升级需另行确认条件。
5. **run-scoped 查删/聚合接口契约**（默认关闭、鉴权拒绝、范围精确、级联、幂等、其他 Run 保留）本批未独立执行，属计划声明范围外。
6. **历史有限**：计划记载可查历史 2 条旧 Run（target `751b750…` passed、`7062f9a…` blocked），与本 Run target 不同，未沿用其结论。
7. **人工复核缺位**：本流程全部为模型角色执行与审核，**无人工复核记录**；报告中“截图视觉确认”均为模型读图结果，不等于人工复核。

### 5.6 时间表述（Reviewer §6）

应用侧时间（响应头 `date`、注册响应 `createdAt`）与 Harness 证据上载时间同处 2026-09-25T12:32–12:35Z 区间且次序自洽；console 日志的相对毫秒以各自页面会话起点为原点，可与对应操作时刻对齐（如 12:32:35 起点 +7645ms ≈ 12:32:43 的登录提交）。两者无共同校准时钟，故 Reviewer 不给出跨来源的精确事件时间断言，本报告不补算绝对事件时间。

## 6. 证据与记录可用性

- 本 Run 证据文件（截图 8 张、console 日志 5 个、`operation-*.json` 81 条、`page-*.yml` 19 个）已落盘，Reviewer 依其完成了独立判定；证据 URL 与稳定引用见图上下文及 Reviewer 报告。
- 会话撤销/删除类关键断言使用了非平凡的会话重放（携带退出前/删除前会话并核对请求头引用），Reviewer 判定成立。
- 存在但**缺少实际操作归属记录**的部分（如 §5.2 的 `browser_cookie_list` 输出被省略）以 Reviewer 的“未复核”表述为准，不改为“证据为空”。

## 7. 数据与清理状态

- 计划登记：3 条 Run 标记账户（`...-login` 仍存在；`...-loginui`、`...-reg` 已在场景内通过 `DELETE /api/me` 删除并验证）。
- 场景内 `DELETE /api/me` 是场景期望 4 的**业务操作**，不作为测试数据清理完成的依据；Runner 亦如此表述。
- 测试数据最终清理由 Harness 在本 Session 结束后统一核验并处理，**本报告不声称清理已完成**，也不填写系统收尾区。`blockingReasons` 为空。

## 8. 结论与必要下一步

- 在固定 target `4f870803f4a741af2966f43c7a4b30bda9e6790d` 上，两个 approved 场景 `AUTH-LOGIN-001`、`AUTH-REGISTRATION-001` 的全部适用期望均获实际观察支持，结果为 **passed**；未发现产品级失败，无已确认产品 Bug。
- 与两条 open Issue 对应的期望（退出后会话撤销、删除账号后旧会话与原凭据失效）在本 Run 未复现；该结论限定本 Run 与固定 target，不表示缺陷不存在或已修复，也不关闭既有 Issue。
- 当前授权范围内的必要下一步：
  1. 由 Harness 在 Session 结束后完成 Run 标记数据的统一清理核验；
  2. §5.2/§5.3/§5.4 的记录表述与卫生问题应由原 writer 在同一 Session 内回写修正（Cookie 列表“为空”改为未复核、凭据片段替换为引用 ID、补充进度事件 `scenarioId` 标注异常说明）——本报告已如实保留，不改变任何测试结论；
  3. §5.1 的“经 HTTP 注册账号再做浏览器登录”路径未验证，如需覆盖需另行确认授权与环境条件，不得视为现有权限内的替代方案；
  4. Reviewer 建议中的场景资产维护事项（draft 场景升级、run-scoped 接口契约）不属本次请求范围，如需推进应另行确认。

<!-- luowang-screenshot-inspection -->
## 截图采集标签

- [截图 1](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL211bHRpLXByb2plY3QtdjA2MS1saXZlLTRkNDIwODQwL3Byb2plY3RzLzRiMWNiODljLTUzOWMtNGIxZC1hMTk3LTY4ODM4OWU4MDhjOC9ydW5zLzAxTTNDOFM5WkZaNllHUkdHVkdSSDJYUlJRL2F1dGgtbG9naW4tMDAxLWFmdGVyLWRlbGV0ZS5wbmc>)：页面含可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 2](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL211bHRpLXByb2plY3QtdjA2MS1saXZlLTRkNDIwODQwL3Byb2plY3RzLzRiMWNiODljLTUzOWMtNGIxZC1hMTk3LTY4ODM4OWU4MDhjOC9ydW5zLzAxTTNDOFM5WkZaNllHUkdHVkdSSDJYUlJRL2F1dGgtbG9naW4tMDAxLWFmdGVyLWxvZ291dC5wbmc>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 3](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL211bHRpLXByb2plY3QtdjA2MS1saXZlLTRkNDIwODQwL3Byb2plY3RzLzRiMWNiODljLTUzOWMtNGIxZC1hMTk3LTY4ODM4OWU4MDhjOC9ydW5zLzAxTTNDOFM5WkZaNllHUkdHVkdSSDJYUlJRL2F1dGgtbG9naW4tMDAxLWFmdGVyLXJlZ2lzdGVyLnBuZw>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 4](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL211bHRpLXByb2plY3QtdjA2MS1saXZlLTRkNDIwODQwL3Byb2plY3RzLzRiMWNiODljLTUzOWMtNGIxZC1hMTk3LTY4ODM4OWU4MDhjOC9ydW5zLzAxTTNDOFM5WkZaNllHUkdHVkdSSDJYUlJRL2F1dGgtbG9naW4tMDAxLWFmdGVyLXJlbG9hZC5wbmc>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 5](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL211bHRpLXByb2plY3QtdjA2MS1saXZlLTRkNDIwODQwL3Byb2plY3RzLzRiMWNiODljLTUzOWMtNGIxZC1hMTk3LTY4ODM4OWU4MDhjOC9ydW5zLzAxTTNDOFM5WkZaNllHUkdHVkdSSDJYUlJRL2F1dGgtbG9naW4tMDAxLXJlbG9naW4tYWZ0ZXItZGVsZXRlLnBuZw>)：页面含可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 6](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL211bHRpLXByb2plY3QtdjA2MS1saXZlLTRkNDIwODQwL3Byb2plY3RzLzRiMWNiODljLTUzOWMtNGIxZC1hMTk3LTY4ODM4OWU4MDhjOC9ydW5zLzAxTTNDOFM5WkZaNllHUkdHVkdSSDJYUlJRL2F1dGgtcmVnaXN0cmF0aW9uLTAwMS1hZnRlci1kZWxldGUucG5n>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 7](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL211bHRpLXByb2plY3QtdjA2MS1saXZlLTRkNDIwODQwL3Byb2plY3RzLzRiMWNiODljLTUzOWMtNGIxZC1hMTk3LTY4ODM4OWU4MDhjOC9ydW5zLzAxTTNDOFM5WkZaNllHUkdHVkdSSDJYUlJRL2F1dGgtcmVnaXN0cmF0aW9uLTAwMS1yZWxvZ2luLWFmdGVyLWRlbGV0ZS5wbmc>)：页面含可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 8](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL211bHRpLXByb2plY3QtdjA2MS1saXZlLTRkNDIwODQwL3Byb2plY3RzLzRiMWNiODljLTUzOWMtNGIxZC1hMTk3LTY4ODM4OWU4MDhjOC9ydW5zLzAxTTNDOFM5WkZaNllHUkdHVkdSSDJYUlJRL2F1dGgtcmVnaXN0cmF0aW9uLTAwMS13ZWxjb21lLnBuZw>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
<!-- /luowang-screenshot-inspection -->

## Harness 清理收尾

测试数据清理完成；不改变本次功能验证结果。

清理适配器已独立核验 3 项测试数据不存在

全部登记测试数据均已独立核验清理

独立核验：luowang-01M3C8S9ZFZ6YGRGGVGRH2XRRQ-login-account · run-scoped-http-cleanup · 2026-09-25T12:37:41.608Z · absent=true · sha256 98de1c60a654e5c7c03c4f5825f26527b805a26564cf4e41efe73baa01059582

独立核验：luowang-01M3C8S9ZFZ6YGRGGVGRH2XRRQ-loginui-account · run-scoped-http-cleanup · 2026-09-25T12:37:41.610Z · absent=true · sha256 98de1c60a654e5c7c03c4f5825f26527b805a26564cf4e41efe73baa01059582

独立核验：luowang-01M3C8S9ZFZ6YGRGGVGRH2XRRQ-reg-account · run-scoped-http-cleanup · 2026-09-25T12:37:41.611Z · absent=true · sha256 98de1c60a654e5c7c03c4f5825f26527b805a26564cf4e41efe73baa01059582
