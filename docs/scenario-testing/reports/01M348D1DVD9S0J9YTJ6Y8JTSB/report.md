---
run_id: 01M348D1DVD9S0J9YTJ6Y8JTSB
trigger: manual
base_commit: null
target_commit: 6405a45b6889ad92cf7cfbce12d8ec22b5040f23
included_commits: []
result: passed
started_at: 2026-09-22T09:51:08.037Z
finished_at: 2026-09-22T09:58:19.369Z
scenario_results:
  - id: AUTH-LOGIN-001
    result: passed
confirmed_bugs: []
---

# 最终报告：Closure 7 独立测试仓库初始化（Run `01M348D1DVD9S0J9YTJ6Y8JTSB`）

- 触发方式：`manual`；模式：`initialization = true`、`scenarioMode = autonomous`
- 固定 target：`6405a45b6889ad92cf7cfbce12d8ec22b5040f23`；`baseCommit = null`、`includedCommits = []`
- 最终结果：**passed**（`blockingReasons` 为空，聚合规则 `blocked > failed > passed` 下无阻塞、无失败）
- 来源说明：本报告整理本次 Run 的 `plan.md` 与 `review.md`；未重新执行测试、未回读运行记录重做审核。规划事实归规划 Session、侦察观察归侦察 Session、场景判定与独立证据核对归 Reviewer，本报告的汇总口径归最终 Main。

## 1. 范围

本次为首次初始化，按请求只复用 target 内已有 approved 场景 `AUTH-LOGIN-001`，**不新增、不修改、不 rename、不 deprecated 任何长期场景**。执行清单为 `plan.md` 的唯一 `## execution_scenarios`：`AUTH-LOGIN-001`（1 条），本报告 `scenario_results` 与该清单完整且有序一致。

计划登记的本轮未执行范围（不因本轮不执行而降级或删除）：

- `AUTH-LOGIN-002`（draft）、`AUTH-REGISTRATION-002`（draft）、`AUTH-REGISTRATION-001`（approved，本轮未授权）；
- 重复邮箱 409、弱密码/无效邮箱 400、Origin 403、限流 429、7 天 Session 有效期等边界。

命名说明：请求称「Closure 7 独立测试仓库」，仓库内项目理解文档自称「Cynos 用户中心 / Cynos Website」；规划阶段判定二者指同一固定 target，命名差异不影响验证范围，未做重命名操作。

## 2. 逐场景结果

### AUTH-LOGIN-001 登录状态恢复 —— passed

场景四项适用期望与「需要记录」项均有本 Run 实际浏览器操作与原始证据支持（Reviewer 独立核对，先读原始证据形成判断、后对照执行记录）：

- **期望 A（刷新后显示同一用户）**：登录后与整页刷新后均显示同一 displayName，登录态在整页重载后恢复；刷新为 `browser_navigate` 重载 `/`，返回新文档快照。
- **期望 B（退出后回到登录状态）**：退出后页面回到登录表单并显示提示「已安全退出。」，`POST /api/auth/logout => [200]`。
- **期望 C（退出后的原 Session 访问受保护接口返回 401）**：退出前读取并固化真实会话值，退出清 Cookie 后未重新登录、用原值恢复并重放 `GET /api/me`，请求头确实携带该凭据且响应为 `401`（`UNAUTHORIZED / 请先登录`）。Reviewer 明确将「携带同一真实凭据仍 401」与「未携带 Cookie 的未认证 401」区分开。
- **期望 D（删除后旧 Session 与原凭据均不可用）**：重新登录签发新会话；删除前固化真实凭据；`DELETE /api/me => [200]`，页面提示「测试账号及其会话已删除。」；删除后重放删除前凭据 → `401`（请求头携带 Cookie）；原邮箱 + 口令登录 → `POST /api/auth/login => [401]`，页面 `role="alert"` 显示「邮箱或密码不正确」，响应 `INVALID_CREDENTIALS`。
- **需要记录四项**：登录/刷新后用户资料、退出后 HTTP 状态（logout 200 / 后续 me 401）、Cookie 属性 `httpOnly: true` 与 `sameSite: Strict`（另 `secure: false`、`path: /`）、删除后提示、旧 Session 结果、原凭据登录结果，均已取得。

证据（稳定 URL，原样复用工具返回值）：

- 过程记录：`operation-64…108.json`（本次上传收据含 `operation-1…110.json` 与 `command-1.json`）
- 截图：`login-form-filled.png`、`after-login-welcome.png`、`after-refresh-same-user.png`、`after-logout-login-state.png`、`before-delete-welcome.png`、`after-delete-login-state.png`、`original-credentials-rejected.png`、`recon-authenticated-welcome.png`、`recon-deleted-account-login-rejected.png`（URL 形如 `/api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzQ4RDFEVkQ5UzBKOVlUSjZZOEpUU0IvPGFnZW50LWZpbGVuYW1lPmA`）
- 快照与日志：`page-2026-09-22T09-52-13-666Z.yml` 等页面快照；`console-2026-09-22T09-52-39-774Z.log`、`console-2026-09-22T09-52-56-094Z.log`、`console-2026-09-22T09-52-59-548Z.log`、`console-2026-09-22T09-55-07-611Z.log`、`console-2026-09-22T09-55-26-507Z.log`、`console-2026-09-22T09-55-29-498Z.log`

