# PayPal 支付服务

## 概述

PayPal支付服务为PD应用提供完整的支付解决方案，包括支付创建、捕获、退款、Webhook处理等功能。

## 功能特性

- ✅ 创建支付订单
- ✅ 捕获支付
- ✅ 获取支付详情
- ✅ 退款处理
- ✅ Webhook事件处理
- ✅ 支付历史查询
- ✅ 订单取消
- ✅ 签名验证

## 环境配置

### 必需的环境变量

```bash
# PayPal API配置
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_ENVIRONMENT=sandbox  # 或 'live'
PAYPAL_WEBHOOK_ID=your_webhook_id
```

### 获取PayPal凭据

1. 登录 [PayPal开发者中心](https://developer.paypal.com/)
2. 创建应用获取Client ID和Client Secret
3. 配置Webhook URL: `https://your-domain.com/api/paypal/webhook`

## API 接口

### 1. 创建支付订单

```http
POST /api/paypal/create-payment
Content-Type: application/json

{
  "amount": 100.00,
  "currency": "USD",
  "description": "牙科治疗费用",
  "returnUrl": "https://your-domain.com/payment/success",
  "cancelUrl": "https://your-domain.com/payment/cancel",
  "customId": "ORDER_123",
  "dentistId": "DENTIST_001",
  "patientId": "PATIENT_001",
  "treatmentId": "TREATMENT_001"
}
```

**响应示例:**
```json
{
  "success": true,
  "message": "Payment order created successfully",
  "data": {
    "id": "EC-1234567890",
    "status": "CREATED",
    "links": [
      {
        "href": "https://www.sandbox.paypal.com/checkoutnow?token=EC-1234567890",
        "rel": "approve",
        "method": "GET"
      }
    ]
  }
}
```

### 2. 捕获支付

```http
POST /api/paypal/capture-payment/{orderId}
```

**响应示例:**
```json
{
  "success": true,
  "message": "Payment captured successfully",
  "data": {
    "id": "EC-1234567890",
    "status": "COMPLETED",
    "amount": {
      "total": "100.00",
      "currency": "USD"
    },
    "create_time": "2024-01-01T00:00:00Z"
  }
}
```

### 3. 获取支付详情

```http
GET /api/paypal/payment/{orderId}
```

### 4. 退款

```http
POST /api/paypal/refund
Content-Type: application/json

{
  "paymentId": "CAPTURE_ID",
  "amount": 50.00,
  "reason": "部分退款"
}
```

### 5. 获取支付历史

```http
GET /api/paypal/history?page=1&pageSize=20&startDate=2024-01-01&endDate=2024-01-31
```

### 6. 取消支付订单

```http
POST /api/paypal/cancel/{orderId}
Content-Type: application/json

{
  "reason": "用户取消"
}
```

### 7. 获取配置信息

```http
GET /api/paypal/config
```

## Webhook 事件

### 支持的事件类型

- `PAYMENT.CAPTURE.COMPLETED` - 支付完成
- `PAYMENT.CAPTURE.DENIED` - 支付被拒绝
- `PAYMENT.CAPTURE.REFUNDED` - 支付退款
- `CHECKOUT.ORDER.APPROVED` - 订单批准
- `CHECKOUT.ORDER.CANCELLED` - 订单取消

### Webhook URL

```
POST https://your-domain.com/api/paypal/webhook
```

## 数据库表结构

### payment_records 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| uuid | CHAR(36) | 随机UUID |
| paypal_order_id | VARCHAR(100) | PayPal订单ID |
| paypal_payment_id | VARCHAR(100) | PayPal支付ID |
| paypal_capture_id | VARCHAR(100) | PayPal捕获ID |
| status | VARCHAR(50) | 支付状态 |
| amount | DECIMAL(10,2) | 支付金额 |
| currency | VARCHAR(10) | 货币类型 |
| description | VARCHAR(500) | 支付描述 |
| custom_id | VARCHAR(100) | 自定义ID |
| dentist_id | VARCHAR(100) | 牙医ID |
| patient_id | VARCHAR(100) | 患者ID |
| treatment_id | VARCHAR(100) | 治疗ID |
| refund_id | VARCHAR(100) | 退款ID |
| refund_amount | DECIMAL(10,2) | 退款金额 |
| refund_reason | VARCHAR(500) | 退款原因 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

## 使用示例

### 前端集成

```javascript
// 创建支付
const createPayment = async (paymentData) => {
  const response = await fetch('/api/paypal/create-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData)
  });
  return response.json();
};

// 处理支付成功
const handlePaymentSuccess = async (orderId) => {
  const response = await fetch(`/api/paypal/capture-payment/${orderId}`, {
    method: 'POST'
  });
  return response.json();
};
```

### 支付流程

1. **创建支付订单**
   ```javascript
   const payment = await createPayment({
     amount: 100.00,
     currency: 'USD',
     description: '牙科治疗费用',
     returnUrl: 'https://your-domain.com/success',
     cancelUrl: 'https://your-domain.com/cancel'
   });
   ```

2. **重定向到PayPal**
   ```javascript
   const approveUrl = payment.data.links.find(link => link.rel === 'approve').href;
   window.location.href = approveUrl;
   ```

3. **处理支付结果**
   ```javascript
   // 在returnUrl页面处理
   const urlParams = new URLSearchParams(window.location.search);
   const orderId = urlParams.get('token');
   
   if (orderId) {
     const result = await handlePaymentSuccess(orderId);
     if (result.success) {
       // 支付成功
       console.log('Payment completed:', result.data);
     }
   }
   ```

## 错误处理

### 常见错误

- `401 Unauthorized` - PayPal认证失败
- `400 Bad Request` - 请求参数错误
- `404 Not Found` - 订单不存在
- `422 Unprocessable Entity` - 支付状态不允许操作

### 错误响应格式

```json
{
  "statusCode": 400,
  "message": "Failed to create payment order",
  "error": "Bad Request"
}
```

## 安全注意事项

1. **环境变量安全**
   - 不要在代码中硬编码PayPal凭据
   - 使用环境变量管理敏感信息
   - 定期轮换Client Secret

2. **Webhook安全**
   - 验证Webhook签名
   - 使用HTTPS
   - 检查事件来源

3. **数据安全**
   - 加密敏感数据
   - 记录所有支付操作
   - 定期备份支付记录

## 测试

### 沙盒环境

```bash
# 设置环境变量
export PAYPAL_ENVIRONMENT=sandbox
export PAYPAL_CLIENT_ID=your_sandbox_client_id
export PAYPAL_CLIENT_SECRET=your_sandbox_client_secret

# 测试支付创建
curl -X POST http://localhost:3001/api/paypal/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10.00,
    "currency": "USD",
    "description": "测试支付",
    "returnUrl": "http://localhost:3000/success",
    "cancelUrl": "http://localhost:3000/cancel"
  }'
```

### 生产环境

1. 切换到生产环境
2. 使用真实的PayPal凭据
3. 配置生产Webhook URL
4. 测试所有支付流程

## 监控和日志

### 日志记录

服务会记录以下信息：
- 支付创建和状态变更
- Webhook事件处理
- 错误和异常
- API调用统计

### 监控指标

- 支付成功率
- 平均响应时间
- 错误率
- Webhook处理状态

## 故障排除

### 常见问题

1. **认证失败**
   - 检查Client ID和Secret
   - 确认环境设置正确

2. **Webhook不工作**
   - 验证Webhook URL可访问
   - 检查签名验证
   - 查看服务器日志

3. **支付状态不一致**
   - 检查数据库记录
   - 验证PayPal订单状态
   - 重新同步数据

## 更新日志

### v1.0.0
- 初始版本
- 支持基本支付功能
- Webhook事件处理
- 数据库集成 