---
run_id: 01M35T3EEN58NDQY8B66E72AQZ
trigger: manual
base_commit: null
target_commit: ef468e7c94d023d36da1e88254af90cdcc934b21
included_commits: []
result: passed
started_at: 2026-09-23T00:19:42.006Z
finished_at: 2026-09-23T00:27:06.966Z
scenario_results:
  - id: AUTH-LOGIN-001
    result: passed
confirmed_bugs: []
---

# 最终报告：Closure 7 独立测试仓库 · 首次初始化

## 1. 范围与固定版本

- Run：`01M35T3EEN58NDQY8B66E72AQZ`（manual，initialization=true，scenarioMode=autonomous）。
- Target：`ef468e7c94d023d36da1e88254af90cdcc934b21`；`base_commit=null`、`included_commits=[]`。因此本报告结论**只针对 target 整体验收，不可归因到任何具体改动**。
- 执行环境：非生产 fixture `http://cu4-initialization-target:3100`（由计划与审核证据共同确认）。
- 执行集合：计划唯一 `## execution_scenarios` 为 `AUTH-LOGIN-001`（1 项）。请求明确规定本轮只复用 target 现有 approved 场景 `AUTH-LOGIN-001`，不新增、修改、rename 或 deprecated 长期场景；计划声明无 scenario patch，本 Session 读取 `scenario-changes.patch` 返回“工件不存在”，与计划声明一致，本 Session 亦**未生成或修订任何长期场景 patch**。
- 本报告整理 plan.md 的计划与 review.md 的独立审核，不回读运行记录重做审核。

## 2. 逐场景结果

### AUTH-LOGIN-001 登录状态恢复与退出撤销 —— passed

依据审核交付的判定：适用期望 A–D 全部有充分实际观察支持，步骤 1–6 均已执行，需要记录项齐全（来源：review.md 第 2、7 节，Reviewer 独立实读全部原始证据后作出的判断）。

| 期望 | 内容 | 审核结论 |
|---|---|---|
| A | 刷新后显示同一用户 | 符合（刷新后真实快照 + `/api/auth/status` 响应体指向同一账户；刷新后 Cookie 值与登录后相同） |
| B | 退出后页面回到登录状态 | 符合（logout 200，页面回登录表单并提示“已安全退出。”；浏览器侧已无 `cynos_session`） |
| C | 退出后的 Session 访问受保护接口返回 401 | 符合，且已排除弱观察（请求头证据显示确实携带退出前固化的原 Session） |
| D | 删除账号后旧 Session 和原凭据均不可用 | 符合（删除后旧 Session 重放 `/api/me` → 401；原凭据登录 → 401 INVALID_CREDENTIALS） |

关键观察（来源：review.md 第 2 节，Reviewer 实读原始记录后的独立判断）：

- 登录 `POST /api/auth/login => 200`，进入 Welcome 视图，用户资料与后续刷新一致；`cynos_session` 实测 `httpOnly: true, secure: false, sameSite: Strict`（`secure:false` 与 HTTP 环境一致）。
- 期望 C：退出前读取并固化真实 `cynos_session`；退出 `POST /api/auth/logout => 200`，该请求 request-headers 携带该原 Session；随后以恢复的同一 Cookie 访问受保护接口 `GET /api/me` → 页面 `[401] Unauthorized`，该请求 request-headers 明确带 `cookie` 且与退出前固化值为同一引用，响应体为 `UNAUTHORIZED`/“请先登录”。审核据此判定关联链成立：该 401 是服务端收到退出前原 Session 后拒绝，而非丢 Cookie 造成的未认证 401，即计划第 7 节期望 C 要求的证据形态已满足。
- 期望 D：重新登录产生新会话（与退出前值不同）；删除前再次固化真实 Cookie，点击「删除测试账号」→ `DELETE /api/me => 200`（响应 `deleted:true`），页面提示「测试账号及其会话已删除。」；写回删除前固化值访问 `GET /api/me` → 401；再以原邮箱与原口令提交 → `401 INVALID_CREDENTIALS`，页面显示“邮箱或密码不正确”。
- 需要记录项（登录/刷新后用户资料、退出后 HTTP 状态、Cookie 的 HttpOnly 与 SameSite、删除后提示、删除后旧 Session 与原凭据登录结果）全部落实，审核以对照表逐项给出记录。

