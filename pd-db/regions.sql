-- 创建台湾地区数据库表
USE pd;

-- 创建地区表
CREATE TABLE `pd`.regions (
    -- 主键和唯一标识
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    region_id VARCHAR(50) NULL UNIQUE COMMENT '地区唯一标识符',
    uuid CHAR(36) NULL UNIQUE COMMENT '随机UUID',
    
    -- 基本信息
    region_name VARCHAR(100) NOT NULL COMMENT '地区名称',
    region_code VARCHAR(20) NULL COMMENT '地区代码',
    region_type ENUM('province', 'city', 'district', 'township') NULL COMMENT '地区类型',
    parent_id VARCHAR(50) NULL COMMENT '上级地区ID',
    level INT NULL COMMENT '地区层级（1=省，2=市，3=区县，4=乡镇）',
    
    -- 地理位置
    latitude DECIMAL(10, 8) NULL COMMENT '纬度',
    longitude DECIMAL(11, 8) NULL COMMENT '经度',
    area_km2 DECIMAL(10, 2) NULL COMMENT '面积（平方公里）',
    population INT NULL COMMENT '人口数量',
    population_density DECIMAL(10, 2) NULL COMMENT '人口密度（人/平方公里）',
    
    -- 行政区划信息
    postal_code VARCHAR(10) NULL COMMENT '邮政编码',
    area_code VARCHAR(10) NULL COMMENT '区号',
    timezone VARCHAR(50) NULL DEFAULT 'Asia/Taipei' COMMENT '时区',
    language VARCHAR(20) NULL DEFAULT 'zh-TW' COMMENT '主要语言',
    
    -- 经济信息
    gdp DECIMAL(15, 2) NULL COMMENT 'GDP（万元）',
    gdp_per_capita DECIMAL(10, 2) NULL COMMENT '人均GDP（万元）',
    unemployment_rate DECIMAL(5, 2) NULL COMMENT '失业率（%）',
    average_income DECIMAL(10, 2) NULL COMMENT '平均收入（万元）',
    
    -- 医疗相关信息
    hospital_count INT NULL COMMENT '医院数量',
    clinic_count INT NULL COMMENT '诊所数量',
    dentist_count INT NULL COMMENT '牙医数量',
    medical_facility_count INT NULL COMMENT '医疗机构总数',
    medical_staff_count INT NULL COMMENT '医疗人员数量',
    
    -- 交通信息
    public_transport_score DECIMAL(3, 2) NULL COMMENT '公共交通评分（1-5）',
    highway_access TINYINT(1) NULL COMMENT '是否有高速公路',
    train_station_count INT NULL COMMENT '火车站数量',
    bus_station_count INT NULL COMMENT '公交站数量',
    mrt_station_count INT NULL COMMENT '捷运站数量',
    
    -- 教育信息
    university_count INT NULL COMMENT '大学数量',
    college_count INT NULL COMMENT '学院数量',
    high_school_count INT NULL COMMENT '高中数量',
    elementary_school_count INT NULL COMMENT '小学数量',
    education_level_score DECIMAL(3, 2) NULL COMMENT '教育水平评分（1-5）',
    
    -- 生活品质
    cost_of_living_index DECIMAL(5, 2) NULL COMMENT '生活成本指数',
    housing_price_index DECIMAL(5, 2) NULL COMMENT '房价指数',
    safety_score DECIMAL(3, 2) NULL COMMENT '安全评分（1-5）',
    environmental_score DECIMAL(3, 2) NULL COMMENT '环境评分（1-5）',
    quality_of_life_score DECIMAL(3, 2) NULL COMMENT '生活品质评分（1-5）',
    
    -- 旅游信息
    tourist_attractions TEXT NULL COMMENT '旅游景点（JSON格式）',
    hotel_count INT NULL COMMENT '酒店数量',
    restaurant_count INT NULL COMMENT '餐厅数量',
    shopping_mall_count INT NULL COMMENT '购物中心数量',
    tourism_score DECIMAL(3, 2) NULL COMMENT '旅游评分（1-5）',
    
    -- 气候信息
    climate_type VARCHAR(50) NULL COMMENT '气候类型',
    average_temperature DECIMAL(4, 1) NULL COMMENT '平均温度（摄氏度）',
    annual_rainfall DECIMAL(8, 2) NULL COMMENT '年降雨量（毫米）',
    humidity_level DECIMAL(5, 2) NULL COMMENT '湿度水平（%）',
    air_quality_index DECIMAL(5, 2) NULL COMMENT '空气质量指数',
    
    -- 状态信息
    status ENUM('active', 'inactive', 'merged', 'discontinued') NULL DEFAULT 'active' COMMENT '地区状态',
    is_capital TINYINT(1) NULL DEFAULT 0 COMMENT '是否为省会/首府',
    is_major_city TINYINT(1) NULL DEFAULT 0 COMMENT '是否为主要城市',
    is_tourist_destination TINYINT(1) NULL DEFAULT 0 COMMENT '是否为旅游目的地',
    
    -- 备用字段
    region_alias TEXT NULL COMMENT '地区别名（JSON格式）',
    region_description TEXT NULL COMMENT '地区描述',
    historical_info TEXT NULL COMMENT '历史信息',
    cultural_info TEXT NULL COMMENT '文化信息',
    local_customs TEXT NULL COMMENT '当地习俗',
    famous_products TEXT NULL COMMENT '特产（JSON格式）',
    local_dialect VARCHAR(100) NULL COMMENT '当地方言',
    traditional_festivals TEXT NULL COMMENT '传统节日（JSON格式）',
    
    -- 系统字段
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by VARCHAR(100) NULL COMMENT '创建者',
    updated_by VARCHAR(100) NULL COMMENT '更新者',
    is_deleted TINYINT(1) NULL DEFAULT 0 COMMENT '是否删除',
    deleted_at TIMESTAMP NULL COMMENT '删除时间',
    
    -- 索引
    INDEX idx_region_id (region_id),
    INDEX idx_uuid (uuid),
    INDEX idx_region_name (region_name),
    INDEX idx_region_code (region_code),
    INDEX idx_region_type (region_type),
    INDEX idx_parent_id (parent_id),
    INDEX idx_level (level),
    INDEX idx_status (status),
    INDEX idx_is_capital (is_capital),
    INDEX idx_is_major_city (is_major_city),
    INDEX idx_postal_code (postal_code),
    INDEX idx_created_at (created_at),
    INDEX idx_is_deleted (is_deleted),
    INDEX idx_location (latitude, longitude)
) COMMENT='台湾地区信息表';

