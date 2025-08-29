# 患者列表用户ID字段修复总结

## 问题描述

患者列表中的"用户ID"字段显示错误，应该显示微笑测试的UUID，但实际显示的是患者表的UUID。

## 问题分析

### 数据结构关系
```
smile_test (微笑测试表) - 主表
├── uuid: 微笑测试的唯一标识符 ← 这应该是用户ID
├── patient_uuid: 关联到 patients.uuid
└── full_name, phone, email 等基本信息

patients (患者表) - 辅表
├── uuid: 患者的唯一标识符
├── assigned_doctor_uuid: 关联到 admin_users.uuid
└── treatment_progress 等治疗相关信息
```

### 当前问题
1. **前端代码错误**：在 `pd-web/src/doctor/list.jsx` 中，用户ID字段显示的是 `pt.uuid`（来自 `patients` 表）
2. **应该显示**：`st.uuid`（来自 `smile_test` 表）
3. **数据关联**：`smile_test.patient_uuid` → `patients.uuid`

## 修复内容

### 1. 修复用户ID显示字段

**文件**: `pd-web/src/doctor/list.jsx`

**修复前**:
```jsx
<ContactInfo list={[
  { label: '用戶ID', value: pt.uuid || 'N/A' },  // ❌ 错误：显示患者表UUID
  { label: '性別', value: pt.gender || 'N/A' },
  { label: '生日', value: pt.birth_date || 'N/A' },
  { label: '聯繫方式', value: pt.phone || 'N/A' },
  { label: '信箱', value: pt.email || 'N/A' },
]} />
```

**修复后**:
```jsx
<ContactInfo list={[
  { label: '用戶ID', value: st.uuid || 'N/A' },  // ✅ 正确：显示微笑测试UUID
  { label: '性別', value: pt.gender || st.gender || 'N/A' },
  { label: '生日', value: pt.birth_date || st.birth_date || 'N/A' },
  { label: '聯繫方式', value: pt.phone || st.phone || 'N/A' },
  { label: '信箱', value: pt.email || st.email || 'N/A' },
]} />
```

### 2. 修复搜索功能

**修复前**:
```jsx
return listByStatus.filter((p) => {
  const pt = p?.patient || {};
  return (
    (pt.full_name || '').toLowerCase().includes(k) ||
    (pt.phone || '').toLowerCase().includes(k) ||
    (pt.email || '').toLowerCase().includes(k) ||
    (pt.patient_id || '').toLowerCase().includes(k) ||
    (pt.uuid || '').toLowerCase().includes(k)  // ❌ 只搜索患者表UUID
  );
});
```

**修复后**:
```jsx
return listByStatus.filter((p) => {
  const pt = p?.patient || {};
  const st = p?.smileTest || {};
  return (
    (pt.full_name || st.full_name || '').toLowerCase().includes(k) ||
    (pt.phone || st.phone || '').toLowerCase().includes(k) ||
    (pt.email || st.email || '').toLowerCase().includes(k) ||
    (pt.patient_id || '').toLowerCase().includes(k) ||
    (pt.uuid || '').toLowerCase().includes(k) ||
    (st.uuid || '').toLowerCase().includes(k)  // ✅ 同时搜索微笑测试UUID
  );
});
```

## 修复效果

### 修复前
- 用户ID显示的是患者表的UUID（如：`82ce4492-7606-11f0-a571-306e96a67f88`）
- 这些UUID通常比较长，且与微笑测试无关

### 修复后
- 用户ID显示的是微笑测试的UUID（如：`smile-test-001`）
- 这些UUID更短，更易读，且与微笑测试直接相关
- 搜索功能可以同时搜索患者信息和微笑测试信息

## 数据一致性

修复后，患者列表的数据显示逻辑更加合理：

1. **用户ID**: 来自 `smile_test.uuid`（微笑测试标识符）
2. **基本信息**: 优先使用 `patients` 表数据，如果没有则使用 `smile_test` 表数据
3. **搜索功能**: 同时搜索两个表的相关字段，提高搜索准确性

## 注意事项

1. **数据关联**: 确保 `smile_test.patient_uuid` 正确关联到 `patients.uuid`
2. **数据完整性**: 如果某个患者没有对应的微笑测试记录，用户ID将显示为 'N/A'
3. **向后兼容**: 修复后的代码仍然兼容现有的数据结构

## 测试建议

1. **检查用户ID显示**: 确认患者列表中的用户ID字段显示的是微笑测试UUID
2. **测试搜索功能**: 使用微笑测试UUID进行搜索，确认能找到对应患者
3. **验证数据关联**: 确认患者信息与微笑测试信息正确关联
