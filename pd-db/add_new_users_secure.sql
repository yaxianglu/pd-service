-- 添加新的管理员账号（使用复杂密码）
USE pd;

-- 删除旧的测试账号（如果存在）
DELETE FROM `pd`.admin_users WHERE username IN ('admin', 'manager', 'operator', 'super_admin', 'sales_user', 'doctor_user', 'admin_user');

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
('super_admin', 'hashed_8cb71bb8d9e1b0ce70980f47744758845f5b10047c3a9bbef931018e2d1983b1', 'super_admin@pearl.com', '超级管理员', '0912345678', 'super_admin', '技术部', '系统管理员', 'active', 1),

-- 2. 销售账号
('sales_user', 'hashed_cabb2584d017031687ec6e8e65c0f091b62ce7145e560dda02b7a626c694dd9f', 'sales@pearl.com', '销售专员', '0923456789', 'admin', '销售部', '销售专员', 'active', 1),

-- 3. 医生账号
('doctor_user', 'hashed_45c3562b1113edd9accf35c401ae67b05d1f36d0ac4b6bb2c28be1f899484394', 'doctor@pearl.com', '主治医师', '0934567890', 'manager', '医疗部', '主治医师', 'active', 1),

-- 4. 普通管理员账号
('admin_user', 'hashed_c2b0c06da7c055eafd6780b612eb05d1b39ac378c1e00965a0553de3425bf907', 'admin@pearl.com', '普通管理员', '0945678901', 'operator', '运营部', '运营专员', 'active', 1);

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