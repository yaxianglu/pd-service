# Smile Test API 测试文档

## 新增的关联查询接口

### 接口地址
```
GET /api/smile-test/uuid/:uuid/with-relations
```

### 功能说明
这个接口会返回微笑测试的完整信息，包括：
1. **smileTest**: 微笑测试的详细信息
2. **patient**: 关联的患者信息（如果存在）
3. **doctor**: 关联的医生信息（如果存在）

### 测试步骤

#### 1. 启动服务
```bash
cd pd-service
npm run start:dev
```

#### 2. 测试接口
使用 curl 或 Postman 测试：

```bash
# 测试获取关联数据
curl -X GET "http://localhost:3001/api/smile-test/uuid/YOUR_TEST_UUID/with-relations"

# 测试原有的简单接口
curl -X GET "http://localhost:3001/api/smile-test/uuid/YOUR_TEST_UUID"
```

#### 3. 预期返回格式

**成功响应：**
```json
{
  "success": true,
  "data": {
    "smileTest": {
      "id": 1,
      "test_id": "TEST001",
      "uuid": "550e8400-e29b-41d4-a716-446655440001",
      "full_name": "张三",
      "birth_date": "1990-01-01",
      "phone": "0912345678",
      "email": "zhang@example.com",
      "line_id": "zhang123",
      "city": "台北市",
      "teeth_type": "crowded",
      "considerations": "牙齿拥挤",
      "improvement_points": "需要矫正",
      "teeth_image_1": "base64...",
      "teeth_image_2": "base64...",
      "teeth_image_3": "base64...",
      "teeth_image_4": "base64...",
      "age": 33,
      "gender": "male",
      "occupation": "工程师",
      "address": "台北市信义区",
      "emergency_contact": "李四",
      "emergency_phone": "0987654321",
      "dental_history": "无",
      "current_issues": "牙齿拥挤",
      "allergies": "无",
      "medications": "无",
      "test_score": 85.5,
      "confidence_level": "high",
      "recommended_treatment": "隐形矫正",
      "estimated_cost": 80000.00,
      "test_status": "completed",
      "appointment_date": "2024-01-15T10:00:00.000Z",
      "follow_up_date": "2024-02-15T10:00:00.000Z",
      "patient_uuid": "550e8400-e29b-41d4-a716-446655440002",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z"
    },
    "patient": {
      "id": 1,
      "patient_id": "P001",
      "uuid": "550e8400-e29b-41d4-a716-446655440002",
      "full_name": "张三",
      "birth_date": "1990-01-01",
      "gender": "male",
      "phone": "0912345678",
      "email": "zhang@example.com",
      "line_id": "zhang123",
      "wechat_id": "zhang123",
      "address": "台北市信义区",
      "city": "台北市",
      "district": "信义区",
      "postal_code": "110",
      "emergency_contact": "李四",
      "emergency_phone": "0987654321",
      "blood_type": "A+",
      "allergies": "无",
      "medical_history": "无",
      "current_medications": "无",
      "dental_history": "无",
      "insurance_provider": "国泰人寿",
      "insurance_number": "INS001",
      "clinic_id": "CL001",
      "assigned_doctor_uuid": "550e8400-e29b-41d4-a716-446655440003",
      "receptionist_id": "R001",
      "referral_source": "网络搜索",
      "first_visit_date": "2024-01-01",
      "last_visit_date": "2024-01-15",
      "next_appointment_date": "2024-02-15T10:00:00.000Z",
      "treatment_status": "treatment_in_progress",
      "treatment_phase": "矫正阶段",
      "treatment_progress": 25.50,
      "estimated_completion_date": "2025-01-01",
      "actual_completion_date": null,
      "selected_treatment_plan": "隐形矫正",
      "selected_products": "隐适美",
      "treatment_notes": "患者配合度良好",
      "special_requirements": "无",
      "total_cost": 80000.00,
      "paid_amount": 20000.00,
      "remaining_balance": 60000.00,
      "payment_status": "partial_paid",
      "payment_method": "installment",
      "installment_plan": "分期付款",
      "discount_amount": 0.00,
      "discount_reason": null,
      "appointment_reminder": true,
      "reminder_method": "line",
      "reminder_time": 24,
      "no_show_count": 0,
      "cancellation_count": 0,
      "satisfaction_rating": 4.5,
      "service_rating": 4.5,
      "doctor_rating": 5.0,
      "facility_rating": 4.5,
      "review_text": "服务很好",
      "review_date": "2024-01-15T00:00:00.000Z",
      "status": "active",
      "is_verified": true,
      "verified_at": "2024-01-01T00:00:00.000Z",
      "is_vip": false,
      "vip_level": null,
      "avatar_url": null,
      "occupation": "工程师",
      "education_level": "大学",
      "marital_status": "married",
      "family_members": "妻子、儿子",
      "hobbies": "阅读、运动",
      "preferred_language": "zh-TW",
      "communication_preference": "line",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z"
    },
    "doctor": {
      "id": 1,
      "user_id": "AU001",
      "uuid": "550e8400-e29b-41d4-a716-446655440003",
      "username": "dr.lee",
      "email": "dr.lee@clinic.com",
      "full_name": "李医生",
      "phone": "0923456789",
      "role": "doctor",
      "permissions": "patient_management,treatment_planning",
      "department": "矫正科",
      "position": "主治医师",
      "status": "active",
      "is_verified": true,
      "verified_at": "2024-01-01T00:00:00.000Z",
      "avatar": null,
      "bio": "专业矫正医师",
      "timezone": "Asia/Taipei",
      "language": "zh-CN",
      "theme": "light",
      "notification_settings": "email,line",
      "last_login_at": "2024-01-15T09:00:00.000Z",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-15T09:00:00.000Z"
    }
  },
  "message": "获取关联数据成功"
}
```

**失败响应：**
```json
{
  "success": false,
  "message": "UUID不存在或已失效"
}
```

### 数据库要求

确保数据库中有以下表和数据：

1. **smile_test** 表：包含 `patient_uuid` 字段
2. **patients** 表：包含 `assigned_doctor_uuid` 字段
3. **admin_users** 表：包含 `role` 字段为 'doctor' 的用户

### 注意事项

1. 如果 `patient_uuid` 为空，则 `patient` 和 `doctor` 字段将为 `null`
2. 如果 `assigned_doctor_uuid` 为空，则 `doctor` 字段将为 `null`
3. 只有 `role` 为 'doctor' 的用户才会被返回
4. 所有软删除的记录都会被过滤掉（`is_deleted = false`）

### 错误处理

接口包含完整的错误处理：
- 数据库连接错误
- UUID 不存在
- 数据查询失败
- 其他系统错误

所有错误都会返回适当的错误信息和状态码。