-- 创建序列表用于生成region_id
CREATE TABLE `pd`.regions_sequence (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建触发器：插入前自动生成region_id和uuid
DELIMITER //
CREATE TRIGGER before_regions_insert 
BEFORE INSERT ON `pd`.regions
FOR EACH ROW
BEGIN
    DECLARE sequence_id INT;
    
    -- 如果region_id为空，则生成新的region_id
    IF NEW.region_id IS NULL THEN
        -- 插入序列表获取新的序列号
        INSERT INTO `pd`.regions_sequence () VALUES ();
        SET sequence_id = LAST_INSERT_ID();
        SET NEW.region_id = CONCAT('RG', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(sequence_id, 6, '0'));
    END IF;
    
    -- 如果uuid为空，则设置为UUID
    IF NEW.uuid IS NULL THEN
        SET NEW.uuid = UUID();
    END IF;
    
    -- 根据地区类型设置层级
    IF NEW.region_type = 'province' THEN
        SET NEW.level = 1;
    ELSEIF NEW.region_type = 'city' THEN
        SET NEW.level = 2;
    ELSEIF NEW.region_type = 'district' THEN
        SET NEW.level = 3;
    ELSEIF NEW.region_type = 'township' THEN
        SET NEW.level = 4;
    END IF;
END//
DELIMITER ;

-- 创建视图：省级地区
CREATE VIEW `pd`.province_regions AS
SELECT 
    region_id,
    region_name,
    region_code,
    latitude,
    longitude,
    area_km2,
    population,
    is_capital,
    status,
    created_at
FROM `pd`.regions 
WHERE is_deleted = 0 AND status = 'active' AND region_type = 'province'
ORDER BY region_name;

-- 创建视图：市级地区
CREATE VIEW `pd`.city_regions AS
SELECT 
    r.region_id,
    r.region_name,
    r.region_code,
    r.latitude,
    r.longitude,
    r.area_km2,
    r.population,
    r.is_major_city,
    p.region_name as province_name,
    r.status,
    r.created_at
FROM `pd`.regions r
LEFT JOIN `pd`.regions p ON r.parent_id = p.region_id
WHERE r.is_deleted = 0 AND r.status = 'active' AND r.region_type = 'city'
ORDER BY p.region_name, r.region_name;

-- 创建视图：区县级地区
CREATE VIEW `pd`.district_regions AS
SELECT 
    r.region_id,
    r.region_name,
    r.region_code,
    r.latitude,
    r.longitude,
    r.area_km2,
    r.population,
    c.region_name as city_name,
    p.region_name as province_name,
    r.status,
    r.created_at
FROM `pd`.regions r
LEFT JOIN `pd`.regions c ON r.parent_id = c.region_id
LEFT JOIN `pd`.regions p ON c.parent_id = p.region_id
WHERE r.is_deleted = 0 AND r.status = 'active' AND r.region_type = 'district'
ORDER BY p.region_name, c.region_name, r.region_name;

-- 创建视图：主要城市
CREATE VIEW `pd`.major_cities AS
SELECT 
    region_id,
    region_name,
    region_code,
    latitude,
    longitude,
    population,
    gdp,
    hospital_count,
    clinic_count,
    quality_of_life_score,
    tourism_score
FROM `pd`.regions 
WHERE is_deleted = 0 AND status = 'active' AND is_major_city = 1
ORDER BY population DESC;

-- 创建存储过程：获取地区层级结构
DELIMITER //
CREATE PROCEDURE `pd`.GetRegionHierarchy(IN target_region_id VARCHAR(50))
BEGIN
    WITH RECURSIVE region_tree AS (
        -- 基础查询：获取目标地区
        SELECT 
            region_id,
            region_name,
            region_type,
            level,
            parent_id,
            0 as depth,
            CAST(region_name AS CHAR(1000)) as path
        FROM `pd`.regions 
        WHERE region_id = target_region_id AND is_deleted = 0
        
        UNION ALL
        
        -- 递归查询：获取子地区
        SELECT 
            r.region_id,
            r.region_name,
            r.region_type,
            r.level,
            r.parent_id,
            rt.depth + 1,
            CONCAT(rt.path, ' > ', r.region_name) as path
        FROM `pd`.regions r
        INNER JOIN region_tree rt ON r.parent_id = rt.region_id
        WHERE r.is_deleted = 0
    )
    SELECT * FROM region_tree ORDER BY depth, region_name;
END//
DELIMITER ;

-- 创建存储过程：根据地区类型统计
DELIMITER //
CREATE PROCEDURE `pd`.GetRegionStatsByType()
BEGIN
    SELECT 
        region_type,
        COUNT(*) as total_regions,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_regions,
        AVG(population) as avg_population,
        SUM(population) as total_population,
        AVG(area_km2) as avg_area,
        SUM(area_km2) as total_area,
        AVG(hospital_count) as avg_hospitals,
        AVG(clinic_count) as avg_clinics
    FROM `pd`.regions 
    WHERE is_deleted = 0
    GROUP BY region_type
    ORDER BY total_regions DESC;
END//
DELIMITER ;

-- 创建存储过程：获取邻近地区
DELIMITER //
CREATE PROCEDURE `pd`.GetNearbyRegions(
    IN target_latitude DECIMAL(10, 8),
    IN target_longitude DECIMAL(11, 8),
    IN radius_km DECIMAL(10, 2)
)
BEGIN
    SELECT 
        region_id,
        region_name,
        region_type,
        latitude,
        longitude,
        ROUND(
            6371 * ACOS(
                COS(RADIANS(target_latitude)) * 
                COS(RADIANS(latitude)) * 
                COS(RADIANS(longitude) - RADIANS(target_longitude)) + 
                SIN(RADIANS(target_latitude)) * 
                SIN(RADIANS(latitude))
            ), 2
        ) as distance_km
    FROM `pd`.regions 
    WHERE is_deleted = 0 
    AND status = 'active'
    AND latitude IS NOT NULL 
    AND longitude IS NOT NULL
    HAVING distance_km <= radius_km
    ORDER BY distance_km ASC;
END//
DELIMITER ; 