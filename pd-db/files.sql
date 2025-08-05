-- 创建文件上传管理数据库表
USE pd;

-- 创建文件上传管理表
CREATE TABLE `pd`.files (
    -- 主键和唯一标识
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    file_id VARCHAR(50) NULL UNIQUE COMMENT '文件唯一标识符',
    uuid CHAR(36) NULL UNIQUE COMMENT '随机UUID',
    
    -- 文件基本信息
    original_filename VARCHAR(255) NOT NULL COMMENT '原始文件名',
    display_name VARCHAR(255) NULL COMMENT '显示名称',
    file_extension VARCHAR(20) NULL COMMENT '文件扩展名',
    mime_type VARCHAR(100) NULL COMMENT 'MIME类型',
    file_size BIGINT NULL COMMENT '文件大小（字节）',
    file_size_mb DECIMAL(10, 2) NULL COMMENT '文件大小（MB）',
    
    -- 文件存储信息
    storage_type ENUM('local', 's3', 'oss', 'cos', 'ftp', 'database') NULL DEFAULT 'local' COMMENT '存储类型',
    storage_path VARCHAR(500) NULL COMMENT '存储路径',
    storage_url VARCHAR(500) NULL COMMENT '访问URL',
    file_hash VARCHAR(64) NULL COMMENT '文件哈希值（SHA256）',
    checksum VARCHAR(32) NULL COMMENT '文件校验和（MD5）',
    
    -- 文件内容（可选，用于小文件直接存储在数据库中）
    file_content LONGBLOB NULL COMMENT '文件二进制内容',
    file_content_compressed LONGBLOB NULL COMMENT '压缩后的文件内容',
    is_compressed TINYINT(1) NULL DEFAULT 0 COMMENT '是否已压缩',
    
    -- 文件分类和标签
    file_category ENUM('image', 'document', 'video', 'audio', 'archive', 'other') NULL COMMENT '文件分类',
    file_type VARCHAR(50) NULL COMMENT '文件类型',
    tags TEXT NULL COMMENT '标签（JSON格式）',
    description TEXT NULL COMMENT '文件描述',
    
    -- 文件属性
    width INT NULL COMMENT '图片/视频宽度（像素）',
    height INT NULL COMMENT '图片/视频高度（像素）',
    duration DECIMAL(10, 2) NULL COMMENT '音频/视频时长（秒）',
    bitrate INT NULL COMMENT '音频/视频比特率',
    resolution VARCHAR(20) NULL COMMENT '分辨率',
    color_depth INT NULL COMMENT '颜色深度',
    
    -- 文档相关属性
    page_count INT NULL COMMENT '文档页数',
    author VARCHAR(100) NULL COMMENT '文档作者',
    title VARCHAR(200) NULL COMMENT '文档标题',
    subject VARCHAR(200) NULL COMMENT '文档主题',
    keywords TEXT NULL COMMENT '文档关键词',
    language VARCHAR(20) NULL COMMENT '文档语言',
    
    -- 图片相关属性
    image_format VARCHAR(20) NULL COMMENT '图片格式',
    color_space VARCHAR(20) NULL COMMENT '颜色空间',
    dpi_x INT NULL COMMENT 'X轴DPI',
    dpi_y INT NULL COMMENT 'Y轴DPI',
    has_transparency TINYINT(1) NULL COMMENT '是否有透明通道',
    
    -- 视频相关属性
    video_format VARCHAR(20) NULL COMMENT '视频格式',
    frame_rate DECIMAL(5, 2) NULL COMMENT '帧率',
    video_codec VARCHAR(50) NULL COMMENT '视频编码',
    audio_codec VARCHAR(50) NULL COMMENT '音频编码',
    aspect_ratio VARCHAR(20) NULL COMMENT '宽高比',
    
    -- 音频相关属性
    audio_format VARCHAR(20) NULL COMMENT '音频格式',
    sample_rate INT NULL COMMENT '采样率',
    channels INT NULL COMMENT '声道数',
    audio_codec VARCHAR(50) NULL COMMENT '音频编码',
    
    -- 关联信息
    related_entity_type VARCHAR(50) NULL COMMENT '关联实体类型（patient, clinic, admin_user等）',
    related_entity_id VARCHAR(50) NULL COMMENT '关联实体ID',
    related_field VARCHAR(100) NULL COMMENT '关联字段名',
    upload_purpose VARCHAR(100) NULL COMMENT '上传目的',
    
    -- 权限和访问控制
    access_level ENUM('public', 'private', 'restricted', 'confidential') NULL DEFAULT 'private' COMMENT '访问级别',
    allowed_roles TEXT NULL COMMENT '允许访问的角色（JSON格式）',
    allowed_users TEXT NULL COMMENT '允许访问的用户（JSON格式）',
    password_protected TINYINT(1) NULL DEFAULT 0 COMMENT '是否密码保护',
    password_hash VARCHAR(255) NULL COMMENT '密码哈希',
    
    -- 下载和访问统计
    download_count INT NULL DEFAULT 0 COMMENT '下载次数',
    view_count INT NULL DEFAULT 0 COMMENT '查看次数',
    last_downloaded_at TIMESTAMP NULL COMMENT '最后下载时间',
    last_viewed_at TIMESTAMP NULL COMMENT '最后查看时间',
    
    -- 版本控制
    version_number INT NULL DEFAULT 1 COMMENT '版本号',
    parent_file_id VARCHAR(50) NULL COMMENT '父文件ID',
    is_latest_version TINYINT(1) NULL DEFAULT 1 COMMENT '是否最新版本',
    version_notes TEXT NULL COMMENT '版本说明',
    
    -- 处理状态
    processing_status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') NULL DEFAULT 'pending' COMMENT '处理状态',
    processing_progress DECIMAL(5, 2) NULL COMMENT '处理进度百分比',
    processing_error TEXT NULL COMMENT '处理错误信息',
    processing_started_at TIMESTAMP NULL COMMENT '处理开始时间',
    processing_completed_at TIMESTAMP NULL COMMENT '处理完成时间',
    
    -- 缩略图和预览
    thumbnail_path VARCHAR(500) NULL COMMENT '缩略图路径',
    thumbnail_url VARCHAR(500) NULL COMMENT '缩略图URL',
    preview_path VARCHAR(500) NULL COMMENT '预览图路径',
    preview_url VARCHAR(500) NULL COMMENT '预览图URL',
    has_thumbnail TINYINT(1) NULL DEFAULT 0 COMMENT '是否有缩略图',
    has_preview TINYINT(1) NULL DEFAULT 0 COMMENT '是否有预览',
    
    -- 安全信息
    virus_scan_status ENUM('pending', 'scanning', 'clean', 'infected', 'error') NULL DEFAULT 'pending' COMMENT '病毒扫描状态',
    virus_scan_result TEXT NULL COMMENT '病毒扫描结果',
    virus_scan_date TIMESTAMP NULL COMMENT '病毒扫描时间',
    is_safe TINYINT(1) NULL DEFAULT 1 COMMENT '是否安全',
    
    -- 备份信息
    backup_status ENUM('not_backed_up', 'backing_up', 'backed_up', 'failed') NULL DEFAULT 'not_backed_up' COMMENT '备份状态',
    backup_path VARCHAR(500) NULL COMMENT '备份路径',
    backup_date TIMESTAMP NULL COMMENT '备份时间',
    retention_days INT NULL COMMENT '保留天数',
    auto_delete_date DATE NULL COMMENT '自动删除日期',
    
    -- 状态信息
    status ENUM('active', 'inactive', 'deleted', 'archived') NULL DEFAULT 'active' COMMENT '文件状态',
    is_public TINYINT(1) NULL DEFAULT 0 COMMENT '是否公开',
    is_featured TINYINT(1) NULL DEFAULT 0 COMMENT '是否推荐',
    is_important TINYINT(1) NULL DEFAULT 0 COMMENT '是否重要',
    
    -- 备用字段
    custom_metadata TEXT NULL COMMENT '自定义元数据（JSON格式）',
    external_id VARCHAR(100) NULL COMMENT '外部系统ID',
    external_url VARCHAR(500) NULL COMMENT '外部链接',
    source_system VARCHAR(100) NULL COMMENT '来源系统',
    import_batch_id VARCHAR(50) NULL COMMENT '导入批次ID',
    
    -- 系统字段
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by VARCHAR(100) NULL COMMENT '创建者',
    updated_by VARCHAR(100) NULL COMMENT '更新者',
    is_deleted TINYINT(1) NULL DEFAULT 0 COMMENT '是否删除',
    deleted_at TIMESTAMP NULL COMMENT '删除时间',
    
    -- 索引
    INDEX idx_file_id (file_id),
    INDEX idx_uuid (uuid),
    INDEX idx_original_filename (original_filename),
    INDEX idx_file_extension (file_extension),
    INDEX idx_mime_type (mime_type),
    INDEX idx_file_category (file_category),
    INDEX idx_file_type (file_type),
    INDEX idx_storage_type (storage_type),
    INDEX idx_file_hash (file_hash),
    INDEX idx_related_entity_type (related_entity_type),
    INDEX idx_related_entity_id (related_entity_id),
    INDEX idx_access_level (access_level),
    INDEX idx_status (status),
    INDEX idx_processing_status (processing_status),
    INDEX idx_virus_scan_status (virus_scan_status),
    INDEX idx_created_at (created_at),
    INDEX idx_file_size (file_size),
    INDEX idx_is_deleted (is_deleted)
) COMMENT='文件上传管理表';

