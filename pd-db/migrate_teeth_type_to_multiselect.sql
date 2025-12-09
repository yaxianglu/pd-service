-- 迁移脚本：将 teeth_type 字段从 ENUM 改为 LONGTEXT 以支持多选
-- 注意：在执行此脚本前，请备份数据库
-- 此脚本支持将多个选项用逗号分隔存储

USE pd;

-- 步骤1: 删除 teeth_type 字段上的索引（如果存在）
-- 注意：由于 ENUM 类型可能有索引，需要先删除
ALTER TABLE `smile_test` 
DROP INDEX IF EXISTS `idx_teeth_type`;

-- 步骤2: 将 teeth_type 字段从 ENUM 改为 LONGTEXT
-- 这样可以支持存储多个选项，用逗号分隔（例如：'crowded, overbite'）
ALTER TABLE `smile_test` 
MODIFY COLUMN `teeth_type` LONGTEXT NULL COMMENT '牙齿类型（支持多选，用逗号分隔）';

-- 步骤3: 验证修改结果
DESCRIBE `smile_test`;

-- 显示字段信息
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'pd' 
  AND TABLE_NAME = 'smile_test' 
  AND COLUMN_NAME = 'teeth_type';

-- 验证：显示迁移完成信息
SELECT 'Migration completed: teeth_type field changed from ENUM to LONGTEXT to support multiple selections' as message;