Reviewer 记录了三条「不影响结论」的偏差，原文保留如下：三张欢迎态截图 sha256 相同（Reviewer 指出字节相同本身不能区分「视觉一致」与「复用同一张图」，但期望 A 另有刷新后新文档快照的独立证据）；Harness 进度事件 `begin_scenario_execution`（序列 60）与 `finish_scenario`（序列 111）的 `scenarioId` 为 `null`、`scope=auxiliary`，只有 `start_scenario`（序列 61）直接携带场景 ID；本 Run 早期 `operation-1…59` 属侦察范围（含一次被拒的命令尝试），`execution.md` 的证据清单只列 `operation-63…109`，审核已核对上传收据覆盖全部文件。

执行等价性说明（Reviewer 记录）：步骤 2「刷新」以整页导航重载 `/` 实现、步骤 5 以「恢复原 Cookie 后导航 `/api/me`」实现，二者未降低断言强度，差别如实保留。

## 3. 场景资产处置

本 Run `scenarioChanges = null`，且 `scenario-changes.patch` 工件在本 Run **不存在**（本 Session 读取返回「工件不存在」），与计划「不产出 patch」的声明一致。**未做任何长期场景新增、修改、rename 或 deprecated**，也未提交任何 patch。`AUTH-LOGIN-002`/`AUTH-REGISTRATION-002`（draft）与 `AUTH-REGISTRATION-001` 的状态如实保留，不因本轮不执行而改动。计划判定现有场景集在本轮关注范围内无业务语义重复或缺失需要落地，本轮无需场景资产维护。

## 4. 已确认产品问题与 Issue 决策

- **已确认产品 Bug：无。** Reviewer 逐项核对后未观察到违反场景期望的产品行为；控制台日志仅记录被期望的 401 资源加载错误，无非预期错误。按聚合规则，`failed` 场景为空，故 `confirmed_bugs` 为空数组。
- 规划阶段曾记录的历史疑点「退出未撤销服务端会话」在本 target 本次观察中**未复现**；按来源归属，该结论为 Reviewer 依据本 Run 证据的判断，未被改写为 Runner 或前序角色的既有判定。
- **Issue 决策：本轮不创建、不关联任何 Issue**，与请求「证据不足时保持 blocked，不创建或关联 Issue」及本次无已确认 Bug 的事实一致。
- 查询记录：本 Session 曾以场景/主题关键词（`AUTH-LOGIN-001`、登录状态恢复、退出撤销会话；以及 `cynos`、`auth`、`login session`）调用受限候选查询，两次均返回 `status = empty`（查无匹配，区别于不可用）。因无已确认 Bug 候选，该查询仅为覆盖性核对；此结果不宣称「项目中不存在任何重复 Issue」。

## 5. 覆盖缺口与限制

1. **无 base / included commits**：`baseCommit = null`、`includedCommits = []`，没有可比对的 base 与变化清单；结论只对固定 target 整体成立，**不能归因到任何具体提交或改动**。
2. **`GET /health` 未验证**：受控命令层拒绝该探测命令（`command-1.json` 返回 `COMMAND_NOT_ALLOWED`），无替代受控通道。属验证能力缺口，**非产品结论**，也不在 `AUTH-LOGIN-001` 期望范围内；同时不得计入「已通过」。
3. **场景索引与索引 Run 历史为空**：`scenarioIndex` 为空、按 commit 与场景 ID 的历史查询均返回 `status = empty`；已改用 target 正文为基准，检索效率受限，不影响本次判定。
4. **未覆盖项（本轮不执行）**：`AUTH-LOGIN-002`（draft）、`AUTH-REGISTRATION-001/002`，以及重复邮箱 409、弱密码 400、Origin 403、限流 429、7 天会话有效期等边界；本报告结论不扩展到这些范围。
5. **清理接口默认关闭**：`CYNOS_TEST_DATA_CLEANUP_TOKEN` 未由部署提供时 Run 级查删不可用；Harness 收尾能力由 Harness 自行确认，计划不假定其可用。
6. **快照与截图的内容差异**：截图内可见 Run 前缀测试账号邮箱（页面本身渲染），而快照文本对该邮箱做了脱敏；不影响「删除提示/错误提示可见」这一观察，也不涉及口令复述（口令始终以掩码呈现）。
7. **无人工复核**：本次判定主体为模型（执行者与 Reviewer 均为 Agent）；本 Run 无人工复核记录，不声称人工已确认。