稳定证据引用（原样复用工具返回的地址，不自行拼接）：

- 填写现场截图：`/api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzVUM0VFTjU4TkRRWThCNjZFNzJBUVovYXV0aC1sb2dpbi0wMDEtc3RlcDEtZmlsbGVkLWxvZ2luLWZvcm0ucG5n`（sha256 `a0eb2a878096611643f7ed4b930d67868210b4bf7b292aac18878a52780714e5`）
- 登录后截图：`/api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzVUM0VFTjU4TkRRWThCNjZFNzJBUVovYXV0aC1sb2dpbi0wMDEtc3RlcDEtbG9nZ2VkLWluLnBuZw`（sha256 `8f6286d27d0cdcff765b200150134272d7e4b827d8a283a437edd54a364d1a5a`）
- 刷新后截图：`/api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzVUM0VFTjU4TkRRWThCNjZFNzJBUVovYXV0aC1sb2dpbi0wMDEtc3RlcDMtYWZ0ZXItcmVmcmVzaC5wbmc`（sha256 `8f6286d27d0cdcff765b200150134272d7e4b827d8a283a437edd54a364d1a5a`）
- 退出后截图：`/api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzVUM0VFTjU4TkRRWThCNjZFNzJBUVovYXV0aC1sb2dpbi0wMDEtc3RlcDQtYWZ0ZXItbG9nb3V0LnBuZw`（sha256 `7dcf2925bf70a16ea3ce94679f39383bf2ee9f0eabc43b56db3fb570f640ca5e`）
- 期望 C 的决定性快照（`/api/me` 401 错误体）：`/api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzVUM0VFTjU4TkRRWThCNjZFNzJBUVovcGFnZS0yMDI2LTA5LTIzVDAwLTIzLTM0LTEwMloueW1s`（sha256 `d3f7cc988a670516709f6a09e87f8c421e9d01a6f3586b81dc42c3a392516e83`）
- 期望 D 删除后重放 `/api/me` 的快照：`/api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzVUM0VFTjU4TkRRWThCNjZFNzJBUVovcGFnZS0yMDI2LTA5LTIzVDAwLTIzLTUyLTExNFoueW1s`（sha256 `fe6a64eabd14fe881b58037efae08573b6fe01d23c8ffdbbb0b00948c95d88ad`）
- 删除后截图：`/api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzVUM0VFTjU4TkRRWThCNjZFNzJBUVovYXV0aC1sb2dpbi0wMDEtc3RlcDYtYWZ0ZXItZGVsZXRlLnBuZw`（sha256 `e05d6b55436917c4a8b74c6fc8f49ed5b6232d916581704f48883f80bd1f8b5d`）
- 原凭据重登被拒截图：`/api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzVUM0VFTjU4TkRRWThCNjZFNzJBUVovYXV0aC1sb2dpbi0wMDEtc3RlcDYtcmVsb2dpbi1vcmlnaW5hbC1jcmVkZW50aWFscy5wbmc`（sha256 `376b96ebcd3b4cbbeaada235880e89af8ede85d0d6508b4c07652c53c7935d68`）
- 运行记录与页面快照、console 日志（`operation-*.json`、`page-*.yml`、`console-*.log`）均在本次 Run 证据清单内，本文不逐条引用其内部值；本次实际观察全部来自这些记录，未凭源码或历史报告推断。

## 3. 已确认产品问题与 Issue 决策

- **本次 confirmed Bugs：无。** 审核明确结论：本 Run 未发现与 `AUTH-LOGIN-001` 期望相冲突的产品行为——退出确实撤销服务端会话（原 Session 重放 401）、删除账号确实使旧 Session 与原凭据失效、刷新保持登录、退出后 UI 回登录态（来源：review.md 第 4 节，Reviewer 判断）。
- 因无 confirmed Bug 候选，本 Session 无 `query_issue_candidates` 查询对象，`confirmed_bugs` 为空数组，语义上**不产生任何 create/link 决策**。无 Issue 被创建或关联。
- 关于计划第 6 节记录的两条 **open** Issue（#1 删除账号接口返回成功但未删除账号与会话、#2 退出登录接口不撤销服务端 Session）：审核说明本 Run 的运行观察**未复现**其描述行为，并明确该观察**不代表对这两条 Issue 历史范围或状态的判断**（来源：review.md 第 4 节）。本报告不据此刻意修改、关闭或评论任何 Issue，也不因未复现而否认其历史存在。
- 计划第 6 节所述“源码/历史与实际运行的张力”在本次已被运行观察回答：实际运行行为符合场景期望 A–D。此为**本 target 上、AUTH-LOGIN-001 期望范围内**的结论，不推广为“整个项目没有问题”，也不对其他场景或未验证行为作任何判断。

