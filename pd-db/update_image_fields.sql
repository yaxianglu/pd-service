-- 更新微笑测试表中的图片字段长度
-- 将VARCHAR(500)改为LONGTEXT以支持base64编码的图片数据

USE pd;

-- 更新teeth_image_1字段
ALTER TABLE `pd`.smile_test 
MODIFY COLUMN teeth_image_1 LONGTEXT NULL COMMENT '牙齿图片1路径 (base64编码)';

-- 更新teeth_image_2字段
ALTER TABLE `pd`.smile_test 
MODIFY COLUMN teeth_image_2 LONGTEXT NULL COMMENT '牙齿图片2路径 (base64编码)';

-- 更新teeth_image_3字段
ALTER TABLE `pd`.smile_test 
MODIFY COLUMN teeth_image_3 LONGTEXT NULL COMMENT '牙齿图片3路径 (base64编码)';

-- 更新teeth_image_4字段
ALTER TABLE `pd`.smile_test 
MODIFY COLUMN teeth_image_4 LONGTEXT NULL COMMENT '牙齿图片4路径 (base64编码)';

-- 验证更新结果
DESCRIBE `pd`.smile_test; 