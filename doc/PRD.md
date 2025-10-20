# 📱 FormBase React Native App — 产品需求文档 (Final PRD)

* `COMP2140_7240_ReactNative_Brief_V1.pdf`（项目简报）
* `COMP2140_7240_ReactNative_Rubric_V1.pdf`（评分标准）
* `COMP2140_7240_ReactNative_RESTFul_API.pdf`（API 文档）
* `example api file`（带 fetch 示例的 JS 脚本）

并进行了全方位校对。
本版本确保：

* ✅ 评分标准每一项均有对应实现方案
* ✅ 所有 API 字段、headers、filters 完全符合文档要求
* ✅ 包含安全、UI、数据流、交互、非功能性、提交要求等所有 rubrics 内容
* ✅ 使用 Markdown 完整结构，可直接复制保存为 `FormBase_PRD.md`

---
**课程：** COMP2140 / 7240 Web & Mobile Programming  
**项目类型：** 标准项目（FormBase）  
**框架：** React Native + Expo  
**评分比重：** 20%（另有 12% 为 Demo & Code Review）  
**版本：** v3.2（对齐 Brief + Rubric + RESTful API 文档 + 示例代码）

---

## 🧭 1. 项目概述

**FormBase** 是一个基于 **React Native + Expo** 的移动端原型应用，用于让用户自由创建、管理并可视化自定义表单数据。  
该项目旨在评估学生在 **前端开发、API 交互、UI 设计与设备集成** 方面的综合能力。

---

## 🎯 2. 项目目标

| 目标类型 | 说明 |
|-----------|------|
| **功能性目标** | 允许用户创建表单、添加字段、录入记录、筛选数据并在地图中展示 |
| **技术目标** | 展示 React Native + Expo、RESTful API、设备 API 的综合运用 |
| **教学目标** | 检验学生在状态管理、导航、代码结构、错误处理和模块化设计方面的掌握 |
| **体验目标** | 提供一致、清晰、可操作的用户体验（UX） |

---

## 🔗 3. 技术架构与依赖

### 3.1 技术栈

* **前端框架：** React Native + Expo
* **状态管理：** useState / useEffect / 自定义 hooks / Zustand
* **导航：** expo-router（文件路由，采用 /app 目录结构）
* **UI 库：** NativeWind（遵循 Apple Human Interface Guidelines 样式）
* **地图组件：** expo-map-view（固定选择）
* **图片与设备 API：** expo-image-picker, expo-camera, expo-location, expo-clipboard
* **后端：** PostgREST API (由课程提供)
* **认证方式：** JWT Token

---

## 🔐 4. API 交互规范

### 4.1 基本设置

```js
// 推荐：从 .env 读取而非硬编码（示例在文末 .env 模板）
const API_BASE_URL = process.env.API_BASE_URL;
const JWT_TOKEN = process.env.JWT_TOKEN;
const USERNAME = process.env.USERNAME;
```

### 4.2 通用请求格式

```js
headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${JWT_TOKEN}`,
  Prefer: "return=representation"
}
```

### 4.3 数据安全

* 所有请求都必须带上 `Authorization: Bearer <JWT_TOKEN>`
* 每次 POST / PATCH 请求体中都必须包含 `"username": USERNAME`
* JWT 来源：Blackboard → My Grades → A2 Feedback → JSON Web Token
* 不得将 Token 硬编码在公共代码中，建议放置在 `.env` 文件或常量文件中

---

## 🧱 5. 数据模型定义

| 资源         | 表名        | 关键字段                                                                            | 描述        |
| ---------- | --------- | ------------------------------------------------------------------------------- | --------- |
| **Form**   | `/form`   | id, name, description, username                                                 | 用户定义的表单结构 |
| **Field**  | `/field`  | id, form_id, name, field_type, options, required, is_num, order_index, username | 每个表单的字段定义 |
| **Record** | `/record` | id, form_id, values (JSONB), username                                           | 用户录入的数据记录 |

### 5.1 JSONB 字段结构

* Field 下拉选项：

```json
{"choices": ["Option1", "Option2", "Option3"]}
```

* Record 数据内容：

```json
{
  "name": "Alice",
  "age": 35,
  "photo": "file:///data/user/0/app/image.jpg",
  "location": {"lat": -27.47, "long": 153.02}
}
```

---

## 🧩 6. 功能模块设计

### 6.1 应用导航结构（expo-router）

```text
/app
 ├── index.js               → Home / Welcome Screen
 ├── about.js               → About Screen
 ├── forms/
 │   ├── index.js           → My Forms List
 │   ├── [id].js            → Form Detail / Add Fields
 │   ├── [id]/records.js    → Records List & Filter Builder
 │   ├── [id]/map.js        → Map Visualization
 └── components/            → Reusable UI Components
