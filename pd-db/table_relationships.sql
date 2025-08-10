-- 表关联关系查询示例
-- 展示 smile_test -> patients -> admin_users 的关联关系

USE pd;

-- 1. 查看微笑测试及其关联的患者信息
SELECT 
    st.test_id,
    st.full_name as test_patient_name,
    st.patient_uuid,
    p.patient_id,
    p.full_name as patient_name,
    p.phone as patient_phone
FROM smile_test st
LEFT JOIN patients p ON st.patient_uuid = p.uuid
WHERE st.is_deleted = 0
ORDER BY st.created_at DESC;

-- 2. 查看患者及其关联的医生信息
SELECT 
    p.patient_id,
    p.full_name as patient_name,
    p.assigned_doctor_uuid,
    au.user_id as doctor_user_id,
    au.username as doctor_username,
    au.full_name as doctor_name,
    au.role as doctor_role
FROM patients p
LEFT JOIN admin_users au ON p.assigned_doctor_uuid = au.uuid
WHERE p.is_deleted = 0 
AND au.role = 'doctor'
ORDER BY p.created_at DESC;

-- 3. 完整的关联查询：微笑测试 -> 患者 -> 医生
SELECT 
    st.test_id,
    st.full_name as test_patient_name,
    st.patient_uuid,
    p.patient_id,
    p.full_name as patient_name,
    p.assigned_doctor_uuid,
    au.username as doctor_username,
    au.full_name as doctor_name,
    au.role as doctor_role
FROM smile_test st
LEFT JOIN patients p ON st.patient_uuid = p.uuid
LEFT JOIN admin_users au ON p.assigned_doctor_uuid = au.uuid
WHERE st.is_deleted = 0 
AND p.is_deleted = 0
AND (au.is_deleted = 0 OR au.is_deleted IS NULL)
ORDER BY st.created_at DESC;

-- 4. 查看所有医生角色的用户
SELECT 
    uuid,
    user_id,
    username,
    full_name,
    role,
    department,
    status
FROM admin_users 
WHERE role = 'doctor' 
AND is_deleted = 0
ORDER BY created_at DESC;

-- 5. 查看没有关联患者的微笑测试
SELECT 
    test_id,
    full_name,
    patient_uuid,
    created_at
FROM smile_test 
WHERE patient_uuid IS NULL 
AND is_deleted = 0
ORDER BY created_at DESC;

-- 6. 查看没有关联医生的患者
SELECT 
    patient_id,
    full_name,
    assigned_doctor_uuid,
    created_at
FROM patients 
WHERE assigned_doctor_uuid IS NULL 
AND is_deleted = 0
ORDER BY created_at DESC;
