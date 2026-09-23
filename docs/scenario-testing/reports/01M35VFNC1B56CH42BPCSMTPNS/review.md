# 审核报告：AUTH-LOGIN-001（Closure 7 双缺陷 failed 验收）

审核者：Reviewer（独立只读审核）
Run：`01M35VFNC1B56CH42BPCSMTPNS`（manual，scenarioMode=autonomous，initialization=false）
固定 target：`77036184fa1930ac50821bf0b1bc00cd2984cbc1`（baseCommit=null，includedCommits=[]）
`browserRequired: true`，`blockingReasons: []`
计划 planHash：`437ce92bda0e1c2cef103bbe4acf564c30a843cbbe2ef4ddd9a33dea712b07b3`（经 `query_source_reads(scope=plan)` 校验一致）

## 1. 审核范围与依据

- 先读 `plan.md`、`scenario-changes.patch`（不存在）与 `selectedScenarioSnapshot` 冻结正文，再通过 `list_evidence_files` 逐条读取命令证据、浏览器快照与截图，**形成独立判断后才打开 `execution.md`** 做对照。
- 唯一执行场景来自计划 `## execution_scenarios`：`AUTH-LOGIN-001`。场景正文（approved，tags 含 core）与快照一致，未脱敏（`redacted: false`）。
- 本 Run 无 `scenario-changes.patch`：计划声明的“无场景维护动作”与实际一致（不新增/修改/拆分长期场景）。
- 场景索引不可用（`scenarioIndex.commit=null`），计划改以实读场景正文为准，处理合理。
- 静态源码读取（`src/server/security/auth.ts`、`src/server/app.ts`、`src/web/App.tsx`）回执 `redacted:true`，隐藏内容不在覆盖内；计划明确“静态描述不作为期望是否成立的依据”，审核据此未采用静态实现描述做判定。

## 2. 逐场景结果

### AUTH-LOGIN-001 — 登录状态恢复 — **failed**

| 期望（场景原文） | 判定 | 实际观察 |
|---|---|---|
| A 刷新后显示同一用户 | passed | 登录后页面显示同一用户（op-8 快照）；重新加载（op-12 browser_navigate → op-13 快照）仍显示同一用户；`GET /api/auth/status` 返回 200 且 `authenticated:true`，user.id 前后一致（op-11、op-16 响应体） |
| B 退出后页面回到登录状态 | passed | UI 点击「退出登录」后回到登录表单并提示「已安全退出。」（op-18 点击 → op-19 快照；快照文件 `page-2026-09-23T00-44-39-613Z.yml` 同内容）；`POST /api/auth/logout` 返回 200（op-20） |
| C 退出后的 Session 访问受保护接口返回 401 | **failed** | 退出前固化的真实 `cynos_session`（op-17，observed-browser，引用 `credential-d16450eddc23e402a8327a1faec822e0`）在退出后仅恢复该值（op-21 restore-input，同一引用），以真实请求访问 `GET /api/me`：请求头 cookie 携带同一引用值（op-26，observed-request-header），返回 **200** 并带完整用户资料（op-25 `GET /api/me => 200`；op-24 快照为 `{"user":{"id":"2916dd34-…"}}` JSON 页面；截图 `post-logout-session-still-valid.png` 同内容）。期望为 401，实际 200 → 违反 |
| D 删除测试账号后旧 Session 和原凭据均不可用 | **failed** | 见下两段，两个子条件均被违反 |

期望 D 细分：

- **删除报成功：** 重新登录后固化新会话值（op-36，引用 `credential-dc17c6db44a1d750261f3a28f099d8e6`），点击 UI「删除测试账号」（op-37），页面提示「测试账号及其会话已删除。」（op-38 快照）；`DELETE /api/me` 返回 200，响应体 `{"deleted":true,"authenticated":false,"user":null}`（op-39、op-40）。删除请求头携带删除前会话值（op-41 同一引用）。**删除侧明确声明成功。**
- **旧 Session 仍可用（违反）：** 仅恢复删除前会话值（op-42 restore-input，同一引用），访问 `GET /api/me`：请求头携带同一引用值（op-46，observed-request-header），返回 **200** 且为同一用户资料（op-45；op-44 快照 `{"user":{"id":"2916dd34-…"}}`；截图 `post-delete-relogin-succeeded.png` 显示已登录卡片）。期望为 401/不可用，实际 200 → 违反。
- **原凭据仍可用（违反）：** 清理浏览器 Cookie 后（op-47 cookie_set `expires=1` → op-48 cookie_list），用**原邮箱+原口令**重新登录（op-51 填表，valueReference 与首次登录 op-5 完全相同的 `credential-c3de118a1d8f1f097201dc19c5fe97b6` / `credential-5a2a6103d621728ff67e017958b6a219`），点击登录（op-52），页面回到登录态（op-53 快照）；`POST /api/auth/login` 返回 **200** 且 `authenticated:true`、user.id 与删除前完全相同、createdAt 未变（op-54、op-55）。账号实际未被删除 → 违反。

结论：`AUTH-LOGIN-001` = **failed**（A、B 通过；C、D 违反，均有充分实际观察支持）。

## 3. 已确认产品缺陷（两独立 bug key）