```

**要求：**

* 导航基于 expo-router 文件路由结构（入口由 `index.js` 切换为 `expo-router` 规范）
* 提供全局导航菜单或 Drawer
* 页面间跳转逻辑清晰且可回退

---

### 6.2 My Forms 模块

* **功能：**

  * 列出当前用户的所有表单
  * 添加 / 编辑 / 删除表单
* **API：**

  * `GET /form`
  * `POST /form`
  * `PATCH /form?id=eq.{id}`
  * `DELETE /form?id=eq.{id}`
* **字段要求：**

  * name（必填）
  * description（可选）

---

### 6.3 Field 模块

* **功能：**

  * 为特定表单添加字段定义
* **API：**

  * `GET /field?form_id=eq.{id}`
  * `POST /field`
* **字段类型：**

  * text
  * multiline
  * dropdown (options 存储 JSON)
  * location
  * image / camera
* **字段示例：**

```json
{
  "form_id": 5,
  "name": "category",
  "field_type": "dropdown",
  "required": true,
  "options": {"choices": ["JavaScript", "Python", "C++"]},
  "is_num": false,
  "order_index": 1
}
```

---

### 6.4 Record 模块

* **功能：**

  * 自动渲染数据录入界面
  * 校验必填项与数字字段
  * 提交数据到 `/record`
  * 删除记录
* **API：**

  * `GET /record?form_id=eq.{id}`
  * `POST /record`
  * `DELETE /record?id=eq.{id}`
* **格式示例：**

```json
{
  "form_id": 5,
  "values": {
    "title": "Fluent Python",
    "category": "Python",
    "price": 60,
    "photo": "file:///data/user/0/app/photo.jpg",
    "location": {"lat": -27.47, "long": 153.02}
  }
}
```

---

### 6.5 Filter Builder 模块

* **目的：** 根据 JSONB 字段过滤记录
* **API：**

  ```text
  GET /record?form_id=eq.{id}&values->>'category'=ilike.*Python*&values->'price'=gt.50
  ```
  
* **功能：**

  * 支持多条件过滤（AND / OR，线性逻辑，不支持括号分组）
  * 根据字段类型自动显示比较操作符：

    * 数值型：=, >, <, >=, <=
    * 文本型：equals, contains, startswith
  * UI 上可动态添加条件行

---

### 6.6 Map 模块

* **功能：**

  * 显示包含地理字段（location）的记录
  * 使用 React Native Maps 展示标记
  * 点击 Marker 显示详情卡片（含图片与坐标）
* **条件：**

  * 若表单未包含 location 字段 → 显示提示信息
  * 支持缩放、拖动、点击事件

---

## ⚙️ 7. 设备 API 集成

| 功能       | 模块                   | Expo 库                            |
| -------- | -------------------- | --------------------------------- |
| 图像选择/拍照  | ImagePicker / Camera | expo-image-picker / expo-camera   |
| 地理定位     | 获取经纬度                | expo-location                     |
| 地图显示     | 标记与展示                | react-native-maps / expo-map-view |
| 复制为 JSON | Clipboard 复制         | expo-clipboard                    |

**附加要求：**

* 图片仅保存路径（URI），不上传二进制内容
* 定位需提前请求权限，否则提示用户授权

---

## 🧠 8. 数据交互流程

1. **初始化**

   * 从 `.env` 读取 JWT_TOKEN & USERNAME
   * 初始化 API 工具函数
   * 初始化 Zustand store（全局 user/token/form cache）

1. **创建表单**

  ```js
  apiRequest("/form", "POST", { name, description });
  ```
  
1. **添加字段**

  ```js
  apiRequest("/field", "POST", { form_id, name, field_type, required });
  ```
  
1. **添加记录**

  ```js
  apiRequest("/record", "POST", { form_id, values });
  ```
  
1. **过滤记录**

  ```js
  /record?form_id=eq.{id}&values->>'category'=ilike.*Python*
  ```
  
1. **分页加载**

   * 列表请求默认 `limit=20&offset=0`，支持翻页或下拉加载
  
1. **地图展示**

   * 提取含 location 的记录
   * 在地图上渲染 markers
1. **复制 JSON**

   * 使用 `expo-clipboard` 将 record.values 复制为字符串

---

## 🧩 9. 错误处理与安全

| 层级       | 策略                              |
| -------- | ------------------------------- |
| **网络错误** | 捕获非 2xx 状态，显示 Toast 提示          |
| **认证失败** | 检测 JWT 失效并提示用户重新获取              |
| **数据错误** | 在界面上显示“字段必填 / 类型错误”警告           |
| **离线状态** | 显示“Unable to connect to API” 提示 |
| **权限错误** | Camera / Location 权限检查与说明（定位默认精度，拒绝仅提示） |

---

## 🎨 10. UI/UX 设计要求

| 评分项      | 要求                      |
| -------- | ----------------------- |
| **一致性**  | 使用统一色彩方案与排版（NativeWind，遵循 Apple HIG） |
| **可导航性** | 全局 Drawer / Tab 明确入口    |
| **响应性**  | 适配移动端，界面平滑无卡顿           |
| **清晰提示** | 每个操作反馈明确（加载中 / 成功 / 错误） |

**组件库：** NativeWind（Tailwind 风格，落地 Apple HIG）

---

## 🧾 11. 代码结构与质量要求

* 模块化组织（components / hooks / screens）
* 所有 API 操作抽离到 `api.js`（或 `app/lib/api.ts|js`）
* 全局/跨页面状态优先使用 Zustand 管理
* 避免重复逻辑，提取共用表单组件
* 注释风格：详细中文注释，以 `// CN:` 开头，便于统一替换/删除
* 遵守 ESLint / Prettier 格式化规范
* iOS 优先设计与验证（Apple HIG），Android 暂不考虑

