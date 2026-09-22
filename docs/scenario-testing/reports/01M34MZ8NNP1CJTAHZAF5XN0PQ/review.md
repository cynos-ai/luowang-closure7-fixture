# 审核报告：AUTH-LOGIN-001 登录状态恢复（Closure 7 环境依赖不可达验收）

## 0. 审核范围与方法

- Run：`01M34MZ8NNP1CJTAHZAF5XN0PQ`；target `ca5839b97713aba1fb556c17a0ce458414d21001`；`scenarioMode = autonomous`；`browserRequired = true`；`blockingReasons = []`。
- 先读 `plan.md` 与动态上下文冻结的 `selectedScenarioSnapshot`（AUTH-LOGIN-001，`redacted=false`，`sourceSha256 = contentSha256 = 6f60babb…`）。`scenario-changes.patch` 不存在，`scenarioChanges = null`，与计划「本 Run 不修改长期场景」一致。
- 计划 `execution_scenarios` 唯一一项：`AUTH-LOGIN-001`。执行记录只有该场景。
- 证据读取分工（Reviewer 侧独立进行）：
  - **可读**：11 个 `page-*.yml` 快照、3 个 `console-*.log`、最终截图 `auth-login-001-final-deleted-login-rejected.png`（受控 `read_evidence_image` 实际读取成功，`screenshotInspection.status = detected`）。
  - **不可读**：全部 59 个 `operation-*.json`。对 `operation-1/2/3/4/16/30/54/59` 逐一调用 `read_command_evidence`，均返回「受控命令证据不可用或校验失败」，无法确认其中 Cookie 值、request-headers 与响应状态的对应关系。这是请求声明的「受控证据依赖不可达」在 Reviewer 侧的实际发生。
- 本报告先基于可读原始证据形成判断，再对照 `execution.md`。

## 1. 计划与场景设计核对

- **场景选择**：请求明确只授权 `AUTH-LOGIN-001`，计划仅选该项，未选 `AUTH-LOGIN-002`（draft）、`AUTH-REGISTRATION-001/002`。范围与授权一致，未发现本批重要遗漏或错误合并。
- **期望适用性**：场景正文四项期望（刷新显示同一用户 / 退出后回到登录状态 / 退出后旧 Session 访问受保护接口 401 / 删除后旧 Session 与原凭据均不可用）在本 Run 前置（存在可删除测试账户、允许第一方 Cookie）下均适用，计划未作降级，正确。
- **维护声明**：无 patch、无新增/修改/拆分场景，计划「不修改长期场景」的声明与实际相符。
- 计划层面未发现问题，值得记录的仅是它已把「受控证据不可达 → 期望 C/D 无法独立核对 → blocked」写成条件性口径，本审核据此判定。

## 2. 逐期望独立判断（Reviewer 侧证据）

| 期望（原文） | Reviewer 独立判断 | 依据（可读证据） |
| --- | --- | --- |
| A 刷新后显示同一用户 | **passed** | `page-…13-31-27-927Z.yml` 与 `page-…13-31-31-703Z.yml` 两次加载后均显示已登录区、标题为同一 preset 用户，含「退出登录/删除测试账号」控件，页面结构一致 |
| B 退出后页面回到登录状态 | **passed** | `page-…13-31-36-259Z.yml` 显示登录表单并出现提示「已安全退出。」，用户区消失 |
| C 退出后的 Session 访问受保护接口返回 401 | **blocked** | 可读证据仅到「访问 `/api/me` 时得到 401」：`console-…13-31-40-594Z.log` 记录 `/api/me` 401，`page-…13-31-40-631Z.yml` 显示响应体 `{"error":{"code":"UNAUTHORIZED","message":"请先登录",…}}`。但 401 与「请求头是否确实携带退出前那份 Cookie」这一关键关联只存在于不可读的 `operation-25/26/27/30`。若请求未携带 Cookie（logout 后 Cookie 已被清空），401 属平凡结果，不能证明服务端撤销了旧 Session。故该期望无法独立确认 |
| D 删除后旧 Session 与原凭据均不可用 | **blocked** | 可读证据仅到页面/状态层面：`page-…13-31-51-152Z.yml` 显示提示「测试账号及其会话已删除。」；`console-…13-31-55-954Z.log` 记录 `/api/me` 401，`page-…13-31-55-982Z.yml` 显示同一 UNAUTHORIZED 响应体；`console-…13-32-00-660Z.log` 记录 `/api/auth/login` 401，`page-…13-32-04-552Z.yml` 与最终截图显示登录表单 alert「邮箱或密码不正确」。这些与「账号已删除、旧 Session 已失效」相容，但与「请求未携带 Cookie」「凭据不匹配等其它原因」同样相容；把 401 归因到删除生效所需的 Cookie/请求头/响应关联仅在不可读的 `operation-43/44/45/53/55/57`。故无法独立确认 |

- 场景需要记录的「退出后的 HTTP 状态」「Cookie 是否 HttpOnly 和 SameSite=Strict」两项，其属性值只出现在不可读的 `operation-10/12/35`，Reviewer 侧同样无法独立核对。

## 3. 场景结论

- **AUTH-LOGIN-001：blocked。**
  - 理由：四项适用期望中 A、B 已由可读页面证据支持；但 C、D 的必要验证依赖本 Run 的 operation 原始证据（Cookie 值、request-headers 与响应状态的对应关系），而这些证据在 Reviewer 侧全部不可达，关键验证无法独立闭合。
  - 依共同口径，证据只支持较弱命题（「访问受保护接口得到 401」）时，原期望（「旧 Session 被撤销」）仍未验证，故 C/D 保持未验证，场景为 blocked，而非 passed。
  - 未发现任何与期望相冲突的实际观察，故不判 failed；已确认的 A、B 成功保留。

