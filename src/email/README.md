# 邮件服务

## 概述

邮件服务为PD应用提供完整的邮件发送功能，支持模板邮件、附件、批量发送等功能。

## 功能特性

- ✅ 发送普通邮件
- ✅ 模板邮件支持
- ✅ 附件支持
- ✅ 批量发送
- ✅ 多种邮件类型（欢迎、注册、支付确认等）
- ✅ 邮件服务状态检查
- ✅ 错误处理和日志记录

## 环境配置

### 必需的环境变量

```bash
# SMTP配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SECURE=false

# 发件人配置
FROM_EMAIL=your-email@gmail.com
FROM_NAME=PD Dental Services
```

### 支持的SMTP服务商

1. **Gmail**
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   ```

2. **QQ邮箱**
   ```bash
   SMTP_HOST=smtp.qq.com
   SMTP_PORT=587
   SMTP_SECURE=false
   ```

3. **163邮箱**
   ```bash
   SMTP_HOST=smtp.163.com
   SMTP_PORT=25
   SMTP_SECURE=false
   ```

4. **企业邮箱**
   ```bash
   SMTP_HOST=your-smtp-server.com
   SMTP_PORT=587
   SMTP_SECURE=false
   ```

## API 接口

### 1. 发送邮件

```http
POST /api/email/send
Content-Type: application/json

{
  "to": ["recipient@example.com"],
  "subject": "邮件主题",
  "html": "<h1>邮件内容</h1>",
  "text": "纯文本内容",
  "cc": ["cc@example.com"],
  "bcc": ["bcc@example.com"]
}
```

### 2. 发送测试邮件

```http
POST /api/email/test
Content-Type: application/json

{
  "to": "test@example.com"
}
```

### 3. 发送欢迎邮件

```http
POST /api/email/welcome
Content-Type: application/json

{
  "to": "user@example.com",
  "name": "张三",
  "clinicName": "阳光牙科诊所"
}
```

### 4. 发送牙医注册确认邮件

```http
POST /api/email/dentist-registration
Content-Type: application/json

{
  "to": "dentist@example.com",
  "fullName": "李医生",
  "clinicName": "仁心牙科诊所",
  "phone": "0912345678",
  "applicationId": "APP_2024001"
}
```

### 5. 发送支付确认邮件

```http
POST /api/email/payment-confirmation
Content-Type: application/json

{
  "to": "patient@example.com",
  "patientName": "王患者",
  "amount": "1000.00",
  "currency": "TWD",
  "treatmentType": "牙齿矫正",
  "paymentId": "PAY_123456",
  "date": "2024-01-01"
}
```

### 6. 发送预约确认邮件

```http
POST /api/email/appointment-confirmation
Content-Type: application/json

{
  "to": "patient@example.com",
  "patientName": "王患者",
  "dentistName": "李医生",
  "appointmentDate": "2024-01-15",
  "appointmentTime": "14:00",
  "clinicName": "仁心牙科诊所",
  "clinicAddress": "台北市信义区信义路五段7号",
  "appointmentId": "APT_789012"
}
```

### 7. 发送密码重置邮件

```http
POST /api/email/password-reset
Content-Type: application/json

{
  "to": "user@example.com",
  "name": "张三",
  "resetLink": "https://example.com/reset?token=abc123",
  "expiryTime": "24小时"
}
```

### 8. 发送通知邮件

```http
POST /api/email/notification
Content-Type: application/json

{
  "to": "user@example.com",
  "title": "系统维护通知",
  "message": "系统将于今晚进行维护，预计维护时间2小时。",
  "actionUrl": "https://example.com/maintenance",
  "actionText": "查看详情"
}
```

### 9. 批量发送邮件

```http
POST /api/email/bulk
Content-Type: application/json

