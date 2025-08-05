# Pearl Digital 认证系统

## 概述

这是一个完整的用户认证系统，包含后端API和前端登录界面，支持JWT token认证和自动刷新机制。

## 功能特性

### 后端功能
- ✅ JWT Token认证（24小时过期）
- ✅ Refresh Token机制（7天过期）
- ✅ 用户角色管理（super_admin, admin, manager, operator）
- ✅ 密码加密存储
- ✅ 登录失败次数限制（5次后锁定30分钟）
- ✅ 用户状态管理（active, inactive, suspended）
- ✅ 完整的用户信息管理

### 前端功能
- ✅ 响应式登录界面
- ✅ 实时错误提示
- ✅ Token自动管理
- ✅ 自动刷新机制
- ✅ 用户信息显示
- ✅ 受保护路由
- ✅ 登出功能

## 数据库设置

### 1. 运行数据库初始化脚本

```sql
-- 运行 admin_users.sql 创建表结构
-- 运行 init_admin_users.sql 插入测试数据
```

### 2. 测试账号

| 用户名 | 密码 | 角色 | 部门 | 职位 |
|--------|------|------|------|------|
| pearl_admin_2025 | P@rlD1g1t@l2024! | super_admin | 技術部 | 系統管理員 |
| test_admin | P@rlD1g1t@l2024! | admin | 運營部 | 管理員 |
| manager_test | P@rlD1g1t@l2024! | manager | 客服部 | 部門經理 |
| operator_test | P@rlD1g1t@l2024! | operator | 客服部 | 客服專員 |

## API 接口

### 认证接口

#### 1. 用户登录
```
POST /auth/login
Content-Type: application/json

{
  "username": "pearl_admin_2025",
  "password": "P@rlD1g1t@l2024!"
}
```

响应：
```json
{
  "success": true,
  "message": "登入成功",
  "data": {
    "user": {
      "id": 1,
      "user_id": "AU20250101000001",
      "username": "pearl_admin_2025",
      "email": "admin@pearldigital.com",
      "full_name": "Pearl Digital 系統管理員",
      "role": "super_admin",
      "department": "技術部",
      "position": "系統管理員",
      "avatar": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400
  }
}
```

#### 2. 刷新Token
```
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. 验证Token
```
GET /auth/verify
Authorization: Bearer <token>
```

#### 4. 获取用户信息
```
GET /auth/profile
Authorization: Bearer <token>
```

#### 5. 用户登出
```
POST /auth/logout
Authorization: Bearer <token>
```

## 前端使用

### 1. 环境变量设置

在 `.env` 文件中设置API地址：

```env
REACT_APP_API_URL=http://localhost:3000
```

### 2. 使用认证上下文

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { isAuthenticated, userInfo, login, logout } = useAuth();
  
  // 使用认证状态
}
```

### 3. 使用受保护路由

```jsx
import ProtectedRoute from '../components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute requiredUserType="staff">
            <Dashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
```

### 4. 使用API服务

```jsx
import apiService from '../services/api';

// 发送认证请求
const data = await apiService.get('/auth/profile');

// 发送无需认证的请求
const loginData = await apiService.post('/auth/login', credentials, false);
```

## 安全特性

### 1. Token安全
- JWT Token 24小时过期
- Refresh Token 7天过期
- 自动刷新机制
- Token存储在数据库中，支持服务端撤销

### 2. 密码安全
- 密码哈希存储
- 登录失败次数限制
- 账户锁定机制

### 3. 用户管理
- 角色权限控制
- 用户状态管理
- 完整的审计日志

## 部署说明

### 1. 后端部署

1. 安装依赖：
```bash
cd pd-service
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt @types/bcrypt @types/passport-jwt
```

2. 设置环境变量：
```env
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=production
```

3. 启动服务：
```bash
npm run start:prod
```

### 2. 前端部署

1. 设置环境变量：
```env
REACT_APP_API_URL=https://your-api-domain.com
```

2. 构建项目：
```bash
npm run build
```

## 故障排除

### 常见问题

1. **Token过期错误**
   - 检查JWT_SECRET是否正确设置
   - 确认系统时间同步

2. **数据库连接错误**
   - 检查数据库配置
   - 确认数据库表已创建

3. **CORS错误**
   - 在后端添加CORS配置
   - 检查前端API地址设置

### 日志查看

```bash
# 查看后端日志
tail -f logs/app.log

# 查看数据库日志
tail -f logs/mysql.log
```

## 更新日志

### v1.0.0 (2025-01-01)
- ✅ 初始版本发布
- ✅ 完整的认证系统
- ✅ 前端登录界面
- ✅ Token管理机制
- ✅ 用户角色管理 