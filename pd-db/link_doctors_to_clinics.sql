-- 建立医生和诊所的关联关系
-- 使用admin_users表的department字段存储诊所UUID

USE pd;

-- 首先，我们需要确保有一些医生用户
-- 如果没有医生用户，先创建一些示例医生
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
('doctor.zhang', 'hashed_doctor123', 'doctor.zhang@smile.com', '张美华医师', '0912345678', 'doctor', NULL, '主治医师', 'active', 1),
('doctor.li', 'hashed_doctor456', 'doctor.li@ortho.com', '李正畸医师', '0923456789', 'doctor', NULL, '主治医师', 'active', 1),
('doctor.wang', 'hashed_doctor789', 'doctor.wang@kids.com', '王小明医师', '0934567890', 'doctor', NULL, '主治医师', 'active', 1),
('doctor.chen', 'hashed_doctor012', 'doctor.chen@general.com', '陈综合医师', '0945678901', 'doctor', NULL, '主治医师', 'active', 1)
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    phone = VALUES(phone),
    position = VALUES(position),
    updated_at = CURRENT_TIMESTAMP;

-- 现在建立医生和诊所的关联关系
-- 张美华医师 -> 台北微笑牙医诊所
UPDATE `pd`.admin_users 
SET department = (SELECT uuid FROM `pd`.clinics WHERE clinic_name = '台北微笑牙医诊所' LIMIT 1)
WHERE username = 'doctor.zhang' AND role = 'doctor';

-- 李正畸医师 -> 高雄正畸专科诊所
UPDATE `pd`.admin_users 
SET department = (SELECT uuid FROM `pd`.clinics WHERE clinic_name = '高雄正畸专科诊所' LIMIT 1)
WHERE username = 'doctor.li' AND role = 'doctor';

-- 王小明医师 -> 台中儿童牙医诊所
UPDATE `pd`.admin_users 
SET department = (SELECT uuid FROM `pd`.clinics WHERE clinic_name = '台中儿童牙医诊所' LIMIT 1)
WHERE username = 'doctor.wang' AND role = 'doctor';

-- 陈综合医师 -> 新竹综合牙医诊所
UPDATE `pd`.admin_users 
SET department = (SELECT uuid FROM `pd`.clinics WHERE clinic_name = '新竹综合牙医诊所' LIMIT 1)
WHERE username = 'doctor.chen' AND role = 'doctor';

-- 验证关联关系
SELECT 
    au.username,
    au.full_name,
    au.role,
    au.department as clinic_uuid,
    c.clinic_name,
    c.city,
    c.district
FROM `pd`.admin_users au
LEFT JOIN `pd`.clinics c ON au.department = c.uuid
WHERE au.role = 'doctor' AND au.is_deleted = 0
ORDER BY au.username;

-- 创建视图：医生和诊所的关联信息
CREATE OR REPLACE VIEW `pd`.doctor_clinic_relations AS
SELECT 
    au.id as doctor_id,
    au.user_id as doctor_user_id,
    au.uuid as doctor_uuid,
    au.username as doctor_username,
    au.full_name as doctor_name,
    au.phone as doctor_phone,
    au.email as doctor_email,
    au.position as doctor_position,
    au.status as doctor_status,
    au.department as clinic_uuid,
    c.clinic_id,
    c.clinic_name,
    c.clinic_code,
    c.address as clinic_address,
    c.city as clinic_city,
    c.district as clinic_district,
    c.province as clinic_province,
    c.phone as clinic_phone,
    c.email as clinic_email,
    c.clinic_type,
    c.rating as clinic_rating,
    c.status as clinic_status,
    au.created_at as doctor_created_at,
    c.created_at as clinic_created_at
FROM `pd`.admin_users au
LEFT JOIN `pd`.clinics c ON au.department = c.uuid
WHERE au.role = 'doctor' 
    AND au.is_deleted = 0 
    AND c.is_deleted = 0
ORDER BY c.clinic_name, au.full_name;

-- 创建存储过程：根据诊所UUID获取医生列表
DELIMITER //
CREATE PROCEDURE `pd`.GetDoctorsByClinic(IN clinic_uuid CHAR(36))
BEGIN
    SELECT 
        au.id,
        au.user_id,
        au.uuid,
        au.username,
        au.full_name,
        au.phone,
        au.email,
        au.position,
        au.status,
        au.is_verified,
        au.avatar,
        au.bio,
        au.created_at
    FROM `pd`.admin_users au
    WHERE au.role = 'doctor' 
        AND au.department = clinic_uuid
        AND au.is_deleted = 0
        AND au.status = 'active'
    ORDER BY au.full_name;
END//
DELIMITER ;

-- 创建存储过程：根据医生UUID获取诊所信息
DELIMITER //
CREATE PROCEDURE `pd`.GetClinicByDoctor(IN doctor_uuid CHAR(36))
BEGIN
    SELECT 
        c.id,
        c.clinic_id,
        c.uuid,
        c.clinic_name,
        c.clinic_code,
        c.address,
        c.city,
        c.district,
        c.province,
        c.country,
        c.phone,
        c.email,
        c.website,
        c.line_id,
        c.wechat_id,
        c.clinic_type,
        c.specialties,
        c.owner_name,
        c.chief_doctor,
        c.doctor_count,
        c.staff_count,
        c.facility_level,
        c.services_offered,
        c.rating,
        c.review_count,
        c.patient_count,
        c.satisfaction_rate,
        c.status,
        c.is_verified,
        c.is_featured,
        c.logo_url,
        c.banner_url,
        c.description,
        c.highlights,
        c.created_at,
        c.updated_at
    FROM `pd`.clinics c
    INNER JOIN `pd`.admin_users au ON c.uuid = au.department
    WHERE au.uuid = doctor_uuid
        AND au.role = 'doctor'
        AND c.is_deleted = 0
        AND au.is_deleted = 0;
END//
DELIMITER ;