## 4. Issue 查询覆盖缺口

无。本次 `confirmed_bugs` 为空，没有任何经审核确认的产品 Bug 需要查询/去重，故不存在查询 unavailable 或覆盖缺口，也不存在“无匹配”声明。

## 5. 发布状态

本报告只表达测试结果与 Issue 决策，不表示已发布或已部署任何变更；`create/link` 即使存在也仅是对后续受控归档 owner 的决策，而本次无该决策。

## 6. 覆盖缺口、未确认项与记录限定（沿用审核与计划的限定，不改写）

1. **Session 有效期未验证**：计划记录 TTL 为 7 天，但场景未单列该时长行为，本 Run 的即时观察不能支持时长结论（来源：review.md 第 5.1 节、plan.md 第 8.4 节）。
2. **清理接口启用状态未知**：本 Run 未调用 `GET|DELETE /api/luowang/test-data/<RunID>`，无法判断 `CYNOS_TEST_DATA_CLEANUP_TOKEN` 是否配置；不影响场景结论（来源：review.md 第 5.2 节）。
3. **“六个隔离 Session”未在运行中体现为六个隔离浏览器会话**：审核如实列为待澄清项——本 Run 使用单一浏览器上下文（仅末尾一次 `browser_close`），期望 C/D 以 Cookie 注入+重放达成；该表述的具体指代无法从 Session 工件确认，若其字面要求六个彼此隔离的浏览器会话，则本 Run 未提供对应证据。审核明确此项**不改变** `AUTH-LOGIN-001` 的 passed 判定，但保留为待澄清项。本报告原样保留该限定。
4. **脱敏读取范围**：`src/server/security/auth.ts`、`src/server/app.ts` 等读取回执为 `redacted:true`，其隐藏内容不在覆盖范围内；审核未据其判断实现正确性，计划第 6 节的静态实现描述属脱敏文本理解，不作为期望是否成立的依据。
5. **Cookie 引用语义限定**：`credentialReferences` 只表示“本 Run 内值相同”；本次以该同一性把“恢复输入”“请求头观察”“浏览器观察”三者关联，足以支持期望 C/D，但**不据此推断跨 Run 或跨时间的行为**（来源：review.md 第 5.5 节）。
6. **历史 Run 查询为空**：`query_run_history` 对本 target 与 `AUTH-LOGIN-001` 均无记录，而仓库内存在 `docs/scenario-testing/reports/**` 历史报告文件；“查询为空”与“存在历史报告文件”是两个不同事实，分别表述，本报告结论不依赖历史记录（来源：plan.md 第 2、8.6 节，review.md 第 5.6 节）。
7. **无 base/included commits**：只做 target 整体验收，不能归因到具体改动。
8. **记录标签与引用精度问题（Harness 侧，不影响判定）**：审核指出（a）execution 报告关于临时 Cookie 清理/关闭页面的 operation 序号引用不精确；（b）`finish_scenario` 结束事件记录的 `scenarioId` 为 `null`、`scope:"auxiliary"`，仅以 `completed:["AUTH-LOGIN-001"]` 体现归属，即“结束事件带场景 ID”超出实际记录内容；（c）步骤 5 截图 `auth-login-001-step5-replay-after-logout.png` 采集时间早于 `/api/me` 重放导航，画面实为登录表单而非 401 响应画面，属证据组织/命名问题。以上均为审核交付的观察，来源归 Reviewer，均不影响场景结论。
9. **证据完整性与执行归属分开表述**：本次证据清单包含截图、`operation-*.json`、`page-*.yml`、`console-*.log`、`command-*.json`。审核说明其对 11 张截图全部实读、均为真实全页页面、未见为改善证据而清空或遮盖；执行归属以运行记录中的 `scope:"scenario"` 标注与场景开始/结束事件为据。预置合成材料（如有）只支持其声明的评估范围，不能从证据文件的存在反推本 Run 做过对应操作；反之，本次运行记录确实包含场景内操作记录，故“缺少某类记录”不适用于本 Run 的浏览器操作归属。

