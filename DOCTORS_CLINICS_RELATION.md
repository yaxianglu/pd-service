# 医生和诊所关联关系说明

## 概述

本系统使用现有的 `admin_users` 表的 `department` 字段来建立医生和诊所的关联关系，无需增加新字段。

## 关联关系设计

### 数据库层面
- **admin_users.department** 字段：对于医生角色，此字段存储关联的诊所UUID
- **clinics.uuid** 字段：诊所的唯一标识符
- 通过 `admin_users.department = clinics.uuid` 建立关联

### 实体关系
```
admin_users (role = 'doctor') ←→ clinics
     ↓                              ↑
department (存储诊所UUID) ←→ uuid
```

## 实现细节

### 1. 实体文件
- `clinic.entity.ts` - 诊所实体，对应数据库 `clinics` 表
- `admin-user.entity.ts` - 管理员用户实体，`department` 字段用于存储诊所UUID

### 2. 服务层
- `smile-test.service.ts` - 在查询医生信息时同时查询诊所信息
- 通过 `findByUuidWithRelations` 方法获取完整的关联数据

### 3. 控制器层
- `smile-test.controller.ts` - API接口返回医生和诊所的完整信息
- 确保不暴露敏感信息（如密码）

## API接口

### GET /api/smile-test/uuid/:uuid/with-relations

返回包含以下信息的完整数据：
- **smileTest**: 微笑测试信息
- **patient**: 患者信息
- **doctor**: 医生信息（不包含密码）
- **clinic**: 诊所信息

### 医生信息字段
```json
{
  "id": 1,
  "user_id": "AU20241201000001",
  "uuid": "doctor-uuid",
  "username": "doctor.zhang",
  "email": "doctor.zhang@smile.com",
  "full_name": "张美华医师",
  "phone": "0912345678",
  "role": "doctor",
  "department": "clinic-uuid", // 关联的诊所UUID
  "position": "主治医师",
  "status": "active",
  // ... 其他字段（不包含密码）
}
```

### 诊所信息字段
```json
{
  "id": 1,
  "clinic_id": "CL20241201000001",
  "uuid": "clinic-uuid",
  "clinic_name": "台北微笑牙医诊所",
  "clinic_code": "TC001",
  "address": "台北市信义区信义路五段7号",
  "city": "台北市",
  "district": "信义区",
  "phone": "02-23456789",
  "email": "taipei@smile.com",
  "clinic_type": "cosmetic",
  "rating": 4.8,
  // ... 其他字段
}
```

## 数据库脚本

### 建立关联关系
运行 `pd-db/link_doctors_to_clinics.sql` 脚本：
1. 创建示例医生用户
2. 建立医生和诊所的关联关系
3. 创建相关视图和存储过程

### 验证关联关系
```sql
-- 查看医生和诊所的关联
SELECT 
    au.username,
    au.full_name,
    c.clinic_name,
    c.city
FROM admin_users au
LEFT JOIN clinics c ON au.department = c.uuid
WHERE au.role = 'doctor';
```

## 注意事项

1. **字段复用**: 使用现有的 `department` 字段，避免增加新字段
2. **数据安全**: API返回的医生信息不包含密码等敏感字段
3. **关联完整性**: 确保医生UUID在 `admin_users` 表中存在且角色为 `doctor`
4. **诊所状态**: 只返回状态为 `active` 的诊所信息

## 扩展功能

### 存储过程
- `GetDoctorsByClinic(clinic_uuid)` - 根据诊所获取医生列表
- `GetClinicByDoctor(doctor_uuid)` - 根据医生获取诊所信息

### 视图
- `doctor_clinic_relations` - 医生和诊所的关联信息视图

## 使用示例

### 前端调用
```javascript
// 获取微笑测试的完整信息（包含医生和诊所）
const response = await fetch('/api/smile-test/uuid/test-uuid/with-relations');
const data = await response.json();

if (data.success) {
  const { smileTest, patient, doctor, clinic } = data.data;
  
  // 显示医生信息
  if (doctor) {
    console.log(`医生: ${doctor.full_name}`);
    console.log(`职位: ${doctor.position}`);
  }
  
  // 显示诊所信息
  if (clinic) {
    console.log(`诊所: ${clinic.clinic_name}`);
    console.log(`地址: ${clinic.address}`);
    console.log(`电话: ${clinic.phone}`);
  }
}
```

## 维护说明

1. **添加新医生**: 在 `admin_users` 表中插入记录，设置 `role = 'doctor'`，`department` 字段设置为关联的诊所UUID
2. **修改关联关系**: 更新 `admin_users.department` 字段
3. **删除关联**: 将 `admin_users.department` 设置为 `NULL`

## 故障排除

### 常见问题
1. **医生信息不显示**: 检查 `admin_users.role` 是否为 `'doctor'`
2. **诊所信息不显示**: 检查 `admin_users.department` 是否包含有效的诊所UUID
3. **数据不一致**: 运行验证查询检查关联关系的完整性
