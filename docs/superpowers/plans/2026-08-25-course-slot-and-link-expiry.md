# 合作伙伴课程时段 + 上传链接失效机制 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 给合作伙伴申请表加"免费课程时段"下拉并在后台展示；给微笑测试上传链接加"15分钟无操作失效（服务端判定，弹窗+换新空白链接）"和"完成后永久失效（仅提示）"。

**Architecture:** 后端 NestJS/TypeORM 在 `smile_test` 表新增 `last_activity_at`、在 `dentist_info` 表新增 `course_time_slot`（`synchronize=false`，靠人工 `ALTER TABLE`）；上传链接的有效性判定集中在 `SmileTestService.buildUuidStatus`，通过 error_code 驱动前端分支。前端 React 在申请表加下拉、在上传页加 touch 心跳与失效分支。

**Tech Stack:** NestJS 11 + TypeORM 0.3 + MySQL（`pd-service`）；React 19 + Ant Design 5 + 自研 i18n（`pd-web`）；后端测试用 jest（既有 `*.spec.ts` 模式）。

## Global Constraints

- 两个仓库，分支均为 `feature/course-slot-and-link-expiry`：`code/pd-web`、`code/pd-service`。
- 生产库 `synchronize=false`：新增列必须提供并（由用户）执行 `ALTER TABLE`，不可依赖自动建表。
- 三个免费课程时段（语言中立入库文本，本期值，字面量照抄）：
  - `Sep 30 10:00pm–11:00pm`
  - `Oct 11 10:00am–11:00am`
  - `Oct 18 10:00am–11:00am`
- 存储值 = 选中时段的语言中立文本快照（非 slot 编号）。
- error_code 约定：`uuid_not_found`(有)、`uuid_expired`(有，保持关闭)、`uuid_inactive`(新)、`uuid_completed`(新)。
- 失效后新链接 = 全新空白（新 uuid + Step1），不迁移旧数据。
- 完成后链接 = 仅提示，不给新链接。
- i18n 三份文件均需同步：`pd-web/src/locales/en.js`、`zh-CN.js`、`zh-TW.js`。

---

## File Structure

**pd-service（后端）**
- Modify `src/entities/smile-test.entity.ts` — 新增 `last_activity_at` 列
- Modify `src/entities/dentist-info.entity.ts` — 新增 `course_time_slot` 列
- Modify `src/smile-test/smile-test.service.ts` — 失效判定、touch、写入刷新与拦截
- Modify `src/smile-test/smile-test.service.spec.ts` — 新逻辑单测
- Modify `src/smile-test/smile-test.controller.ts` — validate-uuid 分支、touch 端点、getSmileTestByUuid 守卫
- Create `pd-db/2026-08-25_add_course_time_slot.sql`
- Create `pd-db/2026-08-25_add_last_activity_at.sql`

**pd-web（前端）**
- Create `src/config/courseSlots.js` — 3 个语言中立时段常量
- Modify `src/join/join-info.jsx` — 下拉字段
- Modify `src/partners/index.jsx` — 后台列 + 详情项
- Modify `src/services/smileTestApi.js` — `touchSmileTestUuid`
- Modify `src/upload/index.jsx` — touch 心跳 + inactive/completed 分支 + 完成终结页
- Modify `src/locales/{en,zh-CN,zh-TW}.js` — 新 i18n key

---

## Task 1: 后端实体新列 + 迁移 SQL

**Files:**
- Modify: `pd-service/src/entities/smile-test.entity.ts`（`test_status` 之后，约 108 行）
- Modify: `pd-service/src/entities/dentist-info.entity.ts`（`address` 之后，约 34 行）
- Create: `pd-service/pd-db/2026-08-25_add_last_activity_at.sql`
- Create: `pd-service/pd-db/2026-08-25_add_course_time_slot.sql`

**Interfaces:**
- Produces: `SmileTest.last_activity_at: Date`（可空）、`DentistInfo.course_time_slot: string`（可空）。后续任务读写这两列。

- [ ] **Step 1: 在 smile-test.entity.ts 的 `test_status` 之后新增列**

在 `test_status: string;` 定义（约 108 行）之后、`appointment_date` 之前插入：

```typescript
  @Column('datetime', { nullable: true })
  @Index()
  last_activity_at: Date;
```

- [ ] **Step 2: 在 dentist-info.entity.ts 的 `address` 之后新增列**

在 `address: string;`（约 34 行）之后、`special_notes` 之前插入：

