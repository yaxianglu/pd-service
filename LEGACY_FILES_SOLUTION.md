# 旧文件兼容性解决方案

## 问题描述

用户反馈：
- 使用 `api/smile-test/uuid/30772a78-1a74-4601-b61a-341ac6ba02fa` 上传文件成功
- 但是使用 `api/smile-test-files/smile-test/30772a78-1a74-4601-b61a-341ac6ba02fa` 获取文件列表时为空

## 问题分析

系统中存在两套不同的文件上传API：

### 1. 旧API系统
- **路径**: `api/smile-test/uuid/{uuid}/upload-file`
- **数据存储**: 文件保存在 `smile_test` 表中
  - `allergies` 字段：存储口扫文件（JSON格式）
  - `teeth_image_1-4` 字段：存储微笑测试图片（base64格式）

### 2. 新API系统
- **路径**: `api/smile-test-files/smile-test/{uuid}`
- **数据存储**: 文件保存在新的 `smile_test_files` 表中
- **功能**: 专门用于历史资料弹窗的文件管理

## 解决方案

### 1. 修改 `SmileTestFilesService.findBySmileTestUuid()` 方法

**功能**: 同时从两个数据源获取文件
- 从新表 `smile_test_files` 获取文件
- 从旧表 `smile_test` 获取文件（allergies + teeth_image_1-4）
- 合并并排序显示

**实现逻辑**:
```typescript
// 从新表获取文件
const newFiles = await this.smileTestFilesRepo.find({...});

// 从旧表获取文件
const smileTest = await this.smileTestRepo.findOne({...});

// 处理 allergies 文件
if (smileTest.allergies) {
  const allergiesData = JSON.parse(smileTest.allergies);
  // 创建虚拟文件对象
}

// 处理 teeth_image_1-4 图片
const teethImageFields = ['teeth_image_1', 'teeth_image_2', 'teeth_image_3', 'teeth_image_4'];
teethImageFields.forEach((field, index) => {
  if (smileTest[field]) {
    // 创建虚拟文件对象
  }
});

// 合并并排序
const allFiles = [...newFiles, ...oldFiles];
allFiles.sort((a, b) => new Date(b.upload_time) - new Date(a.upload_time));
```

### 2. 修改 `SmileTestFilesService.findByUuid()` 方法

**功能**: 支持下载旧API的文件
- 先尝试从新表查找
- 如果是旧API文件（UUID以 `legacy_` 开头），从旧表查找
- 创建虚拟文件对象返回

**UUID格式**:
- 旧文件UUID格式：`legacy_{smileTestUuid}_{fieldName}`
- 例如：`legacy_30772a78-1a74-4601-b61a-341ac6ba02fa_allergies`

### 3. 虚拟文件对象结构

为了保持API一致性，为旧文件创建虚拟的 `SmileTestFiles` 对象：

```typescript
const virtualFile = new SmileTestFiles();
virtualFile.uuid = `legacy_${smileTestUuid}_${fieldName}`;
virtualFile.smile_test_uuid = smileTestUuid;
virtualFile.file_name = fileName;
virtualFile.file_type = fileType;
virtualFile.file_data = fileData;
virtualFile.upload_type = uploadType; // 'smile_test' 或 'oral_scan'
virtualFile.upload_time = smileTest.updated_at;
virtualFile.status = 'normal';
virtualFile.created_at = smileTest.created_at;
virtualFile.updated_at = smileTest.updated_at;
```

## 文件类型映射

### 旧API → 新API 文件类型映射

| 旧API字段 | 新API upload_type | 说明 |
|-----------|------------------|------|
| `allergies` | `oral_scan` | 口扫文件 |
| `teeth_image_1-4` | `smile_test` | 微笑测试图片 |

## 测试验证

### 1. 创建测试脚本
- `test-legacy-files.js`: 测试旧文件兼容性

### 2. 测试步骤
1. 使用旧API上传文件
2. 使用新API获取文件列表
3. 验证文件是否显示
4. 测试文件下载功能

### 3. 预期结果
- 文件列表应该包含旧API上传的文件
- 文件下载功能应该正常工作
- 文件类型标签正确显示

## 优势

### 1. 向后兼容
- 不影响现有的旧API功能
- 新功能可以读取旧数据

### 2. 统一接口
- 前端只需要使用一套API
- 数据格式保持一致

### 3. 渐进迁移
- 可以逐步将旧数据迁移到新表
- 支持新旧系统并存

## 注意事项

### 1. 性能考虑
- 旧文件查询会增加数据库查询次数
- 建议后续进行数据迁移

### 2. 数据一致性
- 虚拟文件对象不会写入数据库
- 删除操作只对新表文件有效

### 3. 错误处理
- 旧数据解析失败时记录日志
- 不影响新文件功能

## 后续优化

### 1. 数据迁移
- 创建迁移脚本将旧数据导入新表
- 迁移完成后移除兼容代码

### 2. 性能优化
- 添加缓存机制
- 优化查询性能

### 3. 功能增强
- 支持批量操作
- 添加文件预览功能
