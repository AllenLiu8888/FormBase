# FormBase 前端编码规则（AI Coding Tools 必须遵循）

本规则面向 AI 编码工具（如 Cursor、Claude Code 等），用于本仓库的前端实现。目标：保持代码可读、可维护、可测，并与已提供的 PostgREST 后端稳定对接。

## 总则（必须）

- 遵循 SOLID、DRY、KISS、Readability 原则。
- 只实现前端；后端已提供，所有数据通过 RESTful API 访问。
- 不得硬编码或提交 JWT；读取自安全来源（本地 `.env` 或常量文件，禁止入库）。
- 任何提交前，确保无 ESLint/Prettier 报错与 TypeScript 类型错误（若引入 TS）。
- 新增文件与函数必须具备明确、语义化命名和模块内导出。

## 项目结构与模块化

- 路由：使用 expo-router（文件路由），采用 `/app` 目录结构。
- 页面与组件按 `app/` 文件路由组织；复用组件放入 `app/components/`。
- API 请求集中在 `app/lib/api.ts|js`（若不存在需创建）。
- 复杂 UI/业务逻辑拆分为自定义 hooks（`app/hooks/`）。
- 地图、拍照、定位等设备能力独立为模块，避免页面臃肿。
- 全局/跨页面状态使用 Zustand；避免把所有状态塞进顶层组件。

## API 交互约定

- Base URL：`https://comp2140a3.uqcloud.net/api`
- Header：`Content-Type: application/json`，`Prefer: return=representation`。
- 认证：在请求头加 `Authorization: Bearer <JWT_TOKEN>`。
- 责任：所有 POST/PATCH 请求体必须包含 `username` 字段。
- 错误：捕获非 2xx 响应，展示用户可理解的错误提示（Toast/Alert）。
- 教学优先：不写过度防御性代码，先保证功能跑通与可读性。
- 删除：调用 DELETE 时附加 `username=eq.{USERNAME}` 过滤，仅删除本人数据。

## 状态与数据

- 轻量采用 `useState`/`useEffect` 和自定义 hooks；避免过度全局状态。
- 表单/字段元数据与记录数据分离管理；避免重复请求与重复渲染。
- 列表分页或筛选请求使用服务端查询（遵循 PRD 的 JSONB 过滤）。
- 列表默认分页 `limit=20&offset=0`，支持翻页或下拉加载。

## 设备 API 与权限

- 使用 Expo 库：`expo-image-picker`/`expo-camera`/`expo-location`/`expo-clipboard`。
- 首次使用前检查权限；拒绝时给出下一步指引（设置权限或重试）。
- 图片仅存储 URI；严禁上传二进制到后端。

## 代码风格与可读性

- 变量/函数命名为完整英文单词，避免缩写；函数名用动词短语。
- 使用早返回减少嵌套；避免无意义 try/catch。
- 仅在必要处写注释（关键意图/边界/非显式约束），禁止冗余注释。
- UI 响应：加载、成功、失败三态反馈必须完整。
- 注释需中文且详细，并以 `// CN:` 开头（便于统一替换/删除）。

## 目录与文件命名

- 文件名小写短横线或驼峰，组件文件以大写开头（如 `FormList.tsx`）。
- 与页面直接关联的样式/常量/子组件放同级目录。

## 开发流程（AI 工具执行规范）

1. 读取 `doc/PRD.md` 与 `README.md` 作为真值来源。
2. 若要新增模块：先创建空的目录与占位文件，再逐步充实实现。
3. 每次编辑：
   - 同步更新/新增类型与注释；
   - 运行 Lint 并修复；
   - 保持最小可运行增量（不引入未使用代码）。
4. 涉及接口：先在 `api` 层补齐方法，再在页面调用。
5. 提交前：自查 API 头、`username` 字段与权限处理是否完整。

## 计划文档维护（plan.md）

- 位置：`doc/plan.md`。
- 目的：展示实施步骤、当前状态（已完成/进行中/待开始）。
- 要求：
  - 代理在实现过程中必须同步更新该文档（勾选、细化、重排、删减无效项）。
  - 不删除既有步骤文字，可在其后标注状态或补充说明。
  - 任何偏离 PRD 的重大改动需在 plan.md 标注原因与影响。

## UI/UX 准则

- 使用统一组件库：NativeWind，并尽量遵循 Apple Human Interface Guidelines。
- 导航清晰：支持回退；必要页面提供入口（Drawer/Tab/链接）。
- 表单校验明确：必填/类型错误需在界面提示。
- Filter Builder：线性 AND/OR（不支持括号）。
- 按钮样式规范：全局统一采用“胶囊形”按钮（rounded-full、py-3.5、居中、明确对比度），底部主操作按钮应适配安全区并留足底部间距。

## 安全

- JWT 不可写入源码；打印日志时避免输出敏感信息。
- 对异常与拒绝权限场景进行保护性处理，避免崩溃。

## 提交检查清单（AI 必检）

- 无 Lint 报错；新增文件通过类型检查。
- API 约定全部满足：Header、Bearer、username、Prefer。
- 设备权限与错误提示逻辑可用。
- 文档更新到位：若新增功能/脚手架，更新 `README.md`。

---

如需偏离本规则，必须在 PR/提交说明中阐明理由与影响范围。