```typescript
  @Column({ type: 'varchar', length: 64, nullable: true })
  course_time_slot: string;
```

- [ ] **Step 3: 创建迁移 SQL（smile_test）**

`pd-service/pd-db/2026-08-25_add_last_activity_at.sql`：

```sql
-- 上传会话最后活动时间（15分钟无操作失效判定用）
ALTER TABLE smile_test ADD COLUMN last_activity_at DATETIME NULL;
CREATE INDEX idx_smile_test_last_activity_at ON smile_test (last_activity_at);
```

- [ ] **Step 4: 创建迁移 SQL（dentist_info）**

`pd-service/pd-db/2026-08-25_add_course_time_slot.sql`：

```sql
-- 合作伙伴申请：选中的免费课程时段（语言中立文本快照）
ALTER TABLE dentist_info ADD COLUMN course_time_slot VARCHAR(64) NULL AFTER address;
```

- [ ] **Step 5: 编译验证**

Run: `cd pd-service && npm run build`
Expected: 编译通过，无 TS 报错。

- [ ] **Step 6: Commit**

```bash
cd pd-service
git add src/entities/smile-test.entity.ts src/entities/dentist-info.entity.ts pd-db/2026-08-25_add_last_activity_at.sql pd-db/2026-08-25_add_course_time_slot.sql
git commit -m "feat(db): add smile_test.last_activity_at and dentist_info.course_time_slot columns + migrations"
```

---

## Task 2: 后端失效判定逻辑 + 单测（TDD）

**Files:**
- Modify: `pd-service/src/smile-test/smile-test.service.ts`
- Test: `pd-service/src/smile-test/smile-test.service.spec.ts`

**Interfaces:**
- Consumes: `SmileTest.last_activity_at`、`SmileTest.test_status`（Task 1）。
- Produces:
  - 常量 `SMILE_TEST_INACTIVITY_MS = 900000`、`SMILE_TEST_UUID_INACTIVE_ERROR_CODE = 'uuid_inactive'`、`SMILE_TEST_UUID_COMPLETED_ERROR_CODE = 'uuid_completed'`。
  - `SmileTestUuidStatus` 增加字段 `inactive: boolean`、`completed: boolean`、`last_activity_at: Date | null`。
  - `SmileTestService.touchActivity(uuid: string, now?: Date): Promise<SmileTestUuidStatus>` — 行存在则写 `last_activity_at=now` 并返回状态；不存在返回 `exists:false` 状态。
  - `buildUuidStatus` 现基于 `Pick<SmileTest, 'created_at' | 'last_activity_at' | 'test_status'>` 计算 `inactive`/`completed`，`code` 优先级：not_found > completed > inactive > expired > valid。
  - `assertSmileTestWritable` 在 completed / inactive 时抛 `GoneException`。
  - `saveOrUpdateByUuid` 写入前 assert，写入时刷新 `last_activity_at=now`。

- [ ] **Step 1: 先写失败测试（buildUuidStatus 的 inactive/completed 判定）**

在 `smile-test.service.spec.ts` 末尾（`describe('SmileTestService', ...)` 内）追加：

```typescript
  describe('buildUuidStatus 失效判定', () => {
    const now = new Date('2026-08-25T12:00:00Z');

    it('15分钟内有活动 -> 可写、不失效', () => {
      const status = (service as any).buildUuidStatus('u1', {
        created_at: new Date('2026-08-25T11:00:00Z'),
        last_activity_at: new Date('2026-08-25T11:50:00Z'), // 10 分钟前
        test_status: 'in_progress',
      }, now);
      expect(status.inactive).toBe(false);
      expect(status.completed).toBe(false);
      expect(status.can_write).toBe(true);
      expect(status.code).toBe('uuid_valid');
    });

    it('超过15分钟无活动 -> inactive、不可写', () => {
      const status = (service as any).buildUuidStatus('u1', {
        created_at: new Date('2026-08-25T11:00:00Z'),
        last_activity_at: new Date('2026-08-25T11:44:00Z'), // 16 分钟前
        test_status: 'in_progress',
      }, now);
      expect(status.inactive).toBe(true);
      expect(status.can_write).toBe(false);
      expect(status.code).toBe('uuid_inactive');
    });

    it('test_status=completed -> completed 优先于 inactive', () => {
      const status = (service as any).buildUuidStatus('u1', {
        created_at: new Date('2026-08-25T11:00:00Z'),
        last_activity_at: new Date('2026-08-25T11:44:00Z'),
        test_status: 'completed',
      }, now);
      expect(status.completed).toBe(true);
      expect(status.can_write).toBe(false);
      expect(status.code).toBe('uuid_completed');
    });

    it('无 last_activity_at -> 不因无活动判失效（新会话）', () => {
      const status = (service as any).buildUuidStatus('u1', {
        created_at: new Date('2026-08-25T11:00:00Z'),
        last_activity_at: null,
        test_status: 'pending',
      }, now);
      expect(status.inactive).toBe(false);
      expect(status.can_write).toBe(true);
    });
  });
```

