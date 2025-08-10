# 医生和诊所关联关系部署步骤

## 前置条件

1. 确保数据库 `pd` 已创建
2. 确保 `clinics` 表已存在并包含数据
3. 确保 `admin_users` 表已存在

## 部署步骤

### 1. 运行数据库脚本

```bash
# 连接到MySQL数据库
mysql -u root -p

# 运行关联关系脚本
source pd-db/link_doctors_to_clinics.sql;
```

### 2. 重启应用服务

```bash
# 如果使用PM2
pm2 restart pd-service

# 如果使用Docker
docker-compose restart pd-service

# 如果直接运行
npm run start:prod
```

### 3. 验证部署

#### 3.1 检查数据库关联关系
```sql
USE pd;

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

#### 3.2 测试API接口
```bash
# 测试微笑测试接口（需要替换为实际的UUID）
curl -X GET "http://localhost:3000/api/smile-test/uuid/test-uuid/with-relations"
```

#### 3.3 运行测试脚本
```bash
# 安装依赖
npm install mysql2

# 修改数据库连接配置
# 编辑 test-doctor-clinic-relation.js 中的 dbConfig

# 运行测试
node test-doctor-clinic-relation.js
```

## 验证清单

- [ ] 数据库脚本执行成功
- [ ] 应用服务正常启动
- [ ] 医生和诊所关联关系建立
- [ ] API接口返回正确的医生和诊所信息
- [ ] 不暴露敏感信息（密码等）
- [ ] 存储过程和视图创建成功

## 故障排除

### 常见问题

1. **实体注入失败**
   - 检查 `clinic.entity.ts` 是否正确创建
   - 确认 `app.module.ts` 中已添加 Clinic 实体

2. **数据库连接错误**
   - 检查数据库配置
   - 确认数据库服务正在运行

3. **API返回空数据**
   - 检查医生和诊所的关联关系
   - 确认UUID格式正确

4. **存储过程调用失败**
   - 确认 `link_doctors_to_clinics.sql` 脚本已执行
   - 检查存储过程是否创建成功

### 日志检查

```bash
# 查看应用日志
pm2 logs pd-service

# 查看数据库日志
tail -f /var/log/mysql/error.log
```

## 回滚方案

如果部署出现问题，可以按以下步骤回滚：

1. **恢复数据库**
```sql
-- 删除关联关系
UPDATE admin_users SET department = NULL WHERE role = 'doctor';

-- 删除存储过程
DROP PROCEDURE IF EXISTS GetDoctorsByClinic;
DROP PROCEDURE IF EXISTS GetClinicByDoctor;

-- 删除视图
DROP VIEW IF EXISTS doctor_clinic_relations;
```

2. **恢复代码**
```bash
# 如果使用Git
git reset --hard HEAD~1

# 重新启动服务
pm2 restart pd-service
```

## 性能考虑

1. **索引优化**
   - `admin_users.department` 字段已建立索引
   - `clinics.uuid` 字段已建立索引

2. **查询优化**
   - 使用LEFT JOIN避免N+1查询问题
   - 只查询必要的字段，避免SELECT *

3. **缓存策略**
   - 考虑对诊所信息进行缓存
   - 医生信息变化频率较低，适合缓存

## 监控建议

1. **API响应时间**
   - 监控 `/api/smile-test/uuid/:uuid/with-relations` 接口的响应时间

2. **数据库性能**
   - 监控关联查询的执行时间
   - 关注慢查询日志

3. **错误率**
   - 监控API错误率
   - 关注数据库连接错误

## 后续优化

1. **批量查询**
   - 实现批量获取医生和诊所信息的接口

2. **数据同步**
   - 考虑实现医生和诊所信息的实时同步

3. **权限控制**
   - 添加基于角色的访问控制
   - 实现诊所级别的数据隔离
