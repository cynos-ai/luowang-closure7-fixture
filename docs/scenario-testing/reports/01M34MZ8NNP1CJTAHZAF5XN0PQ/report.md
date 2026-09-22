---
run_id: 01M34MZ8NNP1CJTAHZAF5XN0PQ
trigger: manual
base_commit: e09b0f377d1414fa3da2c65bcbbc2406421dec4d
target_commit: ca5839b97713aba1fb556c17a0ce458414d21001
included_commits: []
result: blocked
started_at: 2026-09-22T13:30:38.592Z
finished_at: 2026-09-22T13:33:32.937Z
scenario_results:
  - id: AUTH-LOGIN-001
    result: blocked
confirmed_bugs: []
---

# 测试报告：Closure 7 环境依赖不可达验收 —— AUTH-LOGIN-001

## 1. 结论摘要

- **Run 结果：blocked**（1 个执行场景，blocked；0 个 confirmed Bug）。
- 本 Run 是一次「验收型」运行，不是常规变更回归：固定区间 `e09b0f377d1414fa3da2c65bcbbc2406421dec4d → ca5839b97713aba1fb556c17a0ce458414d21001` 内 `includedCommits = []`，请求指定只执行 approved 场景 `AUTH-LOGIN-001`，且不修改长期场景。
- 唯一执行场景 `AUTH-LOGIN-001` 的四项适用期望中，期望 A、B 有独立的可读页面证据支持；期望 C、D 的必要验证依赖本 Run 的 operation 原始证据（Cookie 值、request-headers 与响应状态的对应关系），而这些证据在 Reviewer 侧全部不可达。关键验证无法闭合，按既定聚合规则（任一适用期望尚不能确认即 blocked）场景判为 blocked。
- 阻塞由环境层证据可达性引起，已列入本 Run 动态上下文的 `blockingReasons`（「Reviewer 无法读取受控命令证据，不能确认相关结果」「Reviewer 无法读取一项或多项 evidence」）。
- 本 Run 未形成任何可独立复核的产品缺陷确认，因此不创建、不关联 Issue。

## 2. 范围与固定 Run 值

- `runId = 01M34MZ8NNP1CJTAHZAF5XN0PQ`，`trigger = manual`，`scenarioMode = autonomous`，`initialization = false`，`scenarioChanges = null`（无场景 patch）。
- `baseCommit = e09b0f377d1414fa3da2c65bcbbc2406421dec4d`，`targetCommit = ca5839b97713aba1fb556c17a0ce458414d21001`，`includedCommits = []`。
- 计划 `## execution_scenarios` 唯一清单项为 `AUTH-LOGIN-001`，本报告 `scenario_results` 与之完整且有序一致；正文未引用任何其它 ID 补齐清单。
- 计划记录（Main 引用计划记载，未自行复查仓库）：本区间变化只有上一 Run（`01M34KTXNGH0M305H03PBYHMPB`）落盘的 `report.md`、`review.md` 两份文档类工件，`src/**`、`tests/**`、配置与规格文件无净变化，产品契约与本 Run 的 `baseCommit`（即上一 Run 的 target）相同。
- 授权范围外、本 Run 未执行且结论不外推的项：`AUTH-LOGIN-002`（draft）、`AUTH-REGISTRATION-001`（approved 但未授权）、`AUTH-REGISTRATION-002`（draft），以及重复邮箱、弱密码、无效邮箱、Origin、限流、Session 有效期等边界。
- 无 `scenario-changes.patch`（Main 侧读取该工件时工具明确回复当前角色不可读，与 `scenarioChanges = null` 及计划「不修改长期场景」一致），本次不存在「初始化修订场景 patch 未重新执行」的情形。

## 3. 逐场景结果

| 场景 ID | 结果 | 摘要 |
| --- | --- | --- |
| AUTH-LOGIN-001 | blocked | 期望 A、B 有可读证据支持；期望 C、D 的必要验证依赖不可达的 operation 原始证据，关键验证未闭合 |

### AUTH-LOGIN-001 登录状态恢复（approved；tags：core / module:认证 / flow:登录）

以下为 Reviewer 在 review.md 中独立交付的逐期望判断，归审核方：