- [ ] **Step 2: 运行确认测试失败**

Run: `cd pd-service && npx jest smile-test.service.spec -t "失效判定"`
Expected: FAIL（`status.inactive` 为 undefined / `code` 不匹配，因为逻辑未实现）。

- [ ] **Step 3: 在 service 顶部新增常量与接口字段**

`smile-test.service.ts` 中，紧邻既有 `SMILE_TEST_UUID_EXPIRED_MESSAGE`（约 78–83 行）之后新增：

```typescript
export const SMILE_TEST_INACTIVITY_MS = 15 * 60 * 1000;
export const SMILE_TEST_UUID_INACTIVE_ERROR_CODE = 'uuid_inactive';
export const SMILE_TEST_UUID_COMPLETED_ERROR_CODE = 'uuid_completed';
export const SMILE_TEST_UUID_INACTIVE_MESSAGE = '此微笑测试链接超过15分钟无操作，已失效，请使用新链接重新开始';
export const SMILE_TEST_UUID_COMPLETED_MESSAGE = '此微笑测试已完成上传，链接已失效';
```

在 `SmileTestUuidStatus` 接口（约 85–94 行）中追加三个字段：

```typescript
  inactive: boolean;
  completed: boolean;
  last_activity_at: Date | null;
```

- [ ] **Step 4: 确保 GoneException 已导入**

检查 `smile-test.service.ts` 顶部的 `@nestjs/common` 导入是否含 `GoneException`；若无则加入，例如：

```typescript
import { Injectable, GoneException } from '@nestjs/common';
```

（若该文件已从 `@nestjs/common` 导入其他符号，只需在花括号内补 `GoneException`。）

- [ ] **Step 5: 重写 buildUuidStatus**

将 `private buildUuidStatus(...)`（约 125–155 行）整体替换为：

```typescript
  private buildUuidStatus(
    uuid: string,
    smileTest: Pick<SmileTest, 'created_at' | 'last_activity_at' | 'test_status'> | null,
    now: Date = new Date(),
  ): SmileTestUuidStatus {
    const createdAt = smileTest?.created_at ? new Date(smileTest.created_at) : null;
    const hasValidCreatedAt = createdAt && !Number.isNaN(createdAt.getTime());

    // 7天过期机制保持关闭
    const expiresAt = null;
    const expired = false;

    const lastActivityAt = smileTest?.last_activity_at
      ? new Date(smileTest.last_activity_at)
      : null;
    const hasValidActivity = lastActivityAt && !Number.isNaN(lastActivityAt.getTime());
    const inactive = Boolean(
      hasValidActivity && now.getTime() - lastActivityAt.getTime() > SMILE_TEST_INACTIVITY_MS,
    );
    const completed = smileTest?.test_status === 'completed';

    const code = !smileTest
      ? SMILE_TEST_UUID_NOT_FOUND_ERROR_CODE
      : completed
        ? SMILE_TEST_UUID_COMPLETED_ERROR_CODE
        : inactive
          ? SMILE_TEST_UUID_INACTIVE_ERROR_CODE
          : expired
            ? SMILE_TEST_UUID_EXPIRED_ERROR_CODE
            : 'uuid_valid';

    return {
      uuid,
      exists: Boolean(smileTest),
      expired,
      inactive,
      completed,
      can_write: Boolean(smileTest) ? !expired && !inactive && !completed : true,
      code,
      created_at: hasValidCreatedAt ? createdAt : null,
      expires_at: expiresAt,
      last_activity_at: hasValidActivity ? lastActivityAt : null,
      expiration_days: SMILE_TEST_UUID_EXPIRATION_DAYS,
    };
  }
```

- [ ] **Step 6: 运行确认 Step1 的测试通过**

Run: `cd pd-service && npx jest smile-test.service.spec -t "失效判定"`
Expected: PASS（4 条全过）。

