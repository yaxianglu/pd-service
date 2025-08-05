-- 创建诊所信息数据库表
USE pd;

-- 创建诊所信息表
CREATE TABLE `pd`.clinics (
    -- 主键和唯一标识
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    clinic_id VARCHAR(50) NULL UNIQUE COMMENT '诊所唯一标识符',
    uuid CHAR(36) NULL UNIQUE COMMENT '随机UUID',
    
    -- 基本信息
    clinic_name VARCHAR(200) NOT NULL COMMENT '诊所名称',
    clinic_code VARCHAR(50) NULL COMMENT '诊所代码',
    business_license VARCHAR(100) NULL COMMENT '营业执照号',
    tax_id VARCHAR(50) NULL COMMENT '税号',
    
    -- 地址信息
    address TEXT NULL COMMENT '详细地址',
    city VARCHAR(100) NULL COMMENT '城市',
    district VARCHAR(100) NULL COMMENT '区县',
    postal_code VARCHAR(20) NULL COMMENT '邮政编码',
    province VARCHAR(100) NULL COMMENT '省份',
    country VARCHAR(100) NULL DEFAULT '台湾' COMMENT '国家',
    latitude DECIMAL(10, 8) NULL COMMENT '纬度',
    longitude DECIMAL(11, 8) NULL COMMENT '经度',
    
    -- 联系方式
    phone VARCHAR(20) NULL COMMENT '联系电话',
    fax VARCHAR(20) NULL COMMENT '传真号码',
    email VARCHAR(100) NULL COMMENT '电子邮件',
    website VARCHAR(200) NULL COMMENT '官方网站',
    line_id VARCHAR(100) NULL COMMENT 'Line ID',
    wechat_id VARCHAR(100) NULL COMMENT '微信ID',
    
    -- 营业信息
    business_hours TEXT NULL COMMENT '营业时间（JSON格式）',
    opening_date DATE NULL COMMENT '开业日期',
    clinic_type ENUM('general', 'specialized', 'cosmetic', 'orthodontic', 'pediatric', 'other') NULL COMMENT '诊所类型',
    specialties TEXT NULL COMMENT '专科领域（JSON格式）',
    insurance_accepted TEXT NULL COMMENT '接受的保险（JSON格式）',
    
    -- 人员信息
    owner_name VARCHAR(100) NULL COMMENT '负责人姓名',
    owner_phone VARCHAR(20) NULL COMMENT '负责人电话',
    owner_email VARCHAR(100) NULL COMMENT '负责人邮箱',
    chief_doctor VARCHAR(100) NULL COMMENT '主治医师',
    doctor_count INT NULL COMMENT '医师数量',
    staff_count INT NULL COMMENT '员工总数',
    
    -- 设施信息
    facility_level ENUM('basic', 'standard', 'premium', 'luxury') NULL COMMENT '设施等级',
    equipment_list TEXT NULL COMMENT '设备清单（JSON格式）',
    parking_available TINYINT(1) NULL COMMENT '是否提供停车',
    wheelchair_accessible TINYINT(1) NULL COMMENT '是否无障碍设施',
    wifi_available TINYINT(1) NULL COMMENT '是否提供WiFi',
    
    -- 服务信息
    services_offered TEXT NULL COMMENT '提供的服务（JSON格式）',
    languages_spoken TEXT NULL COMMENT '使用语言（JSON格式）',
    appointment_required TINYINT(1) NULL DEFAULT 1 COMMENT '是否需要预约',
    emergency_service TINYINT(1) NULL COMMENT '是否提供急诊服务',
    
    -- 评价和统计
    rating DECIMAL(3,2) NULL COMMENT '平均评分',
    review_count INT NULL DEFAULT 0 COMMENT '评价数量',
    patient_count INT NULL DEFAULT 0 COMMENT '患者数量',
    satisfaction_rate DECIMAL(5,2) NULL COMMENT '满意度百分比',
    
    -- 状态信息
    status ENUM('active', 'inactive', 'suspended', 'closed') NULL DEFAULT 'active' COMMENT '诊所状态',
    is_verified TINYINT(1) NULL DEFAULT 0 COMMENT '是否已验证',
    verified_at TIMESTAMP NULL COMMENT '验证时间',
    is_featured TINYINT(1) NULL DEFAULT 0 COMMENT '是否推荐诊所',
    
    -- 备用字段
    logo_url VARCHAR(500) NULL COMMENT '诊所Logo URL',
    banner_url VARCHAR(500) NULL COMMENT '诊所横幅图片URL',
    description TEXT NULL COMMENT '诊所描述',
    highlights TEXT NULL COMMENT '诊所亮点（JSON格式）',
    awards TEXT NULL COMMENT '获得的奖项（JSON格式）',
    certifications TEXT NULL COMMENT '认证信息（JSON格式）',
    social_media TEXT NULL COMMENT '社交媒体链接（JSON格式）',
    
    -- 系统字段
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by VARCHAR(100) NULL COMMENT '创建者',
    updated_by VARCHAR(100) NULL COMMENT '更新者',
    is_deleted TINYINT(1) NULL DEFAULT 0 COMMENT '是否删除',
    deleted_at TIMESTAMP NULL COMMENT '删除时间',
    
    -- 索引
    INDEX idx_clinic_id (clinic_id),
    INDEX idx_uuid (uuid),
    INDEX idx_clinic_name (clinic_name),
    INDEX idx_clinic_code (clinic_code),
    INDEX idx_city (city),
    INDEX idx_district (district),
    INDEX idx_province (province),
    INDEX idx_clinic_type (clinic_type),
    INDEX idx_status (status),
    INDEX idx_rating (rating),
    INDEX idx_is_featured (is_featured),
    INDEX idx_created_at (created_at),
    INDEX idx_is_deleted (is_deleted),
    INDEX idx_location (latitude, longitude)
) COMMENT='诊所信息表';

