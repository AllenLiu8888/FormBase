# FormBase (React Native + Expo)

一个基于 React Native + Expo 的表单系统前端（Assignment 3），对接已提供的 PostgREST 后端 API，支持表单、字段、记录、筛选与地图可视化。

## 快速开始

1. 安装依赖

   ```bash
   npm install
   ```

2. 本地开发（Expo）

   ```bash
   npm run start
   # 或
   npm run ios
   npm run android
   npm run web
   ```

3. 环境变量

   在项目根目录创建 `.env`（或使用你偏好的安全存储方案），并提供：

   ```bash
   API_BASE_URL=https://comp2140a3.uqcloud.net/api
   JWT_TOKEN=你的JWT
   USERNAME=s1234567
   ```

   注意：切勿在公开仓库硬编码或提交 JWT。

## 功能概要

- 表单管理：创建、编辑、删除（/form）
- 字段管理：为表单添加字段定义（/field）
- 记录管理：录入、删除、列表与筛选（/record）
- Filter Builder：基于 JSONB 的条件筛选
- 地图：基于 location 字段的记录可视化
- 设备 API：相机/图片、定位、剪贴板

详细需求与评分要求见 `doc/PRD.md`。

## 目录结构（目标）

```text
/app
 ├── index.js               → Home / Welcome
 ├── about.js               → About
 ├── forms/
 │   ├── index.js           → My Forms List
 │   ├── [id].js            → Form Detail / Add Fields
 │   ├── [id]/records.js    → Records List & Filter Builder
 │   ├── [id]/map.js        → Map Visualization
 └── components/            → Reusable UI Components
```

## API 约定

- 所有请求携带 `Authorization: Bearer <JWT_TOKEN>`
- 所有 POST/PATCH 请求体包含 `username: USERNAME`
- Header 建议：`Content-Type: application/json`，`Prefer: return=representation`

## 提交与声明

- 提交包不含 `node_modules`
- 在 `Readme.md` 中附：
  - GenAI 工具使用声明
  - 测试设备/模拟器版本
  - 第三方资源来源

更多细节请参见 `doc/PRD.md`。