- [ ] **Step 7: 写 touchActivity 与写入拦截的失败测试**

在 spec 末尾追加：

```typescript
  describe('touchActivity 与写入拦截', () => {
    it('touchActivity 行存在 -> 写 last_activity_at 并返回可写状态', async () => {
      const row = { uuid: 'u1', created_at: new Date(), last_activity_at: null, test_status: 'in_progress' };
      smileTestRepo.findOne.mockResolvedValue(row);
      smileTestRepo.save.mockImplementation(async (r: any) => r);

      const status = await service.touchActivity('u1', new Date('2026-08-25T12:00:00Z'));

      expect(smileTestRepo.save).toHaveBeenCalled();
      expect(row.last_activity_at).toEqual(new Date('2026-08-25T12:00:00Z'));
      expect(status.can_write).toBe(true);
    });

    it('touchActivity 行不存在 -> 返回 not_found、不 save', async () => {
      smileTestRepo.findOne.mockResolvedValue(null);
      const status = await service.touchActivity('nope');
      expect(smileTestRepo.save).not.toHaveBeenCalled();
      expect(status.code).toBe('uuid_not_found');
    });

    it('saveOrUpdateByUuid 对 completed 记录抛 GoneException', async () => {
      smileTestRepo.findOne.mockResolvedValue({
        uuid: 'u1', created_at: new Date(), last_activity_at: new Date(), test_status: 'completed',
      });
      await expect(service.saveOrUpdateByUuid('u1', { full_name: 'x' } as any)).rejects.toThrow();
    });
  });
```

- [ ] **Step 8: 运行确认失败**

Run: `cd pd-service && npx jest smile-test.service.spec -t "touchActivity"`
Expected: FAIL（`touchActivity` 未定义 / 写入未拦截）。

- [ ] **Step 9: 实现 touchActivity 并更新 assert / saveOrUpdate**

在 `getUuidStatus`（约 174 行）之后新增：

```typescript
  async touchActivity(uuid: string, now: Date = new Date()): Promise<SmileTestUuidStatus> {
    const smileTest = await this.findByUuid(uuid);
    if (!smileTest) {
      return this.buildUuidStatus(uuid, null, now);
    }
    smileTest.last_activity_at = now;
    await this.smileTestRepository.save(smileTest);
    return this.buildUuidStatus(uuid, smileTest, now);
  }
```

将 `assertSmileTestWritable`（约 157–172 行）替换为（放开被注释的拦截，并覆盖 completed/inactive）：

```typescript
  private assertSmileTestWritable(
    smileTest: Pick<SmileTest, 'uuid' | 'created_at' | 'last_activity_at' | 'test_status'>,
    now: Date = new Date(),
  ): SmileTestUuidStatus {
    const status = this.buildUuidStatus(smileTest.uuid, smileTest, now);
    if (status.completed) {
      throw new GoneException({
        success: false,
        message: SMILE_TEST_UUID_COMPLETED_MESSAGE,
        error_code: SMILE_TEST_UUID_COMPLETED_ERROR_CODE,
        data: status,
      });
    }
    if (status.inactive) {
      throw new GoneException({
        success: false,
        message: SMILE_TEST_UUID_INACTIVE_MESSAGE,
        error_code: SMILE_TEST_UUID_INACTIVE_ERROR_CODE,
        data: status,
      });
    }
    return status;
  }
```

在 `saveOrUpdateByUuid`（约 450 行）的 existing 分支，assert 之后、save 之前刷新活动时间：

```typescript
    if (existing) {
      this.assertSmileTestWritable(existing);
      Object.assign(existing, safeData);
      existing.last_activity_at = new Date();
      return await this.smileTestRepository.save(existing);
    } else {
```

> 注意：`assertSmileTestWritable` 现在会抛异常，其它调用点（约 424、446 行）行为同步收紧为"completed/inactive 拒写"，符合设计双保险。

- [ ] **Step 10: 运行整组 spec 通过**

Run: `cd pd-service && npx jest smile-test.service.spec`
Expected: PASS（含既有用例 + 新增用例）。

- [ ] **Step 11: Commit**

```bash
cd pd-service
git add src/smile-test/smile-test.service.ts src/smile-test/smile-test.service.spec.ts
git commit -m "feat(smile-test): 15-min inactivity + completed link invalidation logic with tests"
```

---

## Task 3: 后端控制器端点

**Files:**
- Modify: `pd-service/src/smile-test/smile-test.controller.ts`