{
  "recipients": ["user1@example.com", "user2@example.com"],
  "subject": "批量通知",
  "html": "<h1>批量邮件内容</h1>",
  "template": "notification",
  "templateData": {
    "title": "批量通知",
    "message": "这是一封批量发送的邮件"
  }
}
```

### 10. 检查邮件服务状态

```http
GET /api/email/status
```

## 邮件模板

### 支持的模板

1. **welcome.html** - 欢迎邮件
2. **dentist-registration.html** - 牙医注册确认
3. **payment-confirmation.html** - 支付确认
4. **appointment-confirmation.html** - 预约确认
5. **password-reset.html** - 密码重置
6. **notification.html** - 通用通知

### 模板变量

模板使用 `{{变量名}}` 格式的变量：

```html
<h1>欢迎 {{name}}！</h1>
<p>您的诊所：{{clinicName}}</p>
```

### 创建自定义模板

1. 在 `src/email/templates/` 目录下创建 `.html` 文件
2. 使用 `{{变量名}}` 定义变量
3. 在代码中使用 `template` 参数指定模板名称

## 使用示例

### 前端集成

```javascript
// 发送测试邮件
const sendTestEmail = async (email) => {
  const response = await fetch('/api/email/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: email })
  });
  return response.json();
};

// 发送欢迎邮件
const sendWelcomeEmail = async (email, name, clinicName) => {
  const response = await fetch('/api/email/welcome', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: email, name, clinicName })
  });
  return response.json();
};
```

### 后端集成

```typescript
// 在服务中注入EmailService
constructor(private readonly emailService: EmailService) {}

// 发送邮件
async sendWelcomeEmail(userEmail: string, userName: string) {
  return this.emailService.sendWelcomeEmail(userEmail, {
    name: userName,
    clinicName: '阳光牙科诊所'
  });
}
```

## 错误处理

### 常见错误

- `400 Bad Request` - 邮件配置错误或参数无效
- `500 Internal Server Error` - SMTP连接失败

### 错误响应格式

```json
{
  "statusCode": 400,
  "message": "Failed to send email",
  "error": "Bad Request"
}
```

## 安全注意事项

1. **SMTP凭据安全**
   - 使用环境变量存储SMTP密码
   - 定期更换应用密码
   - 不要硬编码凭据

2. **邮件内容安全**
   - 验证收件人邮箱格式
   - 防止邮件注入攻击
   - 限制邮件发送频率

3. **隐私保护**
   - 不要在邮件中暴露敏感信息
   - 使用BCC发送批量邮件
   - 遵守邮件隐私法规

## 测试

### 测试邮件发送

```bash
# 测试邮件服务状态
curl -X GET http://localhost:3001/api/email/status

# 发送测试邮件
curl -X POST http://localhost:3001/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com"}'

# 发送欢迎邮件
curl -X POST http://localhost:3001/api/email/welcome \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "name": "张三",
    "clinicName": "阳光牙科诊所"
  }'
```

### 测试模板

```bash
# 测试牙医注册邮件
curl -X POST http://localhost:3001/api/email/dentist-registration \
  -H "Content-Type: application/json" \
  -d '{
    "to": "dentist@example.com",
    "fullName": "李医生",
    "clinicName": "仁心牙科诊所",
    "phone": "0912345678",
    "applicationId": "APP_2024001"
  }'
```

## 监控和日志

### 日志记录

服务会记录以下信息：
- 邮件发送成功/失败
- SMTP连接状态
- 错误详情
- 发送统计

### 监控指标

- 邮件发送成功率
- 平均发送时间
- 错误率
- SMTP连接状态

## 故障排除

### 常见问题

1. **SMTP认证失败**
   - 检查用户名和密码
   - 确认SMTP设置正确
   - 检查防火墙设置

2. **邮件发送失败**
   - 检查收件人邮箱格式
   - 确认SMTP服务器可访问
   - 查看错误日志

3. **模板渲染错误**
   - 检查模板文件是否存在
   - 验证模板变量格式
   - 确认模板语法正确

## 更新日志

### v1.0.0
- 初始版本
- 支持基本邮件发送
- 模板邮件支持
- 多种邮件类型
- 批量发送功能 