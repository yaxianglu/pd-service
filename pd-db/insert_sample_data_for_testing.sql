-- 插入示例数据用于测试 smile-test 关联查询接口
-- 注意：在执行此脚本前，请确保已经运行了之前的表结构创建脚本

USE pd;

-- 1. 插入示例医生用户
INSERT INTO admin_users (
    user_id, 
    uuid, 
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
    verified_at,
    is_deleted
) VALUES 
('AU001', '550e8400-e29b-41d4-a716-446655440003', 'dr.lee', '$2b$10$example_hash', 'dr.lee@clinic.com', '李医生', '0923456789', 'doctor', '矫正科', '主治医师', 'active', 1, NOW(), 0),
('AU002', '550e8400-e29b-41d4-a716-446655440004', 'dr.wang', '$2b$10$example_hash', 'dr.wang@clinic.com', '王医生', '0934567890', 'doctor', '矫正科', '主治医师', 'active', 1, NOW(), 0);

-- 2. 插入示例患者
INSERT INTO patients (
    patient_id,
    uuid,
    full_name,
    birth_date,
    gender,
    phone,
    email,
    line_id,
    wechat_id,
    address,
    city,
    district,
    postal_code,
    emergency_contact,
    emergency_phone,
    blood_type,
    allergies,
    medical_history,
    current_medications,
    dental_history,
    insurance_provider,
    insurance_number,
    clinic_id,
    assigned_doctor_uuid,
    receptionist_id,
    referral_source,
    first_visit_date,
    last_visit_date,
    next_appointment_date,
    treatment_status,
    treatment_phase,
    treatment_progress,
    estimated_completion_date,
    selected_treatment_plan,
    selected_products,
    treatment_notes,
    special_requirements,
    total_cost,
    paid_amount,
    remaining_balance,
    payment_status,
    payment_method,
    installment_plan,
    discount_amount,
    discount_reason,
    appointment_reminder,
    reminder_method,
    reminder_time,
    no_show_count,
    cancellation_count,
    satisfaction_rating,
    service_rating,
    doctor_rating,
    facility_rating,
    review_text,
    review_date,
    status,
    is_verified,
    verified_at,
    is_vip,
    vip_level,
    avatar_url,
    occupation,
    education_level,
    marital_status,
    family_members,
    hobbies,
    preferred_language,
    communication_preference,
    is_deleted
) VALUES 
('P001', '550e8400-e29b-41d4-a716-446655440002', '张三', '1990-01-01', 'male', '0912345678', 'zhang@example.com', 'zhang123', 'zhang123', '台北市信义区', '台北市', '信义区', '110', '李四', '0987654321', 'A+', '无', '无', '无', '无', '国泰人寿', 'INS001', 'CL001', '550e8400-e29b-41d4-a716-446655440003', 'R001', '网络搜索', '2024-01-01', '2024-01-15', '2024-02-15 10:00:00', 'treatment_in_progress', '矫正阶段', 25.50, '2025-01-01', '隐形矫正', '隐适美', '患者配合度良好', '无', 80000.00, 20000.00, 60000.00, 'partial_paid', 'installment', '分期付款', 0.00, NULL, 1, 'line', 24, 0, 0, 4.5, 4.5, 5.0, 4.5, '服务很好', '2024-01-15', 'active', 1, '2024-01-01', 0, NULL, NULL, '工程师', '大学', 'married', '妻子、儿子', '阅读、运动', 'zh-TW', 'line', 0),
('P002', '550e8400-e29b-41d4-a716-446655440005', '李美玲', '1988-07-22', 'female', '0923456789', 'li@example.com', 'li456', 'li456', '高雄市前金区', '高雄市', '前金区', '801', '王小明', '0976543210', 'B+', '无', '无', '无', '无', '南山人寿', 'INS002', 'CL002', '550e8400-e29b-41d4-a716-446655440004', 'R002', '朋友推荐', '2024-01-02', '2024-01-16', '2024-02-16 14:00:00', 'treatment_planning', '计划阶段', 0.00, '2025-02-01', '传统矫正', '传统托槽', '患者对治疗计划满意', '无', 60000.00, 0.00, 60000.00, 'unpaid', 'cash', NULL, 0.00, NULL, 1, 'email', 24, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, 'active', 1, '2024-01-02', 0, NULL, NULL, '设计师', '大学', 'single', '父母', '绘画、旅行', 'zh-TW', 'email', 0);