**Interfaces:**
- Consumes: `service.touchActivity`、`service.getUuidStatus`、新常量/error_code（Task 2）。
- Produces:
  - `GET /api/smile-test/validate-uuid/:uuid` 在 completed / inactive 时返回对应 `error_code`。
  - `POST /api/smile-test/uuid/:uuid/touch` → `{ success, data: SmileTestUuidStatus }`。
  - `GET /api/smile-test/uuid/:uuid` 对 completed 记录返回 `success:false, error_code:'uuid_completed'`。

- [ ] **Step 1: 导入新常量**

在 controller 顶部从 service 的 import 中补充：

```typescript
import {
  // ...既有导入...
  SMILE_TEST_UUID_INACTIVE_ERROR_CODE,
  SMILE_TEST_UUID_INACTIVE_MESSAGE,
  SMILE_TEST_UUID_COMPLETED_ERROR_CODE,
  SMILE_TEST_UUID_COMPLETED_MESSAGE,
} from './smile-test.service';
```

- [ ] **Step 2: 改 validate-uuid 分支**

将 `validateUuid`（约 809–861 行）里 `if (status.expired)` 这一段替换/补充为按状态码分派（放在 `if (!smileTest)` 之后、成功返回之前）：

```typescript
      if (status.completed) {
        return {
          success: false,
          error_code: SMILE_TEST_UUID_COMPLETED_ERROR_CODE,
          data: { ...status, test_id: smileTest.test_id, test_status: smileTest.test_status },
          message: SMILE_TEST_UUID_COMPLETED_MESSAGE,
        };
      }

      if (status.inactive) {
        return {
          success: false,
          error_code: SMILE_TEST_UUID_INACTIVE_ERROR_CODE,
          data: { ...status, test_id: smileTest.test_id, test_status: smileTest.test_status },
          message: SMILE_TEST_UUID_INACTIVE_MESSAGE,
        };
      }

      if (status.expired) {
        return {
          success: false,
          error_code: SMILE_TEST_UUID_EXPIRED_ERROR_CODE,
          data: { ...status, test_id: smileTest.test_id, full_name: smileTest.full_name, test_status: smileTest.test_status },
          message: SMILE_TEST_UUID_EXPIRED_MESSAGE,
        };
      }
```

- [ ] **Step 3: 新增 touch 端点**

在 `validateUuid` 方法之后新增：

```typescript
  @Post('uuid/:uuid/touch')
  async touchUuid(@Param('uuid') uuid: string) {
    const status = await this.smileTestService.touchActivity(uuid);
    return {
      success: status.exists && status.can_write,
      error_code: status.can_write ? undefined : status.code,
      data: status,
      message: '活动时间已更新',
    };
  }
```

（确认 `@Post`、`@Param` 已在 `@nestjs/common` 导入中。）

- [ ] **Step 4: getSmileTestByUuid 加 completed 守卫**

在 `getSmileTestByUuid`（约 174 行起）取到记录后、返回数据前，加：

```typescript
      if (result.smileTest.test_status === 'completed') {
        return {
          success: false,
          error_code: SMILE_TEST_UUID_COMPLETED_ERROR_CODE,
          message: SMILE_TEST_UUID_COMPLETED_MESSAGE,
        };
      }
```

（`result` 的具体变量名以该方法实际实现为准——它调用 `findByUuidWithRelations`，返回 `{ smileTest, ... }`。）

- [ ] **Step 5: 编译验证**

Run: `cd pd-service && npm run build`
Expected: 编译通过。

- [ ] **Step 6: 手动冒烟（本地后端已在 3001 运行）**

Run:
```bash
curl -s -X POST http://localhost:3001/api/smile-test/uuid/nonexistent-uuid/touch
```
Expected: 返回 JSON，`data.code === "uuid_not_found"`、`success === false`。

- [ ] **Step 7: Commit**

```bash
cd pd-service
git add src/smile-test/smile-test.controller.ts
git commit -m "feat(smile-test): validate-uuid inactive/completed branches + touch endpoint"
```

---

## Task 4: 前端功能一 — 合作伙伴课程时段下拉

**Files:**
- Create: `pd-web/src/config/courseSlots.js`
- Modify: `pd-web/src/join/join-info.jsx`
- Modify: `pd-web/src/partners/index.jsx`
- Modify: `pd-web/src/locales/en.js`、`zh-CN.js`、`zh-TW.js`

