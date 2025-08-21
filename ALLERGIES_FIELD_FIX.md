# 修复 "Data too long for column 'allergies'" 错误

## 问题分析

错误 `"Data too long for column 'allergies' at row 1"` 表明您尝试向 `allergies` 字段插入的数据超出了字段定义的最大长度。

### 当前情况
- `allergies` 字段定义为 `TEXT` 类型（最大 65,535 字节）
- 前端使用该字段存储包含 base64 编码文件数据的 JSON 字符串
- 大文件的 base64 编码可能远超 TEXT 字段限制

## 解决方案

### 方案 1：立即修复（推荐）

1. **执行数据库迁移**：
```bash
mysql -u username -p database_name < pd-db/fix_allergies_field.sql
```

2. **重启应用**：
```bash
npm run start:dev
```

### 方案 2：使用新的文件上传 API（长期解决方案）

#### 前端代码修改建议

**修改前**（在 ScheduleCard 组件中）：
```javascript
const onSelectStaffFile = useCallback(async (e) => {
  const file = e?.target?.files?.[0];
  if (!file || !smileTestUuid) return;
  const reader = new FileReader();
  reader.onload = async () => {
    const dataUrl = reader.result;
    const payload = {
      allergies: JSON.stringify({ name: file.name, type: file.type, data: dataUrl }),
    };
    // 使用旧的 PUT 方法...
  };
});
```

**修改后**：
```javascript
const onSelectStaffFile = useCallback(async (e) => {
  const file = e?.target?.files?.[0];
  if (!file || !smileTestUuid) return;

  // 检查文件大小，决定使用哪种上传方式
  const isLargeFile = file.size > 1 * 1024 * 1024; // 1MB

  if (isLargeFile) {
    // 使用新的二进制上传 API
    try {
      const api = (await import("../../services/api")).default;
      await api.uploadBinaryFile(
        `/api/smile-test/uuid/${smileTestUuid}/upload-file`,
        file,
        { onProgress, metadata: { uploadType: 'staff_file' } }
      );
      messageApi.success('文件已上传');
    } catch (error) {
      messageApi.error('上传失败：' + error.message);
    }
  } else {
    // 对小文件仍可使用旧方法（但建议也迁移）
    const reader = new FileReader();
    reader.onload = async () => {
      // ... 旧的逻辑
    };
    reader.readAsDataURL(file);
  }
});
```

## 技术细节

### 字段类型对比

| 类型 | 最大长度 | 用途 |
|------|----------|------|
| TEXT | 65,535 字节 | 短文本 |
| MEDIUMTEXT | 16,777,215 字节 | 中等文本 |
| LONGTEXT | 4,294,967,295 字节 | 大型文本/数据 |

### Base64 编码大小计算

- 原始文件 1MB → Base64 约 1.33MB
- 原始文件 5MB → Base64 约 6.67MB
- 原始文件 10MB → Base64 约 13.33MB

### 迁移策略

1. **立即修复**：更改字段类型为 LONGTEXT
2. **中期**：添加文件大小检查和友好错误提示
3. **长期**：完全迁移到新的文件上传系统

## 执行步骤

### 1. 数据库修复
```sql
-- 立即执行
ALTER TABLE `smile_test` 
MODIFY COLUMN `allergies` LONGTEXT NULL COMMENT '过敏史/文件数据存储';
```

### 2. 应用更新
- 实体类已更新为 `longtext` 类型
- 控制器已添加大小检查和友好错误提示
- 新的文件上传 API 已就绪

### 3. 验证修复
```sql
-- 检查字段类型
DESCRIBE smile_test;

-- 查看具体字段信息
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'pd' 
  AND TABLE_NAME = 'smile_test' 
  AND COLUMN_NAME = 'allergies';
```

### 4. 测试上传
1. 尝试上传小文件（< 1MB）
2. 尝试上传中等文件（1-10MB）
3. 尝试上传大文件（> 10MB）

## 监控和维护

### 监控指标
- 数据库表大小增长
- 上传失败率
- 响应时间

### 定期维护
```sql
-- 查看大数据记录
SELECT uuid, LENGTH(allergies) as data_size 
FROM smile_test 
WHERE allergies IS NOT NULL 
ORDER BY data_size DESC 
LIMIT 10;

-- 清理测试数据（如需要）
-- DELETE FROM smile_test WHERE is_deleted = 1 AND deleted_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

执行数据库迁移后，您的上传功能应该能够正常工作。长期建议是逐步迁移到新的文件上传 API 以获得更好的性能和可维护性。