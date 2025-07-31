# PDF生成服务

## 概述

PDF生成服务为PD应用提供完整的PDF文档生成功能，支持发票、治疗计划、医疗报告、预约确认等多种文档类型。

## 功能特性

- ✅ 发票PDF生成
- ✅ 治疗计划PDF生成
- ✅ 医疗报告PDF生成
- ✅ 预约确认PDF生成
- ✅ 自定义模板PDF生成
- ✅ HTML预览功能
- ✅ PDF文件保存
- ✅ 多种页面格式支持
- ✅ 自定义页边距
- ✅ 页眉页脚支持

## 环境配置

### 必需的环境变量

```bash
# PDF输出路径
PDF_OUTPUT_PATH=./pdfs

# PDF模板路径
PDF_TEMPLATES_PATH=./src/pdf/templates

# PDF资源路径
PDF_ASSETS_PATH=./src/pdf/assets

# 水印文本
PDF_WATERMARK_TEXT=PD Dental Services

# 公司信息
COMPANY_NAME=PD Dental Services
COMPANY_ADDRESS=台北市信义区信义路五段7号
COMPANY_PHONE=+886 2 1234 5678
COMPANY_EMAIL=info@pd-dental.com
```

## API 接口

### 1. 生成发票PDF

```http
POST /api/pdf/invoice
Content-Type: application/json

{
  "invoiceNumber": "INV-2024-001",
  "invoiceDate": "2024-01-01",
  "dueDate": "2024-01-31",
  "patientName": "张三",
  "patientEmail": "zhangsan@example.com",
  "patientPhone": "0912345678",
  "patientAddress": "台北市信义区信义路五段7号",
  "dentistName": "李医生",
  "clinicName": "阳光牙科诊所",
  "clinicAddress": "台北市信义区信义路五段7号",
  "items": [
    {
      "description": "牙齿检查",
      "quantity": 1,
      "unitPrice": 500,
      "amount": 500
    },
    {
      "description": "洗牙",
      "quantity": 1,
      "unitPrice": 800,
      "amount": 800
    }
  ],
  "subtotal": 1300,
  "tax": 65,
  "total": 1365,
  "notes": "请按时付款"
}
```

### 2. 生成治疗计划PDF

```http
POST /api/pdf/treatment-plan
Content-Type: application/json

{
  "patientName": "张三",
  "patientId": "PAT-001",
  "patientEmail": "zhangsan@example.com",
  "patientPhone": "0912345678",
  "patientAddress": "台北市信义区信义路五段7号",
  "dentistName": "李医生",
  "clinicName": "阳光牙科诊所",
  "planDate": "2024-01-01",
  "treatments": [
    {
      "treatmentType": "牙齿矫正",
      "description": "使用隐形牙套进行牙齿矫正",
      "estimatedCost": 50000,
      "duration": "18个月",
      "priority": "high"
    }
  ],
  "totalEstimatedCost": 50000,
  "notes": "请按计划进行治疗"
}
```

### 3. 生成医疗报告PDF

```http
POST /api/pdf/medical-report
Content-Type: application/json

{
  "patientName": "张三",
  "patientId": "PAT-001",
  "patientAge": 30,
  "patientGender": "男",
  "reportDate": "2024-01-01",
  "dentistName": "李医生",
  "clinicName": "阳光牙科诊所",
  "diagnosis": "牙齿排列不齐",
  "treatment": "建议进行牙齿矫正治疗",
  "recommendations": [
    "定期刷牙",
    "使用牙线",
    "定期复诊"
  ],
  "followUpDate": "2024-02-01",
  "notes": "患者情况良好"
}
```

### 4. 生成预约确认PDF

```http
POST /api/pdf/appointment
Content-Type: application/json

{
  "appointmentId": "APT-001",
  "appointmentDate": "2024-01-15",
  "appointmentTime": "14:00",
  "patientName": "张三",
  "patientEmail": "zhangsan@example.com",
  "patientPhone": "0912345678",
  "dentistName": "李医生",
  "clinicName": "阳光牙科诊所",
  "clinicAddress": "台北市信义区信义路五段7号",
  "treatmentType": "牙齿检查",
  "duration": "30分钟",
  "notes": "请提前15分钟到达"
}
```

### 5. 生成自定义PDF

```http
POST /api/pdf/custom
Content-Type: application/json

{
  "templateName": "custom-template",
  "data": {
    "title": "自定义文档",
    "content": "这是自定义内容",
    "author": "张三"
  },
  "options": {
    "format": "A4",
    "margin": {
      "top": "20mm",
      "right": "20mm",
      "bottom": "20mm",
      "left": "20mm"
    }
  }
}
```

### 6. 生成HTML预览

```http
POST /api/pdf/preview
Content-Type: application/json

{
  "type": "invoice",
  "data": {
    "invoiceNumber": "INV-2024-001",
    "patientName": "张三",
    "total": 1365
  }
}
```

### 7. 保存PDF文件

```http
POST /api/pdf/save
Content-Type: application/json

{
  "type": "invoice",
  "data": {
    "invoiceNumber": "INV-2024-001",
    "patientName": "张三",
    "total": 1365
  },
  "filename": "invoice-INV-2024-001.pdf"
}
```

### 8. 获取PDF配置

```http
GET /api/pdf/config
```

