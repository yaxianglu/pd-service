-- 合作伙伴申请：选中的免费课程时段（语言中立文本快照）
ALTER TABLE dentist_info ADD COLUMN course_time_slot VARCHAR(64) NULL AFTER address;
