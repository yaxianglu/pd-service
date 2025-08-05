-- 创建数据库
CREATE DATABASE IF NOT EXISTS pd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE pd;

CREATE TABLE `pd`.dentist_info (
    -- 主键和随机ID
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NULL UNIQUE COMMENT '随机UUID',
    full_name VARCHAR(1000) NULL COMMENT '全名',
    phone VARCHAR(100) NULL COMMENT '電話號碼',
    email VARCHAR(100) NULL COMMENT '電子郵箱',
    clinic_name VARCHAR(100) NULL COMMENT '牙科診所的名稱',
    years_experience INT NULL COMMENT '幾年的牙醫經驗',
    treatment_count INT NULL COMMENT '牙科治療的數量',
    address VARCHAR(2550) NULL COMMENT '您的地址',
    special_notes TEXT NULL COMMENT '有什麼特別備註的嗎？',
    
    -- 专业信息
    specialization VARCHAR(2000) NULL COMMENT '專業領域',
    license_number VARCHAR(500) NULL COMMENT '執照號碼',
    education_background TEXT NULL COMMENT '教育背景',
    
    -- 地址信息
    city VARCHAR(500) NULL COMMENT '城市',
    state_province VARCHAR(500) NULL COMMENT '州/省',
    postal_code VARCHAR(200) NULL COMMENT '郵遞區號',
    country VARCHAR(500) NULL DEFAULT 'Taiwan' COMMENT '國家',
    
    -- 业务信息
    clinic_type ENUM('private', 'public', 'corporate', 'other') NULL COMMENT '診所類型',
    patient_capacity INT NULL COMMENT '患者容量',
    working_hours VARCHAR(1000) NULL COMMENT '工作時間',
    languages VARCHAR(2000) NULL COMMENT '使用語言',
    
    -- 备注和状态
    status ENUM('active', 'inactive', 'pending', 'suspended') NULL DEFAULT 'active' COMMENT '狀態',
    
    -- 系统字段
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    created_by VARCHAR(500) NULL COMMENT '創建者',
    updated_by VARCHAR(500) NULL COMMENT '更新者',
    
    -- 索引
    INDEX idx_uuid (uuid),
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_clinic_name (clinic_name),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) COMMENT='合作夥伴注册表';
-- 插入测试数据（可选）
INSERT INTO `pd`.dentist_info (uuid, full_name, phone, email, clinic_name, status) VALUES 
(UUID(), '测试医生', '0912345678', 'test@example.com', '测试诊所', 'active')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP; 