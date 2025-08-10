-- 迁移脚本：将现有的表关联更新为UUID关联
-- 注意：在执行此脚本前，请备份数据库

USE pd;

-- 步骤1: 为 smile_test 表添加 patient_uuid 字段
ALTER TABLE smile_test 
ADD COLUMN patient_uuid CHAR(36) NULL COMMENT '关联的患者UUID' AFTER follow_up_date;

-- 步骤2: 为 patient_uuid 字段添加索引
ALTER TABLE smile_test 
ADD INDEX idx_patient_uuid (patient_uuid);

-- 步骤3: 将 patients 表的 assigned_doctor_id 字段重命名为 assigned_doctor_uuid
-- 注意：这里假设字段类型已经是 CHAR(36)，如果不是，需要先修改类型
ALTER TABLE patients 
CHANGE COLUMN assigned_doctor_id assigned_doctor_uuid CHAR(36) NULL COMMENT '主治医师UUID（关联admin_users表）';

-- 步骤4: 更新索引名称
-- 删除旧索引
ALTER TABLE patients 
DROP INDEX idx_assigned_doctor_id;

-- 添加新索引
ALTER TABLE patients 
ADD INDEX idx_assigned_doctor_uuid (assigned_doctor_uuid);

-- 步骤5: 更新示例数据中的 assigned_doctor_uuid 值
-- 注意：这里使用示例UUID，实际使用时需要根据真实的admin_users数据来更新
UPDATE patients 
SET assigned_doctor_uuid = '550e8400-e29b-41d4-a716-446655440001' 
WHERE assigned_doctor_uuid = 'AU20241201000001';

UPDATE patients 
SET assigned_doctor_uuid = '550e8400-e29b-41d4-a716-446655440002' 
WHERE assigned_doctor_uuid = 'AU20241201000002';

-- 步骤6: 验证迁移结果
SELECT 
    'Migration completed. Please verify the following:' as message;

-- 检查 smile_test 表结构
DESCRIBE smile_test;

-- 检查 patients 表结构  
DESCRIBE patients;

-- 检查索引
SHOW INDEX FROM smile_test WHERE Key_name = 'idx_patient_uuid';
SHOW INDEX FROM patients WHERE Key_name = 'idx_assigned_doctor_uuid';

-- 显示表关联关系
SELECT 
    'Table relationships after migration:' as info;

SELECT 
    'smile_test.patient_uuid -> patients.uuid' as relationship
UNION ALL
SELECT 
    'patients.assigned_doctor_uuid -> admin_users.uuid (role = doctor)' as relationship;
