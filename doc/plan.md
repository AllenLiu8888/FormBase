# FormBase 实施计划（可持续更新）

说明：本计划与 `doc/PRD.md` 对齐，用于跟踪从脚手架到功能完成的全过程。状态采用：已完成 / 进行中 / 待开始。

## 启动与基础

1. 阅读 Assessment Brief & Rubric（已完成）
2. 创建 Expo 应用（已完成）
3. 配置 expo-router 文件路由与基础导航骨架（已完成）
   - 建立 `/app` 目录、入口与基本页面（Home、About、Forms、FormDetail、Records、Map）
   - 顶部标题与自定义返回、底部 Root 导航栏与表单内 TabBar（统一样式）
   - 引入 NativeWind 基础样式（遵循 Apple HIG 视觉）
4. 编写 API handler（已完成）
   - 统一 `src/lib/api.js`：封装 GET/POST/PATCH/DELETE
   - Expo extra 注入 `.env`（API_BASE_URL、JWT_TOKEN、USERNAME）
   - JSONB 过滤工具 `buildJsonbFilterQuery`
5. 选择组件库与布局（已决定）
   - 组件库：NativeWind（遵循 Apple HIG）

## 业务功能（与 rubric 对齐）

1. 表单（Forms）模块（已完成）
   - 列表/新增/编辑/删除（DELETE 附带 username 过滤）
2. 字段（Fields）模块（已完成）
   - 支持新增四类字段：text、multiline、dropdown、location
   - 支持 required / is_num；dropdown 以逗号分隔，保存至 `options` jsonb（{ dropdown: [..] }）
3. 表单录入（Records 录入渲染）（已完成）
   - 按字段动态渲染输入：text、multiline、dropdown、location（expo-location 获取经纬度并存为 json）
   - 必填与数值校验，失败提示（rubric 1.5）
   - 统一弹窗 `FormSheet` + 可配置 schema 渲染（input/select/multiline/location/checkbox 对）
4. 记录（Records）列表（已完成）
   - 列表/删除（DELETE 附带 username 过滤）
   - 分页：limit=20 & offset；复制 JSON 到剪贴板（rubric 1.6 + 2.3）
5. 地图（Map）模块（已完成）
   - react-native-maps 渲染 location 记录与气泡详情；无 location 字段时隐藏 Map 标签（rubric 2.2）
6. 筛选（Filter Builder）（已完成）
   - 线性 AND/OR（不支持括号），外层全局 Join 控制
   - Operator 文字映射（equals/greater than/.../contains）→ PostgREST（eq/gt/.../ilike）
   - 按字段类型动态显示运算符；多条 criteria 可删除；顶部卡片展示

## 设备与权限

1. 设备能力（已完成）
    - image-picker/camera：选择/拍照并存 URI（rubric 2.1）
    - location：expo-location 获取当前坐标（rubric 1.5/2.2）
    - clipboard：复制 record.values 为字符串（rubric 2.3）

## 质量与提交

1. 状态管理与数据（已完成/持续）
    - 建立 Zustand store：user/token/form/field 缓存与 actions
2. 代码质量（进行中）
    - ESLint/Prettier 通过；注释以 `// CN:` 前缀，中文详细
3. 提交准备（待开始）
    - README 更新测试设备、GenAI 声明、资源来源
    - 打包时不包含 node_modules

备注：本文件将随进度持续更新（勾选、细化、重排）。