**Interfaces:**
- Consumes: 后端 `dentist_info.course_time_slot`（Task 1）。
- Produces: 提交 payload 增加 `course_time_slot`（选中的语言中立文本）。

- [ ] **Step 1: 创建课程时段常量**

`pd-web/src/config/courseSlots.js`：

```javascript
// 免费线上课程时段（语言中立文本，入库即此值）。每期换届只改这里。
export const COURSE_TIME_SLOTS = [
  'Sep 30 10:00pm–11:00pm',
  'Oct 11 10:00am–11:00am',
  'Oct 18 10:00am–11:00am',
];
```

- [ ] **Step 2: join-info.jsx — 引入常量并加状态字段**

顶部 import 区加：

```javascript
import { COURSE_TIME_SLOTS } from '../config/courseSlots';
```

`useState` 初始对象（约 15–24 行）在 `remarks: ''` 之前加：

```javascript
    courseTimeSlot: '',
```

- [ ] **Step 3: join-info.jsx — 提交与重置带上字段**

`dentistData`（约 116–126 行）在 `status: 'pending'` 之前加：

```javascript
        course_time_slot: formData.courseTimeSlot,
```

`setFormData({...})` 重置对象（约 135–144 行）在 `remarks: ''` 之前加：

```javascript
        courseTimeSlot: '',
```

- [ ] **Step 4: join-info.jsx — 插入下拉控件**

在"备注"字段块（约 267 行 `<div className="form-field">` 之前）插入：

```jsx
          <div className="form-field">
            <label className="form-label">{t('join.form.fields.courseTimeSlot')}</label>
            <select
              className="form-input"
              value={formData.courseTimeSlot}
              onChange={(e) => handleInputChange('courseTimeSlot', e.target.value)}
            >
              <option value="">{t('join.form.fields.selectCourseSlot')}</option>
              {COURSE_TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
```

- [ ] **Step 5: i18n — 三份文件加 join.form.fields 两个 key**

在 `en.js`（约 1020–1028 行 `fields:` 内 `remarks` 之后）加：

```javascript
        remarks: 'Any Special Notes?',
        courseTimeSlot: 'Preferred Free Online Course Session',
        selectCourseSlot: 'Please select a session'
```

`zh-CN.js` 对应 `fields` 内加：

```javascript
        courseTimeSlot: '希望参加的免费线上课程时段',
        selectCourseSlot: '请选择时段'
```

`zh-TW.js` 对应 `fields` 内加：

```javascript
        courseTimeSlot: '希望參加的免費線上課程時段',
        selectCourseSlot: '請選擇時段'
```

（注意：给原本 `remarks` 行尾补逗号后再追加，保证对象合法。）

- [ ] **Step 6: i18n — 三份文件加 partners.table.courseTimeSlot**

在各文件 `partners.table`（en.js 约 1527–1535 行）内 `action` 之前加一行（英/简/繁）：

```javascript
      courseTimeSlot: 'Course Session',   // en.js
```
```javascript
      courseTimeSlot: '课程时段',          // zh-CN.js
```
```javascript
      courseTimeSlot: '課程時段',          // zh-TW.js
```

- [ ] **Step 7: partners/index.jsx — 列表加列**

表头（约 115 行 `registrationTime` 之后）加：

```jsx
            <div className="th courseSlot">{t('partners.table.courseTimeSlot')}</div>
```

数据行（约 131 行 `td created` 之后、`td action` 之前）加：

```jsx
                    <div className="td courseSlot">{p.course_time_slot || '-'}</div>
```

详情弹窗（约 240 行 `treatmentCount` 项之后）加：

```jsx
                <div className="detail-item">
                  <label>{t('partners.table.courseTimeSlot')}：</label>
                  <span>{selectedPartner.course_time_slot || '-'}</span>
                </div>
```

> 若列表用 CSS Grid 定宽（`.thead`/`.trow` 的 `grid-template-columns`），需在对应样式文件同步加一列宽度。执行时检查 `partners/*.scss` 是否存在 grid 模板并补一列（如新增 `120px` 或 `1fr`）。

- [ ] **Step 8: 手动验证（前端已在 3002 运行）**

1. 浏览器打开 `http://localhost:3002/join`，确认"课程时段"下拉出现、含 3 个时段与空占位；切换语言（简/繁/英）确认标签翻译、时段文本不变。
2. 填表提交，浏览器 Network 里确认 `POST /api/dentist-info` 载荷含 `course_time_slot`。
3. 以管理员登录打开 `http://localhost:3002/partners`，确认列表新列与详情弹窗显示所选时段。

