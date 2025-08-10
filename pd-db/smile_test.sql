-- 创建微笑测试数据库
CREATE DATABASE IF NOT EXISTS pd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE pd;

-- 创建微笑测试表
CREATE TABLE `pd`.smile_test (
    -- 主键和随机ID
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    test_id VARCHAR(50) NULL UNIQUE COMMENT '测试唯一标识符',
    uuid CHAR(36) NULL UNIQUE COMMENT '随机UUID',
    
    -- 基本信息
    full_name VARCHAR(100) NOT NULL COMMENT '姓名',
    birth_date DATE NULL COMMENT '生日',
    phone VARCHAR(20) NULL COMMENT '手机号码',
    email VARCHAR(100) NULL COMMENT '电子邮件',
    line_id VARCHAR(100) NULL COMMENT 'Line ID',
    city VARCHAR(100) NULL COMMENT '城市',
    
    -- 牙齿评估信息
    teeth_type ENUM('normal', 'crowded', 'spaced', 'overbite', 'underbite', 'crossbite', 'other') NULL COMMENT '牙齿类型',
    considerations TEXT NULL COMMENT '考量',
    improvement_points TEXT NULL COMMENT '改进点文本',
    
    -- 牙齿图片 (base64编码)
    teeth_image_1 LONGTEXT NULL COMMENT '牙齿图片1路径 (base64编码)',
    teeth_image_2 LONGTEXT NULL COMMENT '牙齿图片2路径 (base64编码)',
    teeth_image_3 LONGTEXT NULL COMMENT '牙齿图片3路径 (base64编码)',
    teeth_image_4 LONGTEXT NULL COMMENT '牙齿图片4路径 (base64编码)',
    
    -- 备用字段
    age INT NULL COMMENT '年龄',
    gender ENUM('male', 'female', 'other') NULL COMMENT '性别',
    occupation VARCHAR(100) NULL COMMENT '职业',
    address TEXT NULL COMMENT '详细地址',
    emergency_contact VARCHAR(100) NULL COMMENT '紧急联系人',
    emergency_phone VARCHAR(20) NULL COMMENT '紧急联系电话',
    
    -- 牙齿健康信息
    dental_history TEXT NULL COMMENT '牙齿治疗历史',
    current_issues TEXT NULL COMMENT '当前牙齿问题',
    allergies TEXT NULL COMMENT '过敏史',
    medications TEXT NULL COMMENT '正在服用的药物',
    
    -- 测试结果
    test_score DECIMAL(5,2) NULL COMMENT '测试评分',
    confidence_level ENUM('low', 'medium', 'high') NULL COMMENT '信心水平',
    recommended_treatment VARCHAR(200) NULL COMMENT '推荐治疗方案',
    estimated_cost DECIMAL(10,2) NULL COMMENT '预估费用',
    
    -- 状态和流程
    test_status ENUM('pending', 'in_progress', 'completed', 'cancelled') NULL DEFAULT 'pending' COMMENT '测试状态',
    appointment_date DATETIME NULL COMMENT '预约日期',
    follow_up_date DATETIME NULL COMMENT '跟进日期',
    
    -- 关联字段
    patient_uuid CHAR(36) NULL COMMENT '关联的患者UUID',
    
    -- 系统字段
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by VARCHAR(100) NULL COMMENT '创建者',
    updated_by VARCHAR(100) NULL COMMENT '更新者',
    is_deleted TINYINT(1) NULL DEFAULT 0 COMMENT '是否删除',
    deleted_at TIMESTAMP NULL COMMENT '删除时间',
    
    -- 索引
    INDEX idx_test_id (test_id),
    INDEX idx_uuid (uuid),
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_line_id (line_id),
    INDEX idx_city (city),
    INDEX idx_teeth_type (teeth_type),
    INDEX idx_test_status (test_status),
    INDEX idx_created_at (created_at),
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_is_deleted (is_deleted),
    INDEX idx_patient_uuid (patient_uuid)
) COMMENT='微笑测试数据库表';

-- 创建序列表用于生成test_id
CREATE TABLE `pd`.smile_test_sequence (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建触发器：插入前自动生成test_id和uuid
DELIMITER //
CREATE TRIGGER before_smile_test_insert 
BEFORE INSERT ON `pd`.smile_test
FOR EACH ROW
BEGIN
    DECLARE sequence_id INT;
    
    -- 如果test_id为空，则生成新的test_id
    IF NEW.test_id IS NULL THEN
        -- 插入序列表获取新的序列号
        INSERT INTO `pd`.smile_test_sequence () VALUES ();
        SET sequence_id = LAST_INSERT_ID();
        SET NEW.test_id = CONCAT('ST', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(sequence_id, 6, '0'));
    END IF;
    
    -- 如果uuid为空，则设置为UUID
    IF NEW.uuid IS NULL THEN
        SET NEW.uuid = UUID();
    END IF;
END//
DELIMITER ;

-- 插入测试数据（test_id和uuid将由触发器自动生成）
INSERT INTO `pd`.smile_test (
    full_name, 
    birth_date, 
    phone, 
    email, 
    line_id, 
    city, 
    teeth_type, 
    considerations, 
    improvement_points,
    age,
    gender,
    test_score,
    confidence_level,
    test_status
) VALUES 
('张三', '1990-05-15', '0912345678', 'zhangsan@example.com', 'zhangsan123', '台北市', 'crowded', '牙齿拥挤需要矫正', '建议进行牙齿矫正治疗', 33, 'male', 75.50, 'medium', 'completed'),
('李四', '1985-08-22', '0923456789', 'lisi@example.com', 'lisi456', '高雄市', 'normal', '牙齿排列整齐', '可以考虑美白治疗', 38, 'female', 90.00, 'high', 'completed'),
('王五', '1995-03-10', '0934567890', 'wangwu@example.com', 'wangwu789', '台中市', 'overbite', '有轻微龅牙', '建议进行正畸治疗', 28, 'male', 65.25, 'medium', 'in_progress');

-- 创建视图：活跃的微笑测试记录
CREATE VIEW `pd`.active_smile_tests AS
SELECT 
    test_id,
    full_name,
    phone,
    email,
    city,
    teeth_type,
    test_status,
    created_at,
    test_score
FROM `pd`.smile_test 
WHERE is_deleted = 0 
ORDER BY created_at DESC;

-- 创建存储过程：根据城市统计测试数据
DELIMITER //
CREATE PROCEDURE `pd`.GetSmileTestStatsByCity()
BEGIN
    SELECT 
        city,
        COUNT(*) as total_tests,
        COUNT(CASE WHEN test_status = 'completed' THEN 1 END) as completed_tests,
        AVG(test_score) as avg_score,
        MAX(created_at) as latest_test
    FROM `pd`.smile_test 
    WHERE is_deleted = 0
    GROUP BY city
    ORDER BY total_tests DESC;
END//
DELIMITER ; 