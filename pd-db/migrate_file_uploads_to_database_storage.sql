-- 迁移脚本：将文件上传从文件系统存储改为数据库存储
-- 运行时间：预计需要几分钟，具体取决于现有文件数量

-- 备份表（可选，建议在生产环境运行前执行）
-- CREATE TABLE file_uploads_backup AS SELECT * FROM file_uploads;

-- 修改 file_uploads 表结构
ALTER TABLE `file_uploads` 
-- 将 filepath 字段改为可空
MODIFY COLUMN `filepath` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
-- 添加 data 字段用于存储文件二进制数据
ADD COLUMN `data` LONGBLOB NOT NULL AFTER `filepath`;

-- 修改 upload_sessions 表，将 finalPath 改为可空（虽然不是必需的，但保持一致）
ALTER TABLE `upload_sessions` 
MODIFY COLUMN `finalPath` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL;

-- 注意：现有的文件数据需要手动迁移
-- 如果有现有文件，需要运行额外的数据迁移脚本将文件内容读取到数据库中
-- 这个操作应该通过应用程序代码完成，而不是SQL脚本

-- 验证表结构
DESCRIBE file_uploads;
DESCRIBE upload_sessions;

-- 显示表信息
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'file_uploads' 
ORDER BY ORDINAL_POSITION;