- [ ] **Step 9: Commit**

```bash
cd pd-web
git add src/config/courseSlots.js src/join/join-info.jsx src/partners/index.jsx src/locales/en.js src/locales/zh-CN.js src/locales/zh-TW.js
git commit -m "feat(partners): course time slot dropdown on join form + admin display (i18n)"
```

---

## Task 5: 前端功能二&三 — 上传链接失效

**Files:**
- Modify: `pd-web/src/services/smileTestApi.js`
- Modify: `pd-web/src/upload/index.jsx`
- Modify: `pd-web/src/locales/en.js`、`zh-CN.js`、`zh-TW.js`

**Interfaces:**
- Consumes: `POST /api/smile-test/uuid/:uuid/touch`、`validate-uuid` 的 `error_code`（Task 3）。
- Produces: 切 tab 触发 touch；`uuid_inactive` → 弹窗+换新空白链接；`uuid_completed` → 终结提示页。

- [ ] **Step 1: smileTestApi.js 增加 touch 方法**

在 `smileTestApi` 对象内（`validateSmileTestUuid` 之后）加：

```javascript
  // 刷新上传会话活动时间（切 tab 心跳）
  async touchSmileTestUuid(uuid) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/smile-test/uuid/${uuid}/touch`, {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to touch smile test UUID:', error);
      return { success: false, error_code: 'network_error' };
    }
  },
```

- [ ] **Step 2: upload/index.jsx — 新增 completed 终结页状态**

在组件顶部 state 区（约 15 行 `const [step, setStep] = useState(1);` 附近）加：

```javascript
  const [isCompleted, setIsCompleted] = useState(false);
```

- [ ] **Step 3: upload/index.jsx — 抽出失效处理并扩展 init 分支**

在 init effect 内，将原本只判 `uuid_expired` 的分支（约 80–88 行）替换为覆盖 inactive/completed：

```javascript
          if (!result.success && result.error_code === 'uuid_completed') {
            setIsCompleted(true);
            setIsInitializing(false);
            return;
          }

          if (
            !result.success &&
            (result.error_code === 'uuid_expired' || result.error_code === 'uuid_inactive')
          ) {
            const regeneratedId = generateUUID();
            params.set('id', regeneratedId);
            params.set('step', '1');
            lastValidatedIdRef.current = regeneratedId;
            nextStep = 1;
            shouldReplace = true;
            window.alert(t('upload.linkExpiredMessage'));
          } else {
            lastValidatedIdRef.current = id;
          }
```

- [ ] **Step 4: upload/index.jsx — handleSetStep 加 touch 心跳与守卫**

将 `handleSetStep`（约 126–131 行）替换为：

```javascript
  const handleSetStep = (nextStep) => {
    const resolved = typeof nextStep === 'function' ? nextStep(step) : nextStep;
    const clamped = clampStep(resolved);
    setStep(clamped);
    updateQueryParams({ step: clamped });

    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (id) {
      smileTestApi.touchSmileTestUuid(id).then((res) => {
        if (res && res.error_code === 'uuid_completed') {
          setIsCompleted(true);
        } else if (res && res.error_code === 'uuid_inactive') {
          const regeneratedId = generateUUID();
          const next = new URLSearchParams(location.search);
          next.set('id', regeneratedId);
          next.set('step', '1');
          lastValidatedIdRef.current = regeneratedId;
          window.alert(t('upload.linkExpiredMessage'));
          navigate(`${location.pathname}?${next.toString()}`, { replace: true });
        }
      });
    }
  };
