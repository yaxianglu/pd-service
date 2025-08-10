-- 创建就诊者用户数据库表
USE pd;

-- 创建就诊者用户表
CREATE TABLE `pd`.patients (
    -- 主键和唯一标识
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    patient_id VARCHAR(50) NULL UNIQUE COMMENT '患者唯一标识符',
    uuid CHAR(36) NULL UNIQUE COMMENT '随机UUID',
    
    -- 基本信息
    full_name VARCHAR(100) NOT NULL COMMENT '患者姓名',
    birth_date DATE NULL COMMENT '出生日期',
    gender ENUM('male', 'female', 'other') NULL COMMENT '性别',
    id_number VARCHAR(20) NULL COMMENT '身份证号',
    phone VARCHAR(20) NULL COMMENT '手机号码',
    email VARCHAR(100) NULL COMMENT '电子邮件',
    line_id VARCHAR(100) NULL COMMENT 'Line ID',
    wechat_id VARCHAR(100) NULL COMMENT '微信ID',
    
    -- 地址信息
    address TEXT NULL COMMENT '详细地址',
    city VARCHAR(100) NULL COMMENT '城市',
    district VARCHAR(100) NULL COMMENT '区县',
    postal_code VARCHAR(20) NULL COMMENT '邮政编码',
    emergency_contact VARCHAR(100) NULL COMMENT '紧急联系人',
    emergency_phone VARCHAR(20) NULL COMMENT '紧急联系电话',
    
    -- 医疗信息
    blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NULL COMMENT '血型',
    allergies TEXT NULL COMMENT '过敏史（JSON格式）',
    medical_history TEXT NULL COMMENT '病史（JSON格式）',
    current_medications TEXT NULL COMMENT '正在服用的药物（JSON格式）',
    dental_history TEXT NULL COMMENT '牙齿治疗历史（JSON格式）',
    insurance_provider VARCHAR(100) NULL COMMENT '保险公司',
    insurance_number VARCHAR(50) NULL COMMENT '保险号码',
    
    -- 就诊信息
    clinic_id VARCHAR(50) NULL COMMENT '所属诊所ID',
    assigned_doctor_uuid CHAR(36) NULL COMMENT '主治医师UUID（关联admin_users表）',
    receptionist_id VARCHAR(50) NULL COMMENT '接待员ID',
    referral_source VARCHAR(100) NULL COMMENT '推荐来源',
    first_visit_date DATE NULL COMMENT '首次就诊日期',
    last_visit_date DATE NULL COMMENT '最后就诊日期',
    next_appointment_date DATETIME NULL COMMENT '下次预约日期',
    
    -- 就诊进度
    treatment_status ENUM('initial_consultation', 'treatment_planning', 'treatment_in_progress', 'treatment_completed', 'follow_up', 'discharged') NULL DEFAULT 'initial_consultation' COMMENT '治疗状态',
    treatment_phase VARCHAR(100) NULL COMMENT '治疗阶段',
    treatment_progress DECIMAL(5,2) NULL COMMENT '治疗进度百分比',
    estimated_completion_date DATE NULL COMMENT '预计完成日期',
    actual_completion_date DATE NULL COMMENT '实际完成日期',
    
    -- 产品和服务选择
    selected_treatment_plan TEXT NULL COMMENT '选择的治疗方案（JSON格式）',
    selected_products TEXT NULL COMMENT '选择的产品（JSON格式）',
    treatment_notes TEXT NULL COMMENT '治疗记录',
    special_requirements TEXT NULL COMMENT '特殊要求',
    
    -- 价格和支付信息
    total_cost DECIMAL(10,2) NULL COMMENT '总费用',
    paid_amount DECIMAL(10,2) NULL DEFAULT 0.00 COMMENT '已支付金额',
    remaining_balance DECIMAL(10,2) NULL COMMENT '剩余余额',
    payment_status ENUM('unpaid', 'partial_paid', 'paid', 'refunded') NULL DEFAULT 'unpaid' COMMENT '支付状态',
    payment_method ENUM('cash', 'credit_card', 'debit_card', 'bank_transfer', 'insurance', 'installment') NULL COMMENT '支付方式',
    installment_plan TEXT NULL COMMENT '分期付款计划（JSON格式）',
    discount_amount DECIMAL(10,2) NULL DEFAULT 0.00 COMMENT '折扣金额',
    discount_reason VARCHAR(200) NULL COMMENT '折扣原因',
    
    -- 预约和提醒
    appointment_reminder TINYINT(1) NULL DEFAULT 1 COMMENT '是否发送预约提醒',
    reminder_method ENUM('sms', 'email', 'line', 'wechat', 'phone') NULL COMMENT '提醒方式',
    reminder_time INT NULL DEFAULT 24 COMMENT '提前提醒时间（小时）',
    no_show_count INT NULL DEFAULT 0 COMMENT '爽约次数',
    cancellation_count INT NULL DEFAULT 0 COMMENT '取消次数',
    
    -- 满意度评价
    satisfaction_rating DECIMAL(3,2) NULL COMMENT '满意度评分',
    service_rating DECIMAL(3,2) NULL COMMENT '服务评分',
    doctor_rating DECIMAL(3,2) NULL COMMENT '医生评分',
    facility_rating DECIMAL(3,2) NULL COMMENT '设施评分',
    review_text TEXT NULL COMMENT '评价内容',
    review_date TIMESTAMP NULL COMMENT '评价日期',
    
    -- 状态信息
    status ENUM('active', 'inactive', 'suspended', 'discharged') NULL DEFAULT 'active' COMMENT '患者状态',
    is_verified TINYINT(1) NULL DEFAULT 0 COMMENT '是否已验证',
    verified_at TIMESTAMP NULL COMMENT '验证时间',
    is_vip TINYINT(1) NULL DEFAULT 0 COMMENT '是否VIP患者',
    vip_level ENUM('bronze', 'silver', 'gold', 'platinum', 'diamond') NULL COMMENT 'VIP等级',
    
    -- 备用字段
    avatar_url VARCHAR(500) NULL COMMENT '头像URL',
    occupation VARCHAR(100) NULL COMMENT '职业',
    education_level VARCHAR(50) NULL COMMENT '教育程度',
    marital_status ENUM('single', 'married', 'divorced', 'widowed') NULL COMMENT '婚姻状况',
    family_members TEXT NULL COMMENT '家庭成员信息（JSON格式）',
    hobbies TEXT NULL COMMENT '兴趣爱好（JSON格式）',
    preferred_language VARCHAR(20) NULL DEFAULT 'zh-TW' COMMENT '偏好语言',
    communication_preference ENUM('phone', 'email', 'line', 'wechat', 'sms') NULL COMMENT '沟通偏好',
    
    -- 系统字段
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by VARCHAR(100) NULL COMMENT '创建者',
    updated_by VARCHAR(100) NULL COMMENT '更新者',
    is_deleted TINYINT(1) NULL DEFAULT 0 COMMENT '是否删除',
    deleted_at TIMESTAMP NULL COMMENT '删除时间',
    
    -- 索引
    INDEX idx_patient_id (patient_id),
    INDEX idx_uuid (uuid),
    INDEX idx_full_name (full_name),
    INDEX idx_phone (phone),
    INDEX idx_email (email),
    INDEX idx_clinic_id (clinic_id),
    INDEX idx_assigned_doctor_uuid (assigned_doctor_uuid),
    INDEX idx_receptionist_id (receptionist_id),
    INDEX idx_treatment_status (treatment_status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_status (status),
    INDEX idx_vip_level (vip_level),
    INDEX idx_first_visit_date (first_visit_date),
    INDEX idx_next_appointment_date (next_appointment_date),
    INDEX idx_created_at (created_at),
    INDEX idx_is_deleted (is_deleted)
) COMMENT='就诊者用户表';

-- 创建序列表用于生成patient_id
CREATE TABLE `pd`.patients_sequence (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建触发器：插入前自动生成patient_id和uuid
DELIMITER //
CREATE TRIGGER before_patients_insert 
BEFORE INSERT ON `pd`.patients
FOR EACH ROW
BEGIN
    DECLARE sequence_id INT;
    
    -- 如果patient_id为空，则生成新的patient_id
    IF NEW.patient_id IS NULL THEN
        -- 插入序列表获取新的序列号
        INSERT INTO `pd`.patients_sequence () VALUES ();
        SET sequence_id = LAST_INSERT_ID();
        SET NEW.patient_id = CONCAT('PT', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(sequence_id, 6, '0'));
    END IF;
    
    -- 如果uuid为空，则设置为UUID
    IF NEW.uuid IS NULL THEN
        SET NEW.uuid = UUID();
    END IF;
    
    -- 计算剩余余额
    IF NEW.total_cost IS NOT NULL AND NEW.paid_amount IS NOT NULL THEN
        SET NEW.remaining_balance = NEW.total_cost - NEW.paid_amount;
    END IF;
    
    -- 设置支付状态
    IF NEW.paid_amount IS NOT NULL AND NEW.total_cost IS NOT NULL THEN
        IF NEW.paid_amount = 0 THEN
            SET NEW.payment_status = 'unpaid';
        ELSEIF NEW.paid_amount >= NEW.total_cost THEN
            SET NEW.payment_status = 'paid';
        ELSE
            SET NEW.payment_status = 'partial_paid';
        END IF;
    END IF;
END//
DELIMITER ;

-- 插入示例患者数据
INSERT INTO `pd`.patients (
    full_name,
    birth_date,
    gender,
    phone,
    email,
    city,
    clinic_id,
    assigned_doctor_uuid,
    receptionist_id,
    treatment_status,
    selected_treatment_plan,
    total_cost,
    paid_amount,
    payment_status,
    payment_method,
    status,
    is_verified
) VALUES 
('陈小明', '1995-03-15', 'male', '0912345678', 'chen@example.com', '台北市', 'CL20241201000001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'treatment_in_progress', '["牙齿矫正", "美白治疗"]', 50000.00, 25000.00, 'partial_paid', 'installment', 'active', 1),
('林美玲', '1988-07-22', 'female', '0923456789', 'lin@example.com', '高雄市', 'CL20241201000002', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'treatment_completed', '["植牙手术"]', 80000.00, 80000.00, 'paid', 'credit_card', 'active', 1),
('王大卫', '1990-11-08', 'male', '0934567890', 'wang@example.com', '台中市', 'CL20241201000003', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'initial_consultation', '["根管治疗"]', 15000.00, 0.00, 'unpaid', 'cash', 'active', 1),
('张雅婷', '1992-05-30', 'female', '0945678901', 'zhang@example.com', '新竹市', 'CL20241201000004', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'treatment_planning', '["隐形矫正"]', 120000.00, 30000.00, 'partial_paid', 'bank_transfer', 'active', 1);

-- 创建视图：活跃患者
CREATE VIEW `pd`.active_patients AS
SELECT 
    patient_id,
    full_name,
    phone,
    email,
    city,
    clinic_id,
    assigned_doctor_uuid,
    treatment_status,
    treatment_progress,
    total_cost,
    paid_amount,
    remaining_balance,
    payment_status,
    next_appointment_date,
    status,
    created_at
FROM `pd`.patients 
WHERE is_deleted = 0 AND status = 'active'
ORDER BY next_appointment_date ASC;

-- 创建视图：VIP患者
CREATE VIEW `pd`.vip_patients AS
SELECT 
    patient_id,
    full_name,
    phone,
    email,
    vip_level,
    total_cost,
    paid_amount,
    satisfaction_rating,
    last_visit_date,
    next_appointment_date
FROM `pd`.patients 
WHERE is_deleted = 0 AND status = 'active' AND is_vip = 1
ORDER BY vip_level DESC, total_cost DESC;

-- 创建视图：待支付患者
CREATE VIEW `pd`.unpaid_patients AS
SELECT 
    patient_id,
    full_name,
    phone,
    email,
    total_cost,
    paid_amount,
    remaining_balance,
    payment_status,
    next_appointment_date
FROM `pd`.patients 
WHERE is_deleted = 0 AND status = 'active' AND payment_status IN ('unpaid', 'partial_paid')
ORDER BY remaining_balance DESC;

-- 创建存储过程：根据治疗状态统计患者
DELIMITER //
CREATE PROCEDURE `pd`.GetPatientStatsByTreatmentStatus()
BEGIN
    SELECT 
        treatment_status,
        COUNT(*) as total_patients,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_patients,
        AVG(total_cost) as avg_cost,
        AVG(treatment_progress) as avg_progress,
        SUM(total_cost) as total_revenue,
        SUM(paid_amount) as total_paid
    FROM `pd`.patients 
    WHERE is_deleted = 0 AND status = 'active'
    GROUP BY treatment_status
    ORDER BY total_patients DESC;
END//
DELIMITER ;

-- 创建存储过程：根据诊所统计患者
DELIMITER //
CREATE PROCEDURE `pd`.GetPatientStatsByClinic()
BEGIN
    SELECT 
        p.clinic_id,
        c.clinic_name,
        COUNT(*) as total_patients,
        COUNT(CASE WHEN p.payment_status = 'paid' THEN 1 END) as paid_patients,
        AVG(p.total_cost) as avg_cost,
        SUM(p.total_cost) as total_revenue,
        SUM(p.paid_amount) as total_paid,
        AVG(p.satisfaction_rating) as avg_satisfaction
    FROM `pd`.patients p
    LEFT JOIN `pd`.clinics c ON p.clinic_id = c.clinic_id
    WHERE p.is_deleted = 0 AND p.status = 'active'
    GROUP BY p.clinic_id, c.clinic_name
    ORDER BY total_patients DESC;
END//
DELIMITER ;

-- 创建存储过程：获取今日预约患者
DELIMITER //
CREATE PROCEDURE `pd`.GetTodayAppointments()
BEGIN
    SELECT 
        patient_id,
        full_name,
        phone,
        email,
        next_appointment_date,
        treatment_status,
        assigned_doctor_uuid,
        clinic_id
    FROM `pd`.patients 
    WHERE is_deleted = 0 
    AND status = 'active'
    AND DATE(next_appointment_date) = CURDATE()
    ORDER BY next_appointment_date ASC;
END//
DELIMITER ; 