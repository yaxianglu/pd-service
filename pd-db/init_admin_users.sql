-- 初始化管理员用户数据
USE pd;

-- 清空现有数据（如果需要重新初始化）
-- DELETE FROM admin_users WHERE username IN ('pearl_admin_2025', 'test_admin', 'manager_test');

-- 插入测试管理员用户
INSERT INTO `pd`.admin_users (
    username,
    password,
    email,
    full_name,
    phone,
    role,
    department,
    position,
    status,
    is_verified,
    permissions,
    notification_settings,
    created_by,
    updated_by
) VALUES 
(
    'pearl_admin_2025',
    'hashed_8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    'admin@pearldigital.com',
    'Pearl Digital 系統管理員',
    '0912345678',
    'super_admin',
    '技術部',
    '系統管理員',
    'active',
    1,
    '["all"]',
    '{"email": true, "sms": false, "push": true}',
    'system',
    'system'
),
(
    'test_admin',
    'hashed_8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    'test@pearldigital.com',
    '測試管理員',
    '0923456789',
    'admin',
    '運營部',
    '管理員',
    'active',
    1,
    '["read", "write", "delete"]',
    '{"email": true, "sms": true, "push": false}',
    'system',
    'system'
),
(
    'manager_test',
    'hashed_8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    'manager@pearldigital.com',
    '部門經理',
    '0934567890',
    'manager',
    '客服部',
    '部門經理',
    'active',
    1,
    '["read", "write"]',
    '{"email": true, "sms": false, "push": true}',
    'system',
    'system'
),
(
    'operator_test',
    'hashed_8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    'operator@pearldigital.com',
    '操作員',
    '0945678901',
    'operator',
    '客服部',
    '客服專員',
    'active',
    1,
    '["read"]',
    '{"email": false, "sms": true, "push": false}',
    'system',
    'system'
);

-- 验证插入结果
SELECT 
    user_id,
    username,
    email,
    full_name,
    role,
    department,
    position,
    status,
    created_at
FROM `pd`.admin_users 
WHERE username IN ('pearl_admin_2025', 'test_admin', 'manager_test', 'operator_test')
ORDER BY created_at DESC; 