```

- [ ] **Step 5: upload/index.jsx — 渲染终结提示页**

在 `if (isInitializing) { ... }` 返回块之后、主 `return (` 之前加：

```jsx
  if (isCompleted) {
    return (
      <div className="upload-wrapper">
        <div className="upload-top">
          <img src={p2} alt="p2" />
          {t('upload.brandName')}
        </div>
        <div className="upload-content-wrapper">
          <div className="step1-wrapper">
            <div className="step1-content">
              <div className="loading">{t('upload.linkCompletedMessage')}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
```

- [ ] **Step 6: i18n — 三份文件加 upload.linkCompletedMessage**

确认各文件 `upload` 段已有 `linkExpiredMessage`（index.jsx 已在用）。在其旁新增：

```javascript
      linkCompletedMessage: 'This smile test has been completed. The link is no longer valid.',   // en.js
```
```javascript
      linkCompletedMessage: '此微笑测试已完成上传，链接已失效。',   // zh-CN.js
```
```javascript
      linkCompletedMessage: '此微笑測試已完成上傳，連結已失效。',   // zh-TW.js
```

> 执行前 grep 确认 `linkExpiredMessage` 所在的键路径（`upload.` 下），把 `linkCompletedMessage` 加在同级。若 `linkExpiredMessage` 缺失也一并补齐（`已失效，正在为你生成新的链接`）。

- [ ] **Step 7: 手动验证**

用本地后端（3001）+ 前端（3002）。前提：`smileTestApi` 的 `API_BASE_URL` 指向能连到本地后端的地址（见 `contants`）。
1. **完成失效**：数据库找一条 `test_status='completed'` 的 uuid（或先跑完一次上传），访问 `http://localhost:3002/upload?id=<completedUuid>&step=1`，应显示"已完成"终结页、不进表单。
2. **无操作失效**：临时把后端 `SMILE_TEST_INACTIVITY_MS` 调成 `5 * 1000`（5 秒）便于测试；填完 Step1 生成记录后，等 6 秒再点下一个 tab，应弹窗并跳到新 uuid 的 Step1。验证后改回 `15 * 60 * 1000`。
3. **正常流程**：连续操作不超时，应能正常走完 4 步。

- [ ] **Step 8: Commit**

```bash
cd pd-web
git add src/services/smileTestApi.js src/upload/index.jsx src/locales/en.js src/locales/zh-CN.js src/locales/zh-TW.js
git commit -m "feat(upload): 15-min inactivity + completed link invalidation (touch heartbeat, popup + fresh link, terminal screen)"
```

---

## Task 6: 生产库迁移执行（人工，交付前）

**Files:**
- Use: `pd-service/pd-db/2026-08-25_add_last_activity_at.sql`、`pd-service/pd-db/2026-08-25_add_course_time_slot.sql`

**Interfaces:**
- Consumes: Task 1 的两份迁移 SQL。

- [ ] **Step 1: 备份**

```bash
mysqldump -h pd-db-new.cgbiaakssebs.us-east-1.rds.amazonaws.com -P 3306 -u henrycao -p pd > backup_$(date +%Y%m%d).sql
```

- [ ] **Step 2: 执行迁移**

```bash
mysql -h pd-db-new.cgbiaakssebs.us-east-1.rds.amazonaws.com -P 3306 -u henrycao -p pd < pd-service/pd-db/2026-08-25_add_last_activity_at.sql
mysql -h pd-db-new.cgbiaakssebs.us-east-1.rds.amazonaws.com -P 3306 -u henrycao -p pd < pd-service/pd-db/2026-08-25_add_course_time_slot.sql
```

- [ ] **Step 3: 校验列已存在**

```bash
mysql -h ... -u henrycao -p pd -e "SHOW COLUMNS FROM smile_test LIKE 'last_activity_at'; SHOW COLUMNS FROM dentist_info LIKE 'course_time_slot';"
```
Expected: 两列均返回一行。

> 此任务需由用户/运维在获授权后执行；不要在计划自动执行中直接跑生产库。

---

## Self-Review

**Spec 覆盖：**
- 功能1（下拉/i18n/后台展示/文本快照存储）→ Task 1（列）+ Task 4（前端+i18n+后台）。✓
- 功能2（15分钟服务端判定/切tab刷新/弹窗+新空白链接）→ Task 1（列）+ Task 2（逻辑+touch）+ Task 3（端点）+ Task 5（心跳+分支）。✓
- 功能3（完成后失效/仅提示）→ Task 2（completed 判定+写拦截）+ Task 3（validate/get 守卫）+ Task 5（终结页）。✓
- 迁移 SQL 人工执行 → Task 1（产出）+ Task 6（执行）。✓
- error_code 四态、新空白链接、仅提示不换链接、7天关闭、i18n 三份 → 已分散落实。✓

**占位符扫描：** 无 TBD/TODO；代码块均为真实内容。两处"以实际实现为准"的说明（getSmileTestByUuid 变量名、partners grid 样式）是对既有代码的定位指引，非占位。

**类型一致性：** `touchActivity`、`buildUuidStatus`、`SmileTestUuidStatus` 三新字段（`inactive/completed/last_activity_at`）、常量名与 error_code 在 Task 2/3/5 前后一致；前端 `touchSmileTestUuid`、`isCompleted` 命名一致。
