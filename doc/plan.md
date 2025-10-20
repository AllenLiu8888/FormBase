# FormBase 实施计划（可持续更新）

说明：本计划与 `doc/PRD.md` 对齐，用于跟踪从脚手架到功能完成的全过程。状态采用：已完成 / 进行中 / 待开始。

## 启动与基础

1. 阅读 Assessment Brief & Rubric（已完成）
2. 创建 Expo 应用（已完成）
3. 配置 expo-router 文件路由与基础导航骨架（进行中）
   - 建立 `/app` 目录、入口与基本页面（Home、About、Forms、FormDetail、Records、Map）
   - 引入 NativeWind 基础样式（遵循 Apple HIG 视觉）
4. 编写 API handler（待开始）
   - 统一 `app/lib/api.ts|js`：封装 GET/POST/PATCH/DELETE
   - 注入 `.env`（API_BASE_URL、JWT_TOKEN、USERNAME）
   - 提供 JSONB 过滤示例工具
5. 选择组件库与布局（已决定）
   - 组件库：NativeWind（遵循 Apple HIG）

## 业务功能

1. 表单（Forms）模块（待开始）
   - 列表我的表单（GET /form）
   - 新建/编辑/删除（POST /form，PATCH/DELETE /form?id=eq.{id}）
2. 字段（Fields）模块（待开始）
   - 在表单下增字段定义（GET /field?form_id=eq.{id}，POST /field）
   - 先打通1种字段到保存/渲染，再逐步扩展：text → multiline → dropdown → location → image
3. 记录（Records）列表（待开始）
   - 列表/删除（GET /record?form_id=eq.{id}，DELETE /record?id=eq.{id}&username=eq.{USERNAME}）
   - 分页：limit=20&offset=0；支持翻页/触底加载
   - 复制 JSON：列表项更多操作或详情页内
4. 地图（Map）模块（待开始）
   - expo-map-view 展示有 location 的记录（标记、点击气泡）
   - 无 location 字段给出提示
5. 筛选（Filter Builder）（待开始）
    - 线性 AND/OR，不支持括号分组
    - 构造 PostgREST 查询参数（如 values->>'category'=ilike.*Python*）

## 设备与权限

1. 设备能力（待开始）
    - image-picker/camera：仅存 URI
    - location：默认精度、拒绝仅提示
    - clipboard：复制 record.values 为字符串

## 质量与提交

1. 状态管理与数据（进行中）
    - 建立 Zustand store：user/token/form 缓存
2. 代码质量（进行中）
    - ESLint/Prettier 通过；注释以 `// CN:` 前缀，中文详细
3. 提交准备（待开始）
    - README 更新测试设备、GenAI 声明、资源来源
    - 打包时不包含 node_modules

备注：本文件将随进度持续更新（勾选、细化、重排）。
