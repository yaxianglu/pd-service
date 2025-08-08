-- 添加测试用户
USE pd;

INSERT INTO admin_users (
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
);

-- 验证插入结果
SELECT 
    username,
    email,
    full_name,
    role,
    department,
    position,
    status
FROM admin_users 
WHERE username = 'pearl_admin_2025'; 