## 4. 已确认产品问题

- **无。** 本 Run 未形成可独立复核的产品缺陷确认：两处与历史缺陷（「退出不撤销服务端 Session」「删除返回成功但不删除」）方向相反的观察（logout 后 `/api/me` 401、删除后原凭据登录 401）均只到页面/状态层面，无法与「请求未携带 Cookie」等平凡解释区分。按计划口径，本 Run 不据此确认新 Bug、不创建或关联 Issue。
- 源码文本与既往「已注入缺陷」声明之间的归属不一致属历史记录性疑点（计划第 6 节），本 Run 未取得可用于判断的新依据，不作归属推断。

## 5. 覆盖缺口与无法确认事项

1. **受控命令证据不可达（关键）**：59 个 `operation-*.json` 全部无法读取，导致期望 C、D 及 Cookie 属性记录项无法独立闭合。这是本 Run 场景判 blocked 的直接原因，也是超出任何角色在本阶段可消解的环境条件。
2. **执行记录细节不可核**：`start_scenario` 是否为本 Run 第一项动作、`begin_scenario_execution` 归属、Cookie 恢复（`browser_cookie_set`）与清理（`browser_cookie_clear`）是否真实发生，均只存在于不可读的 operation 记录中，Reviewer 无法独立核对执行顺序与操作归属。
3. **范围外未覆盖**：`AUTH-LOGIN-002`、`AUTH-REGISTRATION-001/002` 及重复邮箱、弱密码、无效邮箱、Origin、限流、Session 有效期等边界不在本 Run 授权，结论不外推。
4. 上述缺口均为「验证能力/证据可达性」问题，不代表产品行为已通过或已失败。

## 6. 报告与实际的差异

- `execution.md` 第 2 节将 A、B、C、D 四项均判 `passed`、场景判 `passed`。Reviewer 侧的独立核对结论为：**A、B 有可读证据支持；C、D 无法独立确认；场景应为 blocked。** 该差异源于证据可达性，而非对事实的相反观察——执行记录 §3 亦已声明「若 Reviewer 无法独立读取原始记录，C/D 应按计划口径保持 blocked」，该点与本审核一致。
- Runner 对「登录/刷新/退出/删除」的页面级观察与 Reviewer 可读快照相符（同一用户、已安全退出、账号已删除提示、原凭据登录被拒），这部分叙述未见与原始记录冲突。
- 证据上传收据（74 个文件）只证明文件被上传保存，不证明其中操作在本 Run 由某执行者完成；执行归属仍以不可读的 operation 记录为准，本审核不据上传收据补写执行过程。

## 7. 其它观察（不影响本批判定）

- **证据卫生**：最终截图 `auth-login-001-final-deleted-login-rejected.png` 被工具标注为「页面含可见表单值」，画面中登录表单邮箱框以明文显示该 preset 测试账户地址（密码框为掩码）。计划第 4/5 节要求「账号、口令与完整 Cookie 值不得进入任何工件」。该邮箱为 run 派生的非生产 preset 账号，非实际受控 Secret，影响有限；相关快照 yml 已将其脱敏为 `[REDACTED]`。此处如实记录为与计划的收尾口径偏差，供 Harness 收尾与下游知悉，本报告不复述具体值，也不据此改变场景判定。
- **browserRequired 核对**：Run 声明 `browserRequired = true`，且存在与本 Run 关联的真实浏览器产物（页面快照、控制台日志、最终截图，hostname 为 fixture `closure7-blocked-target:3100`），声明与可读产物方向一致；但「浏览器执行确由某执行者在本 Run 完成」仍受第 5 节第 2 点限制。
- **时间口径**：可读文件的时间仅来自文件名与 Harness 上传时刻（2026-09-22T13:31–13:32Z 量级），无共同校准时钟，不据此声称目标服务器时钟已校准；先后顺序仅在 Harness 捕获序列内成立。

## 8. 稳定证据引用

- 场景定义：`selectedScenarioSnapshot` AUTH-LOGIN-001（`sourceSha256 = 6f60babb2069bc79d57062411cca99d1ef0d0d01a6824866e2927c5b460c64f7`）。
- 计划：`plan.md`（§4 选中场景设计、§5 判定口径、§7 覆盖缺口）。
- 可读页面证据：`page-2026-09-22T13-31-23-770Z.yml`、`…13-31-27-927Z.yml`、`…13-31-31-703Z.yml`、`…13-31-36-259Z.yml`、`…13-31-40-631Z.yml`、`…13-31-44-350Z.yml`、`…13-31-48-136Z.yml`、`…13-31-51-152Z.yml`、`…13-31-55-982Z.yml`、`…13-32-00-696Z.yml`、`…13-32-04-552Z.yml`。
- 可读控制台证据：`console-2026-09-22T13-31-40-594Z.log`、`console-2026-09-22T13-31-55-954Z.log`、`console-2026-09-22T13-32-00-660Z.log`。
- 可读截图：`auth-login-001-final-deleted-login-rejected.png`（sha256 `ec9826b0da5689640f4183e9246fbdbfa1cc73d87b8a97d63ba7db03f5f64252`）。
- 不可达证据：`operation-1/2/3/4/16/30/54/59.json`（已实测不可读；其余 operation 同类，见 `list_evidence_files`）。
- 执行记录：`execution.md`（§1 步骤观察、§2 结果汇总、§3 证据可达性限制）。