| 期望（场景原文） | Reviewer 独立判断 | Reviewer 给出的依据 |
| --- | --- | --- |
| A 刷新后显示同一用户 | passed | `page-…13-31-27-927Z.yml`、`page-…13-31-31-703Z.yml` 两次加载后均显示已登录区，标题为同一 preset 用户，含「退出登录/删除测试账号」控件，页面结构一致 |
| B 退出后页面回到登录状态 | passed | `page-…13-31-36-259Z.yml` 显示登录表单并出现提示「已安全退出。」，用户区消失 |
| C 退出后的 Session 访问受保护接口返回 401 | blocked | 可读证据仅到「访问 `/api/me` 得到 401」（`console-…13-31-40-594Z.log`、`page-…13-31-40-631Z.yml` 的 UNAUTHORIZED 响应体）；401 与「请求头是否确携带退出前那份 Cookie」的关联只在不可读的 `operation-25/26/27/30`。若请求未携带 Cookie，401 属平凡结果，不能证明服务端撤销了旧 Session |
| D 删除后旧 Session 与原凭据均不可用 | blocked | 可读证据仅到页面/状态层面（`page-…13-31-51-152Z.yml` 的「测试账号及其会话已删除。」；`console-…13-31-55-954Z.log` + `page-…13-31-55-982Z.yml` 的 `/api/me` 401；`console-…13-32-00-660Z.log` + `page-…13-32-04-552Z.yml` 与最终截图的 `/api/auth/login` 401 与登录表单 alert）；这些与「请求未携带 Cookie」「凭据不匹配等其它原因」同样相容，归因所需的关联只在不可读的 `operation-43/44/45/53/55/57` |

- Reviewer 另指出：场景需要记录的「退出后的 HTTP 状态」「Cookie 是否 `HttpOnly` 与 `SameSite=Strict`」两项属性值只出现在不可读的 `operation-10/12/35`，其侧同样无法独立核对。
- 审核未发现与期望相冲突的实际观察，因此不判 failed；已确认的 A、B 成功保留。Main 按聚合规则采纳该逐场景结论：`blocked`。

## 4. 已确认产品问题（confirmed Bugs）

- **无。** Reviewer 明确交付：「本 Run 未形成可独立复核的产品缺陷确认」，两处与历史缺陷方向相反的观察（logout 后 `/api/me` 401、删除后原凭据登录 401）都只到页面/状态层面，无法与「请求未携带 Cookie」等平凡解释区分。
- 计划 §6 记录的重叠背景：源码文本与既往「已注入缺陷」声明之间的归属不一致属历史记录性疑点，本 Run 未取得可用于判断的新依据，计划与审核均不作归属推断。
- 依请求与计划口径（本 Run 不确认新 Bug、不创建或关联 Issue），`confirmed_bugs` 为空数组，**未执行** Issue 候选查询与 create/link 决策，因此不存在 `create`/`link` 动作，也无需覆盖缺口声明。这不是「查询无匹配」的判断，本报告不据此声称任何缺陷已被排除。

## 5. 阻碍与覆盖缺口

### 5.1 环境阻塞（本 Run 的直接原因，来自动态上下文的 blockingReasons）

1. Reviewer 无法读取受控命令证据，不能确认相关结果。
2. Reviewer 无法读取一项或多项 evidence。

### 5.2 审核记录的缺口（归 Reviewer）

- **受控命令证据不可达（关键）**：59 个 `operation-*.json` 全部无法读取（对 `operation-1/2/3/4/16/30/54/59` 实测返回「受控命令证据不可用或校验失败」），导致期望 C、D 及 Cookie 属性记录项无法独立闭合。Reviewer 将其表述为超出任何角色在本阶段可消解的环境条件。
- **执行记录细节不可核**：`start_scenario` 是否为本 Run 第一项动作、`begin_scenario_execution` 归属、Cookie 恢复（`browser_cookie_set`）与清理（`browser_cookie_clear`）是否真实发生，均只存在于不可读的 operation 记录中。
- **范围外未覆盖**：见第 2 节。
- Reviewer 同时限定：上述缺口均为验证能力/证据可达性问题，**不代表产品行为已通过或已失败**。

## 6. 证据现状与来源归属

