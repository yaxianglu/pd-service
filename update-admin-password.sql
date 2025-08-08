-- 更新admin用户的密码为P@rlD1g1t@l2024!
USE pd;

UPDATE admin_users 
SET password = 'hashed_fb320648615b631191815ef7eb0627366dc459002c697df06911bb7fa6cf3cb5'
WHERE username = 'admin';

-- 验证更新结果
SELECT username, password FROM admin_users WHERE username = 'admin'; 