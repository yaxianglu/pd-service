-- 查询smile_test表数据的SQL语句
USE pd;

-- 1. 查询所有数据（基础查询）
SELECT * FROM smile_test WHERE is_deleted = 0 ORDER BY created_at DESC;

-- 2. 查询最近的数据（最近7天）
SELECT 
    id,
    test_id,
    uuid,
    full_name,
    birth_date,
    phone,
    email,
    line_id,
    city,
    teeth_type,
    test_status,
    created_at,
    updated_at
FROM smile_test 
WHERE is_deleted = 0 
    AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY created_at DESC;

-- 3. 按状态查询数据
SELECT 
    test_status,
    COUNT(*) as count,
    MIN(created_at) as earliest,
    MAX(created_at) as latest
FROM smile_test 
WHERE is_deleted = 0
GROUP BY test_status
ORDER BY count DESC;

-- 4. 查询已完成的数据（包含照片信息）
SELECT 
    id,
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
    teeth_image_1 IS NOT NULL as has_image_1,
    teeth_image_2 IS NOT NULL as has_image_2,
    teeth_image_3 IS NOT NULL as has_image_3,
    teeth_image_4 IS NOT NULL as has_image_4,
    test_status,
    created_at,
    updated_at
FROM smile_test 
WHERE is_deleted = 0 
    AND test_status = 'completed'
ORDER BY created_at DESC;

-- 5. 查询特定UUID的数据
-- 替换 'your-uuid-here' 为实际的UUID
SELECT * FROM smile_test 
WHERE uuid = 'your-uuid-here' AND is_deleted = 0;

-- 6. 查询按城市分组的数据
SELECT 
    city,
    COUNT(*) as total_tests,
    COUNT(CASE WHEN test_status = 'completed' THEN 1 END) as completed_tests,
    COUNT(CASE WHEN test_status = 'in_progress' THEN 1 END) as in_progress_tests,
    COUNT(CASE WHEN test_status = 'pending' THEN 1 END) as pending_tests
FROM smile_test 
WHERE is_deleted = 0
GROUP BY city
ORDER BY total_tests DESC;

-- 7. 查询按牙齿类型分组的数据
SELECT 
    teeth_type,
    COUNT(*) as count
FROM smile_test 
WHERE is_deleted = 0
    AND teeth_type IS NOT NULL
GROUP BY teeth_type
ORDER BY count DESC;

-- 8. 查询今日新增数据
SELECT 
    id,
    test_id,
    uuid,
    full_name,
    phone,
    email,
    test_status,
    created_at
FROM smile_test 
WHERE is_deleted = 0 
    AND DATE(created_at) = CURDATE()
ORDER BY created_at DESC;

-- 9. 查询有照片上传的数据
SELECT 
    id,
    test_id,
    uuid,
    full_name,
    test_status,
    CASE 
        WHEN teeth_image_1 IS NOT NULL THEN 1 ELSE 0 
    END + 
    CASE 
        WHEN teeth_image_2 IS NOT NULL THEN 1 ELSE 0 
    END + 
    CASE 
        WHEN teeth_image_3 IS NOT NULL THEN 1 ELSE 0 
    END + 
    CASE 
        WHEN teeth_image_4 IS NOT NULL THEN 1 ELSE 0 
    END as photo_count,
    created_at
FROM smile_test 
WHERE is_deleted = 0
    AND (teeth_image_1 IS NOT NULL OR teeth_image_2 IS NOT NULL OR teeth_image_3 IS NOT NULL OR teeth_image_4 IS NOT NULL)
ORDER BY created_at DESC;

-- 10. 统计信息查询
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN test_status = 'completed' THEN 1 END) as completed_count,
    COUNT(CASE WHEN test_status = 'in_progress' THEN 1 END) as in_progress_count,
    COUNT(CASE WHEN test_status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN test_status = 'cancelled' THEN 1 END) as cancelled_count,
    COUNT(CASE WHEN teeth_image_1 IS NOT NULL THEN 1 END) as with_photos_count,
    MIN(created_at) as earliest_record,
    MAX(created_at) as latest_record
FROM smile_test 
WHERE is_deleted = 0; 