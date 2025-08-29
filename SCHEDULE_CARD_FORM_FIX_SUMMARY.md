# Schedule Card 预约表单修复总结

## 问题描述

用户反馈治疗日志新增预约时没有看到修改效果，具体表现为：
1. **医生字段没有红色星号**：不是必选字段
2. **开始时间没有默认值**：显示"Select time"而不是"08:00"
3. **结束时间默认值错误**：显示"18:00"而不是"09:00"

## 问题分析

经过检查发现，用户使用的是 `schedule-card` 组件，而不是 `appointment-modal` 组件。我们之前的修复只应用到了 `appointment-modal` 组件，而 `schedule-card` 组件仍然存在同样的问题。

## 修复文件

### 1. `pd-web/src/components/schedule-card/index.jsx`
### 2. `pd-web/src/components/ScheduleCard/index.jsx`

## 修复内容

### 1. 添加医生字段必选验证

**修复前**:
```jsx
<Form.Item name="doctor_uuid" label="醫生">
  <Select
    placeholder="選擇醫生"
    loading={loadingDoctors}
    options={doctors.map((d) => ({ label: d.full_name || d.username || d.email, value: d.uuid || d.id }))}
  />
</Form.Item>
```

**修复后**:
```jsx
<Form.Item name="doctor_uuid" label="醫生" rules={[{ required: true, message: '請選擇醫生' }]}>
  <Select
    placeholder="選擇醫生"
    loading={loadingDoctors}
    options={doctors.map((d) => ({ label: d.full_name || d.username || d.email, value: d.uuid || d.id }))}
  />
</Form.Item>
```

### 2. 添加开始时间必选验证

**修复前**:
```jsx
<Form.Item name="start_time" label="開始時間">
  <TimePicker style={{ width: "100%" }} format="HH:mm" />
</Form.Item>
```

**修复后**:
```jsx
<Form.Item name="start_time" label="開始時間" rules={[{ required: true, message: '請選擇開始時間' }]}>
  <TimePicker style={{ width: "100%" }} format="HH:mm" />
</Form.Item>
```

### 3. 添加结束时间必选验证

**修复前**:
```jsx
<Form.Item name="end_time" label="結束時間">
  <TimePicker style={{ width: "100%" }} format="HH:mm" />
</Form.Item>
```

**修复后**:
```jsx
<Form.Item name="end_time" label="結束時間" rules={[{ required: true, message: '請選擇結束時間' }]}>
  <TimePicker style={{ width: "100%" }} format="HH:mm" />
</Form.Item>
```

### 4. 修复默认时间设置

**修复前**:
```jsx
// openCreateForDate 函数中
form.setFieldsValue({
  date: d.startOf("day"),
  doctor_uuid: undefined,
  start_time: null,                    // ❌ 无默认值
  end_time: dayjs("18:00", "HH:mm"),  // ❌ 错误的默认值
  note: "",
});

// Form 的 initialValues 中
initialValues={{
  date: activeDate,
  start_time: modalMode === 'edit' ? (activeEvent?.start_time ? dayjs(activeEvent.start_time, 'HH:mm') : null) : null,  // ❌ 创建模式无默认值
  end_time: modalMode === 'edit' ? (activeEvent?.end_time ? dayjs(activeEvent.end_time, 'HH:mm') : dayjs("18:00", "HH:mm")) : dayjs("18:00", "HH:mm"),  // ❌ 错误的默认值
  doctor_uuid: activeEvent?.doctor_uuid,
  note: activeEvent?.note || "",
}}
```

**修复后**:
```jsx
// openCreateForDate 函数中
form.setFieldsValue({
  date: d.startOf("day"),
  doctor_uuid: undefined,
  start_time: dayjs("08:00", "HH:mm"),  // ✅ 默认开始时间 8:00
  end_time: dayjs("09:00", "HH:mm"),   // ✅ 默认结束时间 9:00
  note: "",
});

// Form 的 initialValues 中
initialValues={{
  date: activeDate,
  start_time: modalMode === 'edit' ? (activeEvent?.start_time ? dayjs(activeEvent.start_time, 'HH:mm') : null) : dayjs("08:00", "HH:mm"),  // ✅ 创建模式默认 8:00
  end_time: modalMode === 'edit' ? (activeEvent?.end_time ? dayjs(activeEvent.end_time, 'HH:mm') : dayjs("09:00", "HH:mm")) : dayjs("09:00", "HH:mm"),  // ✅ 创建模式默认 9:00
  doctor_uuid: activeEvent?.doctor_uuid,
  note: activeEvent?.note || "",
}}
```

## 修复效果

### 修复前的问题
1. **医生字段可选**：没有红色星号，不是必选字段
2. **时间字段无默认值**：开始时间显示"Select time"，结束时间显示"18:00"
3. **验证不完整**：缺少必要的字段验证

### 修复后的改进
1. **医生字段必选**：显示红色星号，有必选验证
2. **合理的默认时间**：开始时间默认8:00，结束时间默认9:00
3. **完整的表单验证**：所有必填字段都有验证规则
4. **更好的用户体验**：减少用户操作步骤，避免遗漏重要信息

## 表单验证规则

现在所有必填字段都有完整的验证规则：

```jsx
// 日期 - 必选
<Form.Item 
  name="date" 
  label="日期" 
  rules={[{ required: true, message: "請選擇日期" }]}
>

// 医生 - 必选
<Form.Item
  name="doctor_uuid"
  label="醫生"
  rules={[{ required: true, message: '請選擇醫生' }]}
>

// 开始时间 - 必选
<Form.Item
  name="start_time"
  label="開始時間"
  rules={[{ required: true, message: '請選擇開始時間' }]}
>

// 结束时间 - 必选
<Form.Item
  name="end_time"
  label="結束時間"
  rules={[{ required: true, message: '請選擇結束時間' }]}
>

// 备注 - 可选
<Form.Item
  name="note"
  label="備註"
  // 无验证规则，可选字段
>
```

## 测试建议

1. **重启前端服务**：确保修改生效
   ```bash
   cd pd-web
   npm start
   ```

2. **检查必填字段标识**：
   - 医生字段应该有红色星号
   - 开始时间字段应该有红色星号
   - 结束时间字段应该有红色星号

3. **检查默认时间**：
   - 打开新增预约模态框
   - 开始时间应该显示"08:00"
   - 结束时间应该显示"09:00"

4. **测试表单验证**：
   - 尝试不选择医生提交表单
   - 尝试不选择时间提交表单
   - 应该看到相应的错误提示

## 注意事项

1. **组件使用**：确认使用的是 `schedule-card` 组件而不是 `appointment-modal` 组件
2. **文件路径**：注意有两个版本的文件（小写和大写）
3. **服务重启**：修改后需要重启前端服务才能看到效果
4. **缓存清理**：如果仍有问题，可能需要清理浏览器缓存

## 兼容性

- **API兼容**：使用相同的API接口和数据结构
- **数据格式**：保持相同的数据格式和验证逻辑
- **权限控制**：保持相同的权限验证机制
- **现有功能**：不影响现有的预约查看和编辑功能
