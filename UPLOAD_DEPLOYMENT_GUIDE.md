# 文件上传功能部署指南

## 概述

本指南介绍如何部署和配置新的文件上传功能，支持大文件的二进制上传和分块上传。

## 1. 安装依赖

```bash
cd pd-service
npm install fs-extra multer @types/fs-extra @types/multer
```

## 2. 数据库迁移

执行以下SQL脚本创建必要的数据表：

```bash
mysql -u username -p database_name < pd-db/file_uploads.sql
```

或者手动执行 `pd-db/file_uploads.sql` 中的SQL语句。

## 3. 环境变量配置

在 `.env` 文件中添加以下配置：

```env
# 文件上传配置
UPLOAD_TEMP_DIR=/path/to/temp/uploads    # 临时文件目录
UPLOAD_FINAL_DIR=/path/to/final/uploads  # 最终存储目录
```

如果未设置，将使用默认路径：
- 临时目录: `./temp/uploads`
- 最终目录: `./uploads/smile-tests`

## 4. 目录权限

确保应用有权限读写上传目录：

```bash
mkdir -p /path/to/temp/uploads
mkdir -p /path/to/final/uploads
chmod 755 /path/to/temp/uploads
chmod 755 /path/to/final/uploads
chown -R app_user:app_group /path/to/temp/uploads
chown -R app_user:app_group /path/to/final/uploads
```

## 5. 重启服务

```bash
npm run build
npm run start:prod
```

## API 端点

### 二进制直接上传
- **POST** `/api/smile-test/uuid/{uuid}/upload-file`
- 用于中小文件（< 10MB）
- 请求头需包含文件信息

### 分块上传
- **POST** `/api/smile-test/uuid/{uuid}/upload-file/initialize` - 初始化
- **POST** `/api/smile-test/uuid/{uuid}/upload-file/chunk` - 上传分块
- **POST** `/api/smile-test/uuid/{uuid}/upload-file/finalize` - 完成上传

### 文件管理
- **GET** `/api/smile-test/uuid/{uuid}/files` - 获取文件列表
- **GET** `/api/smile-test/uuid/{uuid}/files/{fileId}/download` - 下载文件
- **DELETE** `/api/smile-test/uuid/{uuid}/files/{fileId}` - 删除文件

## 配置说明

### 支持的文件类型
- 图片: jpeg, jpg, png, gif, webp
- 文档: pdf, doc, docx, xls, xlsx, txt, csv

### 限制
- 最大文件大小: 100MB
- 分块大小: 5MB
- 会话过期时间: 2小时
- 上传超时: 30分钟

### 清理机制
- 每小时自动清理过期的上传会话
- 自动删除临时文件
- 清理失败的上传记录

## 监控和日志

### 关键日志
- 文件上传成功: `File upload completed`
- 分块上传进度: `Chunk {index} uploaded for session {id}`
- 清理任务: `Cleaned up {count} expired upload sessions`
- 错误日志: 详细的错误堆栈信息

### 性能监控
- 监控上传目录的磁盘空间
- 检查数据库中的上传会话表大小
- 观察内存使用情况（大文件上传时）

## 故障排除

### 常见问题

1. **"初始化失败"**
   - 检查文件类型是否支持
   - 确认文件大小是否超出限制
   - 验证目录权限

2. **"分块上传失败"**
   - 检查临时目录空间
   - 确认上传会话未过期
   - 验证分块顺序

3. **"文件合并失败"**
   - 检查最终目录权限
   - 确认所有分块都已上传
   - 验证磁盘空间

4. **"文件下载404"**
   - 检查文件是否存在于磁盘
   - 确认数据库记录正确
   - 验证文件路径

### 日志查看
```bash
# 查看上传相关日志
tail -f logs/application.log | grep -i upload

# 查看错误日志
tail -f logs/error.log | grep -i upload
```

### 手动清理
```bash
# 清理过期临时文件
find /path/to/temp/uploads -type d -mtime +1 -exec rm -rf {} \;

# 清理数据库中过期会话
mysql -u username -p -e "DELETE FROM upload_sessions WHERE expiresAt < NOW() OR status = 'failed'"
```

## 安全注意事项

1. **文件类型验证**: 严格验证上传文件的MIME类型
2. **文件大小限制**: 防止恶意大文件上传
3. **路径安全**: 防止路径遍历攻击
4. **权限控制**: 确保用户只能访问自己的文件
5. **病毒扫描**: 建议集成病毒扫描（可选）

## 性能优化

1. **磁盘I/O**: 使用SSD存储提高读写性能
2. **内存管理**: 使用流式处理减少内存占用
3. **并发控制**: 限制同时上传的文件数量
4. **CDN集成**: 考虑使用CDN加速文件下载

## 备份和恢复

1. **数据备份**: 定期备份上传文件和数据库
2. **灾难恢复**: 制定文件丢失的恢复计划
3. **版本控制**: 考虑文件版本管理需求