### 9. 测试PDF生成

```http
POST /api/pdf/test
```

## PDF选项配置

### 页面格式

- `A4` - 标准A4纸张
- `A3` - 标准A3纸张
- `Letter` - 美式信纸
- `Legal` - 美式法律纸张

### 页边距

```javascript
{
  "margin": {
    "top": "20mm",
    "right": "20mm",
    "bottom": "20mm",
    "left": "20mm"
  }
}
```

### 其他选项

```javascript
{
  "format": "A4",
  "displayHeaderFooter": false,
  "printBackground": true,
  "preferCSSPageSize": false
}
```

## 自定义模板

### 创建自定义模板

1. 在 `src/pdf/templates/` 目录下创建 `.html` 文件
2. 使用 `{{变量名}}` 定义变量
3. 在代码中使用 `templateName` 参数指定模板名称

### 模板示例

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{title}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .content { margin-bottom: 20px; }
        .footer { margin-top: 30px; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{title}}</h1>
    </div>
    
    <div class="content">
        <p>{{content}}</p>
    </div>
    
    <div class="footer">
        <p>作者: {{author}}</p>
        <p>生成时间: {{generatedAt}}</p>
    </div>
</body>
</html>
```

## 使用示例

### 前端集成

```javascript
// 生成发票PDF
const generateInvoicePdf = async (invoiceData) => {
  const response = await fetch('/api/pdf/invoice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoiceData)
  });
  
  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoiceData.invoiceNumber}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
};

// 生成HTML预览
const generatePreview = async (type, data) => {
  const response = await fetch('/api/pdf/preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, data })
  });
  
  const result = await response.json();
  return result.data.html;
};
```

### 后端集成

```typescript
// 在服务中注入PdfService
constructor(private readonly pdfService: PdfService) {}

// 生成发票PDF
async generateInvoicePdf(invoiceData: InvoiceData) {
  return this.pdfService.generateInvoicePdf(invoiceData);
}

// 保存PDF文件
async saveInvoicePdf(invoiceData: InvoiceData, filename: string) {
  const pdfBuffer = await this.pdfService.generateInvoicePdf(invoiceData);
  return this.pdfService.savePdf(pdfBuffer, filename);
}
```

## 错误处理

### 常见错误

- `400 Bad Request` - 数据格式错误或参数无效
- `500 Internal Server Error` - PDF生成失败

### 错误响应格式

```json
{
  "statusCode": 400,
  "message": "Failed to generate PDF",
  "error": "Bad Request"
}
```

## 性能优化

### 建议

1. **浏览器实例复用**
   - 服务启动时初始化浏览器实例
   - 避免频繁创建和销毁

2. **内存管理**
   - 及时关闭页面实例
   - 定期清理临时文件

3. **并发控制**
   - 限制同时生成的PDF数量
   - 使用队列处理大量请求

## 安全注意事项

1. **文件路径安全**
   - 验证文件路径，防止路径遍历攻击
   - 限制文件保存目录

2. **内容安全**
   - 验证HTML内容，防止XSS攻击
   - 限制模板文件访问

3. **资源限制**
   - 限制PDF文件大小
   - 设置生成超时时间

## 测试

### 测试PDF生成

```bash
# 测试PDF生成
curl -X POST http://localhost:3001/api/pdf/test \
  -H "Content-Type: application/json" \
  --output test-invoice.pdf

# 测试发票生成
curl -X POST http://localhost:3001/api/pdf/invoice \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceNumber": "INV-2024-001",
    "invoiceDate": "2024-01-01",
    "dueDate": "2024-01-31",
    "patientName": "张三",
    "patientEmail": "zhangsan@example.com",
    "patientPhone": "0912345678",
    "patientAddress": "台北市信义区信义路五段7号",
    "dentistName": "李医生",
    "clinicName": "阳光牙科诊所",
    "clinicAddress": "台北市信义区信义路五段7号",
    "items": [
      {
        "description": "牙齿检查",
        "quantity": 1,
        "unitPrice": 500,
        "amount": 500
      }
    ],
    "subtotal": 500,
    "tax": 25,
    "total": 525
  }' \
  --output invoice.pdf
```

### 测试HTML预览

```bash
# 测试HTML预览
curl -X POST http://localhost:3001/api/pdf/preview \
  -H "Content-Type: application/json" \
  -d '{
    "type": "invoice",
    "data": {
      "invoiceNumber": "INV-2024-001",
      "patientName": "张三",
      "total": 525
    }
  }'
```

## 监控和日志

### 日志记录

服务会记录以下信息：
- PDF生成成功/失败
- 生成时间统计
- 错误详情
- 文件保存路径

### 监控指标

- PDF生成成功率
- 平均生成时间
- 错误率
- 文件大小统计

## 故障排除

### 常见问题

1. **Puppeteer启动失败**
   - 检查系统依赖
   - 确认Chrome/Chromium安装
   - 检查权限设置

2. **PDF生成失败**
   - 检查HTML模板语法
   - 确认数据格式正确
   - 查看错误日志

3. **内存不足**
   - 增加系统内存
   - 优化HTML模板
   - 减少并发请求

## 更新日志

### v1.0.0
- 初始版本
- 支持基本PDF生成
- 多种文档类型
- 自定义模板支持
- HTML预览功能 