- **证据清单（按 review.md 记载核对）**：可读 11 个 `page-*.yml` 快照、3 个 `console-*.log`（其中 2 个文件 sha256 相同，为不同捕获时刻的两条记录）、1 张最终截图 `auth-login-001-final-deleted-login-rejected.png`（sha256 `ec9826b0da5689640f4183e9246fbdbfa1cc73d87b8a97d63ba7db03f5f64252`，`screenshotInspection.status = detected`）；不可读 59 个 `operation-*.json`。本 Run 动态上下文中列出的证据条目（含每个 `operation-*.json` 的 sha256）与该清单在类别与数量上一致。
- **可读证据的稳定引用（取自动态上下文，原文复用）**：页面快照 `page-2026-09-22T13-31-23-770Z.yml`、`page-2026-09-22T13-31-27-927Z.yml`、`page-2026-09-22T13-31-31-703Z.yml`、`page-2026-09-22T13-31-36-259Z.yml`、`page-2026-09-22T13-31-40-631Z.yml`、`page-2026-09-22T13-31-51-152Z.yml`、`page-2026-09-22T13-31-55-982Z.yml`、`page-2026-09-22T13-32-00-696Z.yml`、`page-2026-09-22T13-32-04-552Z.yml`；控制台 `console-2026-09-22T13-31-40-594Z.log`、`console-2026-09-22T13-31-55-954Z.log`、`console-2026-09-22T13-32-00-660Z.log`；截图 `auth-login-001-final-deleted-login-rejected.png`。以上地址原样来自动态上下文提供的证据 URL，未自行拼接或改写。
- **执行归属**：Reviewer 已声明证据文件的存在与上传保存不证明某项操作在本 Run 由某执行者完成，执行归属仍以待核的 operation 记录为准；Main 不据上传收据补写执行过程。Runner 对登录/刷新/退出/删除的页面级观察与 Reviewer 可读快照相符（同一用户、「已安全退出。」、账号已删除提示、原凭据登录被拒）——这是 Reviewer 的对照判断，本报告如实转述，不外推为服务端状态结论。
- **报告差异（保留，不对齐改写）**：审核记录 `execution.md` 第 2 节将 A、B、C、D 四项及场景均判 `passed`；Reviewer 独立核对结论为 A、B 有可读证据支持、C、D 无法独立确认、场景应为 blocked，并将差异归因为证据可达性。Main 在此保留该矛盾按审核结论聚合为 blocked，未重新分析原始证据、未改写为双方一致。
- **时间口径**：仅有的时间来自文件名与 Harness 捕获/上传时刻（约 2026-09-22T13:31–13:32Z 量级），无共同校准时钟；先后顺序只在 Harness 捕获序列内成立，不据此声称目标服务器时钟已校准（属计划与审核的口径）。
- **证据卫生（Reviewer 的独立观察）**：最终截图被工具标注为「页面含可见表单值」，登录表单邮箱框明文显示该 run 派生的非生产 preset 测试账户地址（密码框掩码），相关快照 yml 已脱敏为 `[REDACTED]`。Reviewer 将该点如实记录为与计划收尾口径的偏差并称不影响场景判定。本报告不复述任何账号、口令或完整 Cookie 值，也不据此改变测试结果。

## 7. 发布状态与下一步

- **发布状态**：本 Run 未推进目标、未发布任何结论性产品判定；`blocked` 反映的是验证未闭合，不等于产品行为已通过或已失败。这不属于产品发布结论，与场景结果分别表达。
- 测试数据清理由 Harness 在本 Session 结束后统一处理，本报告不声称清理已完成，也不填写系统收尾区。
- 在**当前授权范围内**的可行下一步：恢复受控命令证据（`operation-*.json`）的独立可读性，随后由 Reviewer 重新核对期望 C、D 所需的 Cookie / request-headers / 响应关联，以及「退出后的 HTTP 状态」「Cookie 是否 `HttpOnly` 与 `SameSite=Strict`」两项记录项；在这些证据闭合前，`AUTH-LOGIN-001` 保持 blocked，且不得据此确认 Bug 或产生 Issue 动作。任何更换运行环境、账号或扩大场景范围（例如改测其它 auth 场景）的建议均超出本次授权，须另行确认后再执行。
- Issue 动作：本 Run 无 confirmed Bug，未执行候选查询，无 create/link 决策；后续按本 Run 已建立的事实继续时，须在证据可达后重新形成可复核的缺陷确认。

<!-- luowang-screenshot-inspection -->
## 截图采集标签

- [截图 1](</api/evidence/bHVvd2FuZy9jeW5vcy13ZWJzaXRlL3J1bi1jbG9zdXJlNy1wZXJzaXN0ZW50LTA3ZTg5ODkvMDFNMzRNWjhOTlAxQ0pUQUhaQUY1WE4wUFEvYXV0aC1sb2dpbi0wMDEtZmluYWwtZGVsZXRlZC1sb2dpbi1yZWplY3RlZC5wbmc>)：页面含可见表单值；检测范围为页面，不代表图片整体安全或人工审核通过。
<!-- /luowang-screenshot-inspection -->

## Harness 自动阻塞原因

- Reviewer 无法读取受控命令证据，不能确认相关结果
- Reviewer 无法读取一项或多项 evidence

## Harness 清理收尾

测试数据清理完成；不改变本次功能验证结果。

清理适配器已独立核验 1 项测试数据不存在

全部登记测试数据均已独立核验清理

独立核验：luowang-01M34MZ8NNP1CJTAHZAF5XN0PQ-preset · run-scoped-http-cleanup · 2026-09-22T13:33:49.946Z · absent=true · sha256 9786d468080d1215f7552b5fe7ee7aaa78ee5c4417222b243ebcf6a79d8504e6
