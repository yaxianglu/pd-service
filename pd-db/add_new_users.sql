-- 添加新的管理员账号
USE pd;

-- 删除旧的测试账号（如果存在）
DELETE FROM `pd`.admin_users WHERE username IN ('admin', 'manager', 'operator');

-- 插入新的管理员账号
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
    is_verified
) VALUES 
-- 1. 超级管理员账号
('super_admin', 'hashed_8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'super_admin@pearl.com', '超级管理员', '0912345678', 'super_admin', '技术部', '系统管理员', 'active', 1),

-- 2. 销售账号
('sales_user', 'hashed_fb320648615b631191815ef7eb0627366dc459002c697df06911bb7fa6cf3cb5', 'sales@pearl.com', '销售专员', '0923456789', 'admin', '销售部', '销售专员', 'active', 1),

-- 3. 医生账号
('doctor_user', 'hashed_a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456', 'doctor@pearl.com', '主治医师', '0934567890', 'manager', '医疗部', '主治医师', 'active', 1),

-- 4. 普通管理员账号
('admin_user', 'hashed_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', 'admin@pearl.com', '普通管理员', '0945678901', 'operator', '运营部', '运营专员', 'active', 1);

-- 查看创建的用户
SELECT 
    username,
    email,
    full_name,
    role,
    department,
    position,
    status,
    created_at
FROM `pd`.admin_users 
WHERE is_deleted = 0 
ORDER BY created_at DESC; 