-- 创建序列表用于生成file_id
CREATE TABLE `pd`.files_sequence (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建触发器：插入前自动生成file_id和uuid
DELIMITER //
CREATE TRIGGER before_files_insert 
BEFORE INSERT ON `pd`.files
FOR EACH ROW
BEGIN
    DECLARE sequence_id INT;
    
    -- 如果file_id为空，则生成新的file_id
    IF NEW.file_id IS NULL THEN
        -- 插入序列表获取新的序列号
        INSERT INTO `pd`.files_sequence () VALUES ();
        SET sequence_id = LAST_INSERT_ID();
        SET NEW.file_id = CONCAT('FL', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(sequence_id, 6, '0'));
    END IF;
    
    -- 如果uuid为空，则设置为UUID
    IF NEW.uuid IS NULL THEN
        SET NEW.uuid = UUID();
    END IF;
    
    -- 从原始文件名提取扩展名
    IF NEW.file_extension IS NULL AND NEW.original_filename IS NOT NULL THEN
        SET NEW.file_extension = SUBSTRING_INDEX(NEW.original_filename, '.', -1);
    END IF;
    
    -- 根据扩展名设置文件分类
    IF NEW.file_category IS NULL AND NEW.file_extension IS NOT NULL THEN
        SET NEW.file_category = CASE 
            WHEN LOWER(NEW.file_extension) IN ('jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff') THEN 'image'
            WHEN LOWER(NEW.file_extension) IN ('pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt', 'ods', 'odp') THEN 'document'
            WHEN LOWER(NEW.file_extension) IN ('mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v', '3gp') THEN 'video'
            WHEN LOWER(NEW.file_extension) IN ('mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a') THEN 'audio'
            WHEN LOWER(NEW.file_extension) IN ('zip', 'rar', '7z', 'tar', 'gz', 'bz2') THEN 'archive'
            ELSE 'other'
        END;
    END IF;
    
    -- 计算文件大小（MB）
    IF NEW.file_size IS NOT NULL AND NEW.file_size_mb IS NULL THEN
        SET NEW.file_size_mb = ROUND(NEW.file_size / 1048576, 2);
    END IF;
    
    -- 设置MIME类型（如果为空）
    IF NEW.mime_type IS NULL AND NEW.file_extension IS NOT NULL THEN
        SET NEW.mime_type = CASE 
            WHEN LOWER(NEW.file_extension) = 'jpg' OR LOWER(NEW.file_extension) = 'jpeg' THEN 'image/jpeg'
            WHEN LOWER(NEW.file_extension) = 'png' THEN 'image/png'
            WHEN LOWER(NEW.file_extension) = 'gif' THEN 'image/gif'
            WHEN LOWER(NEW.file_extension) = 'pdf' THEN 'application/pdf'
            WHEN LOWER(NEW.file_extension) = 'doc' THEN 'application/msword'
            WHEN LOWER(NEW.file_extension) = 'docx' THEN 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            WHEN LOWER(NEW.file_extension) = 'xls' THEN 'application/vnd.ms-excel'
            WHEN LOWER(NEW.file_extension) = 'xlsx' THEN 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            WHEN LOWER(NEW.file_extension) = 'zip' THEN 'application/zip'
            WHEN LOWER(NEW.file_extension) = 'mp3' THEN 'audio/mpeg'
            WHEN LOWER(NEW.file_extension) = 'mp4' THEN 'video/mp4'
            ELSE 'application/octet-stream'
        END;
    END IF;
END//
DELIMITER ;

-- 创建视图：活跃文件
CREATE VIEW `pd`.active_files AS
SELECT 
    file_id,
    original_filename,
    display_name,
    file_extension,
    mime_type,
    file_size_mb,
    file_category,
    storage_type,
    storage_url,
    related_entity_type,
    related_entity_id,
    access_level,
    download_count,
    view_count,
    status,
    created_at
FROM `pd`.files 
WHERE is_deleted = 0 AND status = 'active'
ORDER BY created_at DESC;

-- 创建视图：图片文件
CREATE VIEW `pd`.image_files AS
SELECT 
    file_id,
    original_filename,
    display_name,
    file_size_mb,
    width,
    height,
    storage_url,
    thumbnail_url,
    related_entity_type,
    related_entity_id,
    created_at
FROM `pd`.files 
WHERE is_deleted = 0 AND status = 'active' AND file_category = 'image'
ORDER BY created_at DESC;

-- 创建视图：文档文件
CREATE VIEW `pd`.document_files AS
SELECT 
    file_id,
    original_filename,
    display_name,
    file_extension,
    file_size_mb,
    page_count,
    author,
    title,
    storage_url,
    related_entity_type,
    related_entity_id,
    created_at
FROM `pd`.files 
WHERE is_deleted = 0 AND status = 'active' AND file_category = 'document'
ORDER BY created_at DESC;

-- 创建视图：大文件（超过10MB）
CREATE VIEW `pd`.large_files AS
SELECT 
    file_id,
    original_filename,
    file_size_mb,
    file_category,
    storage_type,
    related_entity_type,
    related_entity_id,
    created_at
FROM `pd`.files 
WHERE is_deleted = 0 AND status = 'active' AND file_size_mb > 10
ORDER BY file_size_mb DESC;

-- 创建存储过程：根据文件类型统计
DELIMITER //
CREATE PROCEDURE `pd`.GetFileStatsByCategory()
BEGIN
    SELECT 
        file_category,
        COUNT(*) as total_files,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_files,
        SUM(file_size) as total_size_bytes,
        ROUND(SUM(file_size) / 1048576, 2) as total_size_mb,
        ROUND(AVG(file_size) / 1048576, 2) as avg_size_mb,
        SUM(download_count) as total_downloads,
        SUM(view_count) as total_views
    FROM `pd`.files 
    WHERE is_deleted = 0
    GROUP BY file_category
    ORDER BY total_files DESC;
END//
DELIMITER ;

-- 创建存储过程：根据存储类型统计
DELIMITER //
CREATE PROCEDURE `pd`.GetFileStatsByStorageType()
BEGIN
    SELECT 
        storage_type,
        COUNT(*) as total_files,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_files,
        SUM(file_size) as total_size_bytes,
        ROUND(SUM(file_size) / 1048576, 2) as total_size_mb,
        ROUND(SUM(file_size) / 1073741824, 2) as total_size_gb
    FROM `pd`.files 
    WHERE is_deleted = 0
    GROUP BY storage_type
    ORDER BY total_size_mb DESC;
END//
DELIMITER ;

-- 创建存储过程：获取重复文件
DELIMITER //
CREATE PROCEDURE `pd`.GetDuplicateFiles()
BEGIN
    SELECT 
        file_hash,
        COUNT(*) as duplicate_count,
        GROUP_CONCAT(file_id) as file_ids,
        GROUP_CONCAT(original_filename) as filenames,
        SUM(file_size) as total_size_bytes,
        ROUND(SUM(file_size) / 1048576, 2) as total_size_mb
    FROM `pd`.files 
    WHERE is_deleted = 0 AND file_hash IS NOT NULL
    GROUP BY file_hash
    HAVING COUNT(*) > 1
    ORDER BY duplicate_count DESC;
END//
DELIMITER ;

-- 创建存储过程：清理过期文件
DELIMITER //
CREATE PROCEDURE `pd`.CleanupExpiredFiles()
BEGIN
    UPDATE `pd`.files 
    SET 
        status = 'deleted',
        is_deleted = 1,
        deleted_at = NOW(),
        updated_at = NOW()
    WHERE is_deleted = 0 
    AND auto_delete_date IS NOT NULL 
    AND auto_delete_date <= CURDATE()
    AND status = 'active';
    
    SELECT ROW_COUNT() as deleted_files_count;
END//
DELIMITER ; 