# Smile Test API 功能说明

## 概述
这个功能允许通过URL中的UUID来保存和获取微笑测试的数据，使用原有的数据库结构。

## 数据库结构
使用原有的smile_test表结构，主要字段包括：
- `id`: 主键ID
- `test_id`: 测试唯一标识符（自动生成）
- `uuid`: 随机UUID（用于URL参数）
- `full_name`: 姓名
- `birth_date`: 生日
- `phone`: 手机号码
- `email`: 电子邮箱
- `line_id`: LINE ID
- `city`: 城市
- `test_status`: 测试状态（pending, in_progress, completed, cancelled）
- 以及其他原有字段...

## API 接口

### 1. 通过UUID获取数据
```
GET /api/smile-test/uuid/:uuid
```

### 2. 通过Test ID获取数据
```
GET /api/smile-test/test-id/:testId
```

### 3. 创建数据
```
POST /api/smile-test
```

### 4. 通过UUID更新数据
```
PUT /api/smile-test/uuid/:uuid
```

### 5. 通过Test ID更新数据
```
PUT /api/smile-test/test-id/:testId
```

### 6. 通过UUID删除数据
```
DELETE /api/smile-test/uuid/:uuid
```

### 7. 通过Test ID删除数据
```
DELETE /api/smile-test/test-id/:testId
```

## 前端配置

### 1. 环境变量
在pd-web项目中创建`.env`文件：
```
REACT_APP_API_URL=http://localhost:3001
```

### 2. 使用方式
当用户访问`/upload`时，系统会：
1. 自动生成UUID并添加到URL：`/upload?id=xxxxx`
2. 从API获取该UUID对应的数据（如果存在）
3. 自动填充表单字段
4. 保存时更新数据库

## 数据流程

1. **用户访问** `/upload`
2. **生成UUID** 并更新URL为 `/upload?id=xxxxx`
3. **获取数据** 从API获取该UUID的数据
4. **填充表单** 如果数据存在，自动填充
5. **保存数据** 用户提交时保存到数据库
6. **更新状态** 记录当前测试状态

## 字段映射

前端表单字段与数据库字段的映射：
- `name` → `full_name`
- `birthday` → `birth_date`
- `lineId` → `line_id`
- 其他字段保持相同

## 文件结构

```
pd-service/
├── src/
│   ├── entities/
│   │   └── smile-test.entity.ts
│   ├── smile-test/
│   │   ├── smile-test.controller.ts
│   │   ├── smile-test.service.ts
│   │   └── smile-test.module.ts
│   └── app.module.ts
└── pd-db/
    └── smile_test.sql

pd-web/
├── src/
│   ├── services/
│   │   └── smileTestApi.js
│   └── upload/
│       ├── index.jsx
│       └── step1.jsx
└── .env
```

## 启动步骤

1. **启动后端服务**
```bash
cd pd-service
npm install
npm run start:dev
```

2. **启动前端服务**
```bash
cd pd-web
npm install
npm start
```

3. **访问测试**
访问 `http://localhost:3001/upload` 查看效果

## 注意事项

- 使用原有的数据库结构，不修改现有字段
- 通过UUID进行数据操作，保持向后兼容
- 支持软删除（is_deleted字段）
- 自动生成test_id和uuid
- API路径包含`/api`前缀 