### Bug key 1 ↔ 缺陷 (a)：退出接口不撤销服务端 Session
- 期望 vs 实际：期望 C 要求退出后原 Session 访问受保护接口返回 401；实际返回 200 且返回同一用户资料。
- 复现条件：登录 → UI 退出（`POST /api/auth/logout` 返回 200，UI 提示「已安全退出。」）→ 携带退出前固化的同一 `cynos_session` 访问 `GET /api/me` → 200 + 完整用户资料。
- 关联强度：请求头观察（op-26）与退出前固化值（op-17）、恢复输入（op-21）共享同一引用 `credential-d16450eddc23e402a8327a1faec822e0`，证明服务端确实收到原会话后仍接受，而非浏览器丢 Cookie 造成未认证。
- 稳定证据：op-17、op-19、op-20、op-21、op-24、op-25、op-26；截图 `post-logout-session-still-valid.png`。

### Bug key 2 ↔ 缺陷 (b)：删除接口返回成功但未删除账号或 Session
- 期望 vs 实际：期望 D 要求删除后旧 Session 与原凭据均不可用；实际删除返回 `{"deleted":true,…}`（op-40）且 UI 提示删除成功，但删除前 Session 访问 `GET /api/me` 仍 200（op-45/46），原凭据重新登录仍 200 且返回同一 user.id（op-54/55）。
- 复现条件：登录 → 固化当前会话 → UI 删除账号（`DELETE /api/me` 返回 200 + `deleted:true`）→ 恢复删除前会话访问 `GET /api/me` → 200；清 Cookie 后用原邮箱+原口令登录 → 200 成功。
- 关联强度：删除请求头（op-41）、恢复输入（op-42）、受保护请求头（op-46）共享同一引用 `credential-dc17c6db44a1d750261f3a28f099d8e6`；原凭据重登的 valueReference 与首次登录相同。
- 稳定证据：op-36、op-38、op-39、op-40、op-41、op-42、op-44、op-45、op-46、op-51、op-53、op-54、op-55；截图 `post-delete-relogin-succeeded.png`。

两缺陷各有彼此独立的观察支撑（(a) 由退出后旧会话 200；(b) 由删除报成功 + 旧会话 200 + 原凭据登录成功），未合并。

## 4. 报告与执行记录核对

- `execution.md` 的清单、结果与通过/失败项与原始证据一致：A/B passed、C/D failed、整体 failed；两个 bug key 归属与我的独立判断一致。
- 场景进度记录（op-1 `begin_scenario_execution`、op-2 `start_scenario AUTH-LOGIN-001`、op-57 `finish_scenario`）显示 `start_scenario` 为第一项执行工具，且全程归属 `AUTH-LOGIN-001`，无跨场景操作。
- 偏差（如实记录、不影响结论）：
  1. **Cookie 清理方式**：受控 Playwright MCP 无显式“清空全部 Cookie”工具，改用 `cookie_set(expires=1)` 写入过期 Cookie（op-29、op-47）。此为对场景步骤 5/6“清理浏览器 Cookie”的等价实现。注意 `browser_cookie_list` 的输出（op-30、op-48）在捕获记录中被省略（`[Output omitted]`），因此“确认已无 Cookie”这一具体文字我无法从原始回执独立复核；但随后重新加载页面显示未登录的登录表单（op-31/32、op-49/50），与“已清空认证态”一致，流程语义成立。
  2. **“刷新页面”以 `browser_navigate` 重新加载实现**（op-12），语义等价，接受。
  3. `execution.md` 第 2 节期望 C/D 段落文字在“`cookie: [REDACTED]`”处出现截断/拼接，属工件排版瑕疵；对应原始证据完整，不影响判定。
- 未复述口令/完整 Cookie：工件与图片均按脱敏规则呈现，未发现执行记录复述口令值。`login-form-filled.png` 的截图检视标记为“页面含可见表单值”，实际展示为邮箱与掩码后的口令，未泄露明文口令。

## 5. 覆盖缺口与无法确认事项

1. **无 base/included commits**：仅做 target 整体验收，不能把结论归因到任何具体改动，未用 diff 说明缺陷引入方式。不影响本批 failed 判定。
2. **静态读取脱敏**：`auth.ts`/`app.ts`/`App.tsx` 回执 `redacted:true`，相关实现细节不在覆盖内；未据此推断期望成立与否。
3. **Session 时长（TTL）未验证**：场景未单列时长行为，本 Run 的即时观察不能支持时长结论。
4. **Cookie `secure:false`**：属观察记录（op-17），场景未对 `secure` 设期望；`httpOnly:true`、`sameSite:Strict` 已记录，符合“需要记录”要求。
5. **历史 Run 与历史报告区分**：`docs/scenario-testing/reports/01M35T3EEN58NDQY8B66E72AQZ/report.md` 记录的是**另一 target** 上 AUTH-LOGIN-001 通过，未作为本 Run 判定依据；`query_run_history` 空结果与本仓库存在该报告文件是两个不同事实。
6. **审核主体说明**：本次为模型执行/模型审核，截图检视标记由工具产生；无人工复核记录，故不声称人工已确认。
7. 测试数据清理由 Harness 在最终 Main 后处理，不属于本次审核或阻塞项；场景本身验证删除行为，已按实际行为判定。

## 6. 结论

- `AUTH-LOGIN-001` = **failed**：期望 A、B 通过；期望 C、D 违反。
- 确认两个独立产品缺陷：**(a) 退出接口不撤销服务端 Session**（期望 C 违反）；**(b) 删除接口返回成功但未删除账号或 Session**（期望 D 违反）。两缺陷均有充分、可复现的实际观察与原始证据支持。
- 计划与实际执行的范围一致（仅 `AUTH-LOGIN-001`），未发现重要漏测、场景设计错误或降低期望的情形；无阻塞项影响上述结论。
