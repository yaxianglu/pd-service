# Allergies 字段下载问题修复方案

## 问题描述

在微笑测试系统中，`allergies` 字段用于存储上传的文件数据（base64编码）。为了提高性能，在获取微笑测试详情的接口中，`allergies` 字段被注释掉，不返回给前端。这导致前端无法下载已上传的文件，提示"没有可下载的文件"。

## 问题分析

1. **性能考虑**：`allergies` 字段是 LONGTEXT 类型，可能包含大量数据（几MB到几十MB）
2. **接口设计**：主要的 `getSmileTestByUuid` 接口为了性能，不返回 `allergies` 字段
3. **下载需求**：前端需要专门的接口来获取文件数据用于下载

## 解决方案

### 1. 新增专门的下载接口

在 `SmileTestController` 中添加新的接口：

```typescript
@Get('uuid/:uuid/download-file')
async downloadFileFromAllergies(@Param('uuid') uuid: string) {
  try {
    const result = await this.smileTestService.findByUuid(uuid);
    if (!result) {
      return {
        success: false,
        message: '記錄不存在'
      };
    }

    // 只返回 allergies 字段，用于文件下载
    const allergies = (result as any).allergies;
    if (!allergies) {
      return {
        success: false,
        message: '沒有可下載的文件'
      };
    }

    return {
      success: true,
      data: {
        allergies: allergies
      },
      message: '获取文件数据成功'
    };
  } catch (error) {
    throw new HttpException(
      {
        success: false,
        message: '获取文件数据失败',
        error: error.message
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
```

### 2. 前端API服务更新

在 `api.js` 中添加新的方法：

```javascript
// 专门下载存储在 allergies 字段中的文件
async downloadFileFromAllergies(uuid) {
  try {
    const response = await fetch(`${this.baseURL}/api/smile-test/uuid/${uuid}/download-file`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to download file from allergies:', error);
    return { success: false, message: '下载文件失败，请检查网络连接' };
  }
}
```

### 3. 前端组件更新

在 `schedule-card/index.jsx` 中更新 `staffDownloadAnyFile` 函数：

```javascript
const staffDownloadAnyFile = useCallback(async () => {
  if (!smileTestUuid) {
    messageApi.warning('缺少微笑測試ID');
    return;
  }
  try {
    const api = (await import("../../services/api")).default;
    // 使用专门的下载接口，只获取 allergies 字段
    const res = await api.downloadFileFromAllergies(smileTestUuid);
    if (!res || !res.success) {
      messageApi.warning(res?.message || '沒有可下載的文件');
      return;
    }
    
    const raw = res.data?.allergies;
    if (!raw) {
      messageApi.warning('沒有可下載的文件');
      return;
    }
    
    // ... 后续的文件下载逻辑保持不变
  } catch (err) {
    messageApi.error(err?.message || '下載失敗');
  }
}, [smileTestUuid]);
```

## 优势

1. **性能优化**：主要的详情接口不返回大字段，保持响应速度
2. **功能完整**：专门的下载接口确保文件下载功能正常工作
3. **架构清晰**：职责分离，下载接口专门处理文件数据
4. **向后兼容**：不影响现有的其他功能

## 测试

可以使用以下命令测试新的下载接口：

```bash
# 启动后端服务
cd pd-service
npm run start:dev

# 测试下载接口（需要替换为实际存在的UUID）
curl "http://localhost:3001/api/smile-test/uuid/{uuid}/download-file"
```

## 注意事项

1. **认证要求**：下载接口需要认证，确保只有授权用户才能下载文件
2. **文件大小**：`allergies` 字段存储的是 base64 编码，实际文件大小约为原始大小的 1.33 倍
3. **错误处理**：接口包含完整的错误处理，确保前端能够正确显示错误信息

## 总结

通过新增专门的下载接口，我们成功解决了 `allergies` 字段下载问题，同时保持了系统的性能优势。这种方案既满足了功能需求，又维护了良好的架构设计。