-- 创建序列表用于生成clinic_id
CREATE TABLE `pd`.clinics_sequence (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建触发器：插入前自动生成clinic_id和uuid
DELIMITER //
CREATE TRIGGER before_clinics_insert 
BEFORE INSERT ON `pd`.clinics
FOR EACH ROW
BEGIN
    DECLARE sequence_id INT;
    
    -- 如果clinic_id为空，则生成新的clinic_id
    IF NEW.clinic_id IS NULL THEN
        -- 插入序列表获取新的序列号
        INSERT INTO `pd`.clinics_sequence () VALUES ();
        SET sequence_id = LAST_INSERT_ID();
        SET NEW.clinic_id = CONCAT('CL', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(sequence_id, 6, '0'));
    END IF;
    
    -- 如果uuid为空，则设置为UUID
    IF NEW.uuid IS NULL THEN
        SET NEW.uuid = UUID();
    END IF;
END//
DELIMITER ;

-- 插入示例诊所数据
INSERT INTO `pd`.clinics (
    clinic_name,
    clinic_code,
    address,
    city,
    district,
    phone,
    email,
    clinic_type,
    owner_name,
    chief_doctor,
    doctor_count,
    staff_count,
    facility_level,
    services_offered,
    rating,
    status,
    is_verified
) VALUES 
('台北微笑牙医诊所', 'TC001', '台北市信义区信义路五段7号', '台北市', '信义区', '02-23456789', 'taipei@smile.com', 'cosmetic', '张医师', '张美华', 3, 8, 'premium', '["牙齿美白", "牙齿矫正", "植牙", "根管治疗"]', 4.8, 'active', 1),
('高雄正畸专科诊所', 'KS001', '高雄市前金区中正路123号', '高雄市', '前金区', '07-34567890', 'kaohsiung@ortho.com', 'orthodontic', '李医师', '李正畸', 2, 6, 'standard', '["牙齿矫正", "隐形矫正", "儿童矫正"]', 4.6, 'active', 1),
('台中儿童牙医诊所', 'TC002', '台中市西区台湾大道二段456号', '台中市', '西区', '04-45678901', 'taichung@kids.com', 'pediatric', '王医师', '王小明', 2, 5, 'standard', '["儿童牙科", "预防保健", "龋齿治疗"]', 4.9, 'active', 1),
('新竹综合牙医诊所', 'HC001', '新竹市东区光复路一段789号', '新竹市', '东区', '03-56789012', 'hsinchu@general.com', 'general', '陈医师', '陈综合', 4, 10, 'premium', '["一般牙科", "牙周病治疗", "假牙制作", "口腔外科"]', 4.5, 'active', 1);

-- 创建视图：活跃的诊所
CREATE VIEW `pd`.active_clinics AS
SELECT 
    clinic_id,
    clinic_name,
    address,
    city,
    district,
    phone,
    email,
    clinic_type,
    rating,
    review_count,
    status,
    is_featured,
    created_at
FROM `pd`.clinics 
WHERE is_deleted = 0 AND status = 'active'
ORDER BY rating DESC, review_count DESC;

-- 创建视图：推荐诊所
CREATE VIEW `pd`.featured_clinics AS
SELECT 
    clinic_id,
    clinic_name,
    address,
    city,
    district,
    phone,
    clinic_type,
    rating,
    review_count,
    description
FROM `pd`.clinics 
WHERE is_deleted = 0 AND status = 'active' AND is_featured = 1
ORDER BY rating DESC;

-- 创建存储过程：根据城市统计诊所
DELIMITER //
CREATE PROCEDURE `pd`.GetClinicStatsByCity()
BEGIN
    SELECT 
        city,
        COUNT(*) as total_clinics,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_clinics,
        COUNT(CASE WHEN is_featured = 1 THEN 1 END) as featured_clinics,
        AVG(rating) as avg_rating,
        SUM(review_count) as total_reviews,
        MAX(created_at) as latest_clinic
    FROM `pd`.clinics 
    WHERE is_deleted = 0
    GROUP BY city
    ORDER BY total_clinics DESC;
END//
DELIMITER ;

-- 创建存储过程：根据诊所类型统计
DELIMITER //
CREATE PROCEDURE `pd`.GetClinicStatsByType()
BEGIN
    SELECT 
        clinic_type,
        COUNT(*) as total_clinics,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_clinics,
        AVG(rating) as avg_rating,
        AVG(doctor_count) as avg_doctors,
        AVG(staff_count) as avg_staff
    FROM `pd`.clinics 
    WHERE is_deleted = 0
    GROUP BY clinic_type
    ORDER BY total_clinics DESC;
END//
DELIMITER ; 