---

## ⚙️ 12. 非功能性需求

| 类别   | 要求                          |
| ---- | --------------------------- |
| 性能   | 数据加载与地图渲染应流畅                |
| 可维护性 | 组件职责单一，文件命名规范               |
| 安全性  | JWT 不可硬编码                   |
| 可移植性 | 可在 Expo Go (Android/iOS) 运行 |
| 国际化  | 统一英文 UI                     |
| 可访问性 | 文本对比度与按钮尺寸符合移动标准            |

---

## 📦 13. 提交要求

* 文件名格式：

  ```text
  s1234567_Firstname_Lastname_ReactNative.zip
  ```

* 内容包含：

  * 源代码（不含 node_modules）
  * `Readme.md`（包含以下信息）：

    * ✅ GenAI 工具使用声明（如 ChatGPT 协助调试）
    * ✅ 测试设备或模拟器版本说明
    * ✅ 若自定义使用第三方资源，需注明来源
    * ✅ 删除记录需附 `username=eq.{USERNAME}` 过滤（仅操作本人数据）
* **禁止抄袭 / AI 未声明使用**
* **违反即视为学术不端**

---

## 🧮 14. 评分映射表（与 Rubric 一致）

| Rubric 类别                 | 内容                 | 分值                |
| ------------------------- | ------------------ | ----------------- |
| **1. Core Functionality** | 表单、字段、记录、筛选、地图完整功能 | 55                |
| **2. Device APIs**        | 相机 / 图片 / 定位 / 剪贴板 | 15                |
| **3. UI/UX Design**       | 一致性、导航性、交互清晰       | 15                |
| **4. Code Quality**       | 模块化、错误处理、注释规范      | 15                |
| **总分**                    | —                  | **100（占课程成绩20%）** |

---

## ✅ 15. 一句话总结

> **FormBase** 是一个基于 JWT 授权与 RESTful API 的移动端表单系统，
> 实现从表单创建 → 字段定义 → 数据录入 → 筛选与地图可视化的完整交互闭环，
> 需兼顾功能完整性、设备集成、安全性与代码规范性，以满足 Rubric 全部评分标准。