## 7. 测试数据清理

测试账号已在场景步骤 6 内作为业务行为实际删除（删除生效已由期望 D 验证）；重放用临时 Cookie 已清除，随后 Cookie 列表为空，页面已关闭（来源：review.md 第 6 节）。**测试后的数据清理由 Harness 在本 Session 结束后统一处理，本报告不声称已由本 Session 完成，也不填写系统收尾区。**

## 8. 必要下一步

- 本 target 上 `AUTH-LOGIN-001` 的全部适用期望已闭合，无需为答复本场景追加执行。
- 若需消除第 6 节的未确认项（Session 有效期、清理接口启用状态、“六个隔离 Session”的具体含义），需要新的、经确认的场景执行范围或环境条件；这些属**另行确认后**的工作，不在本次授权范围内，本报告不将其当作现有权限内的替代方案。
- 未复现的两条历史 open Issue（#1、#2）状态由后续受控 owner 依据实际情况处理；本报告不做归档动作。

<!-- luowang-screenshot-inspection -->
## 截图采集标签

- [截图 1](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzVUM0VFTjU4TkRRWThCNjZFNzJBUVovYXV0aC1sb2dpbi0wMDEtc3RlcDEtZmlsbGVkLWxvZ2luLWZvcm0ucG5n>)：页面含可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 2](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzVUM0VFTjU4TkRRWThCNjZFNzJBUVovYXV0aC1sb2dpbi0wMDEtc3RlcDEtbG9nZ2VkLWluLnBuZw>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 3](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzVUM0VFTjU4TkRRWThCNjZFNzJBUVovYXV0aC1sb2dpbi0wMDEtc3RlcDMtYWZ0ZXItcmVmcmVzaC5wbmc>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 4](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzVUM0VFTjU4TkRRWThCNjZFNzJBUVovYXV0aC1sb2dpbi0wMDEtc3RlcDQtYWZ0ZXItbG9nb3V0LnBuZw>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 5](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzVUM0VFTjU4TkRRWThCNjZFNzJBUVovYXV0aC1sb2dpbi0wMDEtc3RlcDUtcmVwbGF5LWFmdGVyLWxvZ291dC5wbmc>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 6](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzVUM0VFTjU4TkRRWThCNjZFNzJBUVovYXV0aC1sb2dpbi0wMDEtc3RlcDYtYWZ0ZXItZGVsZXRlLnBuZw>)：页面含可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 7](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzVUM0VFTjU4TkRRWThCNjZFNzJBUVovYXV0aC1sb2dpbi0wMDEtc3RlcDYtcmVsb2dpbi1vcmlnaW5hbC1jcmVkZW50aWFscy5wbmc>)：页面含可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 8](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzVUM0VFTjU4TkRRWThCNjZFNzJBUVovcmVjb24tMDEtbG9naW4tcGFnZS5wbmc>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 9](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzVUM0VFTjU4TkRRWThCNjZFNzJBUVovcmVjb24tMDItcmVnaXN0ZXItdmlldy5wbmc>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 10](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzVUM0VFTjU4TkRRWThCNjZFNzJBUVovcmVjb24tMDMtd2VsY29tZS1hdXRoZW50aWNhdGVkLnBuZw>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
- [截图 11](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzVUM0VFTjU4TkRRWThCNjZFNzJBUVovcmVjb24tMDQtbG9nZ2VkLW91dC5wbmc>)：范围内未检测到可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
<!-- /luowang-screenshot-inspection -->

## Harness 清理收尾

测试数据清理完成；不改变本次功能验证结果。

清理适配器已独立核验 1 项测试数据不存在

全部登记测试数据均已独立核验清理

独立核验：luowang-01M35T3EEN58NDQY8B66E72AQZ-preset · run-scoped-http-cleanup · 2026-09-23T00:27:30.971Z · absent=true · sha256 180a6ca41a7e8d7c1bfec98781baa599ec4441aa73dba03f98dc07e4afcbfc64