-- 3. 插入示例微笑测试数据
INSERT INTO smile_test (
    test_id,
    uuid,
    full_name,
    birth_date,
    phone,
    email,
    line_id,
    city,
    teeth_type,
    considerations,
    improvement_points,
    teeth_image_1,
    teeth_image_2,
    teeth_image_3,
    teeth_image_4,
    age,
    gender,
    occupation,
    address,
    emergency_contact,
    emergency_phone,
    dental_history,
    current_issues,
    allergies,
    medications,
    test_score,
    confidence_level,
    recommended_treatment,
    estimated_cost,
    test_status,
    appointment_date,
    follow_up_date,
    patient_uuid,
    is_deleted
) VALUES 
('TEST001', '550e8400-e29b-41d4-a716-446655440001', '张三', '1990-01-01', '0912345678', 'zhang@example.com', 'zhang123', '台北市', 'crowded', '牙齿拥挤', '需要矫正', 'base64_encoded_image_1', 'base64_encoded_image_2', 'base64_encoded_image_3', 'base64_encoded_image_4', 33, 'male', '工程师', '台北市信义区', '李四', '0987654321', '无', '牙齿拥挤', '无', '无', 85.5, 'high', '隐形矫正', 80000.00, 'completed', '2024-01-15 10:00:00', '2024-02-15 10:00:00', '550e8400-e29b-41d4-a716-446655440002', 0),
('TEST002', '550e8400-e29b-41d4-a716-446655440006', '李美玲', '1988-07-22', '0923456789', 'li@example.com', 'li456', '高雄市', 'spaced', '牙齿间隙过大', '需要矫正', 'base64_encoded_image_5', 'base64_encoded_image_6', 'base64_encoded_image_7', 'base64_encoded_image_8', 35, 'female', '设计师', '高雄市前金区', '王小明', '0976543210', '无', '牙齿间隙过大', '无', '无', 78.0, 'medium', '传统矫正', 60000.00, 'in_progress', '2024-01-16 14:00:00', '2024-02-16 14:00:00', '550e8400-e29b-41d4-a716-446655440005', 0),
('TEST003', '550e8400-e29b-41d4-a716-446655440007', '王大卫', '1992-05-30', '0934567890', 'wang@example.com', 'wang789', '台中市', 'overbite', '深覆合', '需要矫正', 'base64_encoded_image_9', 'base64_encoded_image_10', 'base64_encoded_image_11', 'base64_encoded_image_12', 31, 'male', '销售员', '台中市西区', '张雅婷', '0965432109', '无', '深覆合', '无', '无', 92.0, 'high', '隐形矫正', 90000.00, 'pending', NULL, NULL, NULL, 0);

-- 4. 验证插入的数据
SELECT 'Sample data inserted successfully!' as message;

-- 5. 查看插入的数据
SELECT 'Admin Users:' as info;
SELECT uuid, username, full_name, role, department, status FROM admin_users WHERE is_deleted = 0;

SELECT 'Patients:' as info;
SELECT uuid, full_name, assigned_doctor_uuid, treatment_status FROM patients WHERE is_deleted = 0;

SELECT 'Smile Tests:' as info;
SELECT uuid, full_name, patient_uuid, test_status FROM smile_test WHERE is_deleted = 0;

-- 6. 测试关联查询
SELECT 'Testing relationships:' as info;
SELECT 
    st.test_id,
    st.full_name as test_patient_name,
    st.patient_uuid,
    p.full_name as patient_name,
    au.full_name as doctor_name,
    au.role as doctor_role
FROM smile_test st
LEFT JOIN patients p ON st.patient_uuid = p.uuid
LEFT JOIN admin_users au ON p.assigned_doctor_uuid = au.uuid
WHERE st.is_deleted = 0 
AND (p.is_deleted = 0 OR p.is_deleted IS NULL)
AND (au.is_deleted = 0 OR au.is_deleted IS NULL)
ORDER BY st.created_at DESC;
