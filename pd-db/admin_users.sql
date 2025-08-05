-- 创建管理员用户数据库表
USE pd;

-- 创建管理员用户表
CREATE TABLE `pd`.admin_users (
    -- 主键和唯一标识
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id VARCHAR(50) NULL UNIQUE COMMENT '用户唯一标识符',
    uuid CHAR(36) NULL UNIQUE COMMENT '随机UUID',
    
    -- 基本信息
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
    email VARCHAR(100) NULL COMMENT '电子邮件',
    full_name VARCHAR(100) NULL COMMENT '真实姓名',
    phone VARCHAR(20) NULL COMMENT '手机号码',
    
    -- 认证相关
    token VARCHAR(500) NULL COMMENT '认证令牌',
    token_expires_at TIMESTAMP NULL COMMENT '令牌过期时间',
    refresh_token VARCHAR(500) NULL COMMENT '刷新令牌',
    refresh_token_expires_at TIMESTAMP NULL COMMENT '刷新令牌过期时间',
    last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
    login_attempts INT NULL DEFAULT 0 COMMENT '登录尝试次数',
    locked_until TIMESTAMP NULL COMMENT '账户锁定截止时间',
    
    -- 角色和权限
    role ENUM('super_admin', 'admin', 'manager', 'operator') NULL DEFAULT 'operator' COMMENT '用户角色',
    permissions TEXT NULL COMMENT '权限列表（JSON格式）',
    department VARCHAR(100) NULL COMMENT '所属部门',
    position VARCHAR(100) NULL COMMENT '职位',
    
    -- 状态信息
    status ENUM('active', 'inactive', 'suspended') NULL DEFAULT 'active' COMMENT '账户状态',
    is_verified TINYINT(1) NULL DEFAULT 0 COMMENT '是否已验证',
    verified_at TIMESTAMP NULL COMMENT '验证时间',
    
    -- 备用字段
    avatar VARCHAR(500) NULL COMMENT '头像URL',
    bio TEXT NULL COMMENT '个人简介',
    timezone VARCHAR(50) NULL COMMENT '时区',
    language VARCHAR(10) NULL DEFAULT 'zh-CN' COMMENT '语言偏好',
    theme VARCHAR(20) NULL DEFAULT 'light' COMMENT '主题偏好',
    notification_settings TEXT NULL COMMENT '通知设置（JSON格式）',
    
    -- 系统字段
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by VARCHAR(100) NULL COMMENT '创建者',
    updated_by VARCHAR(100) NULL COMMENT '更新者',
    is_deleted TINYINT(1) NULL DEFAULT 0 COMMENT '是否删除',
    deleted_at TIMESTAMP NULL COMMENT '删除时间',
    
    -- 索引
    INDEX idx_user_id (user_id),
    INDEX idx_uuid (uuid),
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status),
    INDEX idx_department (department),
    INDEX idx_created_at (created_at),
    INDEX idx_last_login_at (last_login_at),
    INDEX idx_is_deleted (is_deleted)
) COMMENT='管理员用户表';

-- 创建序列表用于生成user_id
CREATE TABLE `pd`.admin_users_sequence (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建触发器：插入前自动生成user_id和uuid
DELIMITER //
CREATE TRIGGER before_admin_users_insert 
BEFORE INSERT ON `pd`.admin_users
FOR EACH ROW
BEGIN
    DECLARE sequence_id INT;
    
    -- 如果user_id为空，则生成新的user_id
    IF NEW.user_id IS NULL THEN
        -- 插入序列表获取新的序列号
        INSERT INTO `pd`.admin_users_sequence () VALUES ();
        SET sequence_id = LAST_INSERT_ID();
        SET NEW.user_id = CONCAT('AU', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(sequence_id, 6, '0'));
    END IF;
    
    -- 如果uuid为空，则设置为UUID
    IF NEW.uuid IS NULL THEN
        SET NEW.uuid = UUID();
    END IF;
    
    -- 如果密码未加密，则进行哈希处理（这里只是示例，实际应该使用更安全的加密方式）
    IF NEW.password IS NOT NULL AND LENGTH(NEW.password) < 60 THEN
        SET NEW.password = CONCAT('hashed_', SHA2(NEW.password, 256));
    END IF;
END//
DELIMITER ;

-- 插入默认管理员账号
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
('admin', 'hashed_8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'admin@example.com', '系统管理员', '0912345678', 'super_admin', '技术部', '系统管理员', 'active', 1),
('manager', 'hashed_1a2b3c4d5e6f7g8h9i0j', 'manager@example.com', '部门经理', '0923456789', 'manager', '运营部', '部门经理', 'active', 1),
('operator', 'hashed_9i8u7y6t5r4e3w2q1p0o', 'operator@example.com', '操作员', '0934567890', 'operator', '客服部', '客服专员', 'active', 1);

-- 创建视图：活跃的管理员用户
CREATE VIEW `pd`.active_admin_users AS
SELECT 
    user_id,
    username,
    email,
    full_name,
    role,
    department,
    position,
    status,
    last_login_at,
    created_at
FROM `pd`.admin_users 
WHERE is_deleted = 0 AND status = 'active'
ORDER BY created_at DESC;

-- 创建存储过程：根据角色统计用户数量
DELIMITER //
CREATE PROCEDURE `pd`.GetAdminUserStatsByRole()
BEGIN
    SELECT 
        role,
        COUNT(*) as total_users,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
        COUNT(CASE WHEN last_login_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as recent_login_users,
        MAX(created_at) as latest_user_created
    FROM `pd`.admin_users 
    WHERE is_deleted = 0
    GROUP BY role
    ORDER BY total_users DESC;
END//
DELIMITER ; 