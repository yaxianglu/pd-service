-- 上传会话最后活动时间（15分钟无操作失效判定用）
ALTER TABLE smile_test ADD COLUMN last_activity_at DATETIME NULL;
CREATE INDEX idx_smile_test_last_activity_at ON smile_test (last_activity_at);