## 6. 计数与口径核对

- 执行场景数：**1**（`AUTH-LOGIN-001`）；场景结果分布：passed 1、failed 0、blocked 0。
- 已确认 Bug 数：**0**（`confirmed_bugs` 为空数组，与 failed 计数一致）。
- 未验证/缺口项：§5 共 7 项，均为能力或范围缺口，其中仅第 2 项属本轮主动登记的验证能力缺口，其余为范围限定与如实说明；同一项不重复计入互斥分类。
- 数据登记与清理：场景内已通过 UI 实际删除所用预置账号（`DELETE /api/me => 200`），侦察阶段另用的账号亦已在侦察中删除；执行记录已登记 Run 前缀账号供 Harness 收尾，并明示「登记不代表已清理」。**测试后临时数据清理由 Harness 在本 Session 结束后统一处理**，本报告不声称已完成清理，也不填写系统收尾区。

## 7. 结论

`AUTH-LOGIN-001`（登录状态恢复）判定 **passed**，本 Run 最终结果为 **passed**。本轮初始化覆盖请求授权的唯一执行场景，四项期望与「需要记录」项均有真实浏览器操作与原始证据支持，期望 C/D 的「原 Session 可区分性」已按「固化真实凭据—重放—请求头携带同一值—401」链条与「未携带 Cookie 的 401」区分开；未发现产品缺陷，未创建或关联 Issue，未做长期场景资产变更。

本结论**仅限**固定 target `6405a45b6889ad92cf7cfbce12d8ec22b5040f23` 与本轮执行清单，不代表该 target 其他认证路径（注册、拒绝路径、限流/Origin 校验、会话有效期等）无问题，也不代表项目整体没有问题。后续如需扩展覆盖（例如对 draft 场景或未授权场景正式执行），或需验证 `/health` 等当前受控通道无法覆盖的入口，须另行确认授权范围与环境/工具能力；`baseCommit`/`includedCommits` 的补齐同样需另行确认。

<!-- luowang-screenshot-inspection -->
## 截图采集标签

- [截图 1](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzQ4RDFEVkQ5UzBKOVlUSjZZOEpUU0IvYWZ0ZXItZGVsZXRlLWxvZ2luLXN0YXRlLnBuZw>)：页面含可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 2](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzQ4RDFEVkQ5UzBKOVlUSjZZOEpUU0IvYWZ0ZXItbG9naW4td2VsY29tZS5wbmc>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 3](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzQ4RDFEVkQ5UzBKOVlUSjZZOEpUU0IvYWZ0ZXItbG9nb3V0LWxvZ2luLXN0YXRlLnBuZw>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 4](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzQ4RDFEVkQ5UzBKOVlUSjZZOEpUU0IvYWZ0ZXItcmVmcmVzaC1zYW1lLXVzZXIucG5n>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 5](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzQ4RDFEVkQ5UzBKOVlUSjZZOEpUU0IvYmVmb3JlLWRlbGV0ZS13ZWxjb21lLnBuZw>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 6](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzQ4RDFEVkQ5UzBKOVlUSjZZOEpUU0IvbG9naW4tZm9ybS1maWxsZWQucG5n>)：页面含可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 7](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzQ4RDFEVkQ5UzBKOVlUSjZZOEpUU0Ivb3JpZ2luYWwtY3JlZGVudGlhbHMtcmVqZWN0ZWQucG5n>)：页面含可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 8](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzQ4RDFEVkQ5UzBKOVlUSjZZOEpUU0IvcmVjb24tYXV0aGVudGljYXRlZC13ZWxjb21lLnBuZw>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 9](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzQ4RDFEVkQ5UzBKOVlUSjZZOEpUU0IvcmVjb24tZGVsZXRlZC1hY2NvdW50LWxvZ2luLXJlamVjdGVkLnBuZw>)：页面含可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
<!-- /luowang-screenshot-inspection -->

## Harness 清理收尾

测试数据清理完成；不改变本次功能验证结果。

清理适配器已独立核验 2 项测试数据不存在

全部登记测试数据均已独立核验清理

独立核验：luowang-01M348D1DVD9S0J9YTJ6Y8JTSB-preset · run-scoped-http-cleanup · 2026-09-22T09:58:40.052Z · absent=true · sha256 4558fbd0f6e8bd43cf0ccbd12bc6865e2c354f91707dbe297b4d5a3640ea0b32

独立核验：luowang-01M348D1DVD9S0J9YTJ6Y8JTSB-recon · run-scoped-http-cleanup · 2026-09-22T09:58:40.054Z · absent=true · sha256 4558fbd0f6e8bd43cf0ccbd12bc6865e2c354f91707dbe297b4d5a3640ea0b32
