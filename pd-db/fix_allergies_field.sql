-- 修复 allergies 字段长度问题
-- 将 TEXT 类型改为 LONGTEXT 以支持大型文件数据

USE pd;

-- 修改 smile_test 表中的 allergies 字段
ALTER TABLE `smile_test` 
MODIFY COLUMN `allergies` LONGTEXT NULL COMMENT '过敏史/文件数据存储';

-- 验证修改结果
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
  AND COLUMN_NAME = 'allergies';