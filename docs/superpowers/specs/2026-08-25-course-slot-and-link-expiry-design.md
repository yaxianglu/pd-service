# 设计文档：合作伙伴课程时段 + 上传链接失效机制

- 日期：2026-08-25
- 分支：`feature/course-slot-and-link-expiry`（`pd-web` 与 `pd-service` 各一条）
- 涉及仓库：`code/pd-web`（React 前端）、`code/pd-service`（NestJS 后端）

## 1. 背景与目标

一次交付三个相关功能：

1. **合作伙伴课程时段选择**：成为合作伙伴的申请表增加一个"免费线上课程时段"下拉（3 个固定时段），支持多语言；后台合作伙伴管理页能看到用户的选择。时段每期会更新。
2. **上传会话 15 分钟无操作失效**：微笑测试上传页有 4 步，每次切换 tab 刷新活动时间；超过 15 分钟无操作则链接失效，用户再操作时弹窗提示，并生成一个全新的空白链接。
3. **上传完成后链接永久失效**：用户完成上传后，链接失效；再访问只提示"已完成上传，链接已失效"，不再进入表单、也不给新链接。

## 2. 已确认的决策

- **D1（时段维护）**：硬编码，每期改代码后重新部署。字段标签/占位符走 i18n；时段文本本身用一份**语言中立的固定文本**统一维护，保证后台展示一致。
- **D2（存储值）**：存**选中时段的文本快照**（语言中立固定文本），而非槽位编号，避免以后改时段影响历史记录含义。
- **D3（超时判定）**：**服务端**记录 `last_activity_at` 判定，防刷新/多标签页绕过。
- **D4（新链接数据）**：超时后生成**全新空白**链接，从头填。

## 3. 假设

- **A1**：功能 3（已完成链接）**只弹提示、不给新链接**，与功能 2 区分。
- **A2**：原有"7 天过期"机制保持关闭，本次只加"15 分钟无操作"。
- **A3**：15 分钟计时从 `smile_test` 行存在起生效（用户填完 Step1 首次保存后惰性创建）。Step1 之前是纯介绍页，无可失效内容；真正久留的第 4 步拍照已覆盖。

## 4. 运维前提

后端 DB 硬编码连生产 AWS RDS，且 TypeORM `synchronize=false`——新增实体列不会自动建列，**必须人工在生产库执行 `ALTER TABLE`**。迁移 SQL 放在 `pd-service/pd-db/`。

## 5. 详细设计

### 5.1 功能一：合作伙伴课程时段下拉

**本期三个固定时段（语言中立文本，即入库值）：**

- `Sep 30 10:00pm–11:00pm`
- `Oct 11 10:00am–11:00am`
- `Oct 18 10:00am–11:00am`

维护方式：集中定义在一处前端常量（如 `pd-web/src/config` 下一个 `courseSlots` 常量数组），每期换届改这一处即可。下拉展示 = 可翻译的前缀标签（可选，如"时段一："）+ 语言中立时段文本；提交入库 = 语言中立时段文本。

**改动点：**

| 层 | 文件 | 改动 |
|---|---|---|
| 表单状态 | `pd-web/src/join/join-info.jsx` | `formData` 增加 `courseTimeSlot: ''` |
| 校验 | 同上 | 必选校验 |
| 提交 payload | 同上 | 增加 `course_time_slot`（= 选中时段的语言中立文本） |
| 表单控件 | 同上 | "备注"前插入 `<select>`，3 个选项 + 空占位 |
| 成功后重置 | 同上 | 重置 `courseTimeSlot: ''` |
| i18n | `pd-web/src/locales/{en,zh-CN,zh-TW}.js` | `join.form.fields.courseTimeSlot`、`selectCourseSlot`（占位）、`partners.table.courseTimeSlot` |
| 时段常量 | `pd-web/src/config/courseSlots.*` | 3 个语言中立时段文本 |
| 后端实体 | `pd-service/src/entities/dentist-info.entity.ts` | 加列 `course_time_slot VARCHAR(64) NULL`（`address` 之后） |
| 后端落库 | `pd-service/src/app.service.ts` `createDentistInfo` | 确认 `course_time_slot` 被持久化 |
| 后端返回 | `pd-service/src/partners/partners.service.ts` `getPartners` | 确认返回值包含 `course_time_slot` |
| 后台列表 | `pd-web/src/partners/index.jsx` | 列表加一列、详情弹窗加一项 |
| 迁移 SQL | `pd-service/pd-db/` | `ALTER TABLE dentist_info ADD COLUMN course_time_slot VARCHAR(64) NULL;` |

### 5.2 功能二：15 分钟无操作失效（服务端判定）

**数据模型**：`smile_test` 增加 `last_activity_at DATETIME NULL`（专用列，不复用 `updated_at`——避免后台编辑也被算作用户活动）。

**后端改动（`pd-service/src/smile-test/`）：**

1. 常量：`SMILE_TEST_INACTIVITY_MS = 15 * 60 * 1000`；新增 error_code `uuid_inactive`。
2. 新增端点 `POST /api/smile-test/uuid/:uuid/touch`：行存在则 `last_activity_at = now` 并返回最新状态；行不存在返回 `exists:false`（no-op）。
3. `buildUuidStatus` 增加判定：`inactive = last_activity_at 存在 且 now - last_activity_at > 15min`；`can_write` 在 inactive 时为 false；`code` 反映 `uuid_inactive`。
4. 写路径 `saveOrUpdateByUuid` / `assertSmileTestWritable`：若已 inactive，拒绝写入（抛 Gone，error_code `uuid_inactive`）；正常写入时顺带刷新 `last_activity_at = now`。

**前端改动（`pd-web/src/upload/index.jsx`）：**

1. `handleSetStep`（切 tab）时调用 `touch`（fire-and-forget，用于刷新活动时间）。
2. 页面加载校验 + 切 tab 时，若响应 `error_code === 'uuid_inactive'` → 弹窗提示（复用/新增 i18n `upload.linkExpiredMessage`）→ 生成新 uuid、回 Step1（复用现有 regenerate 逻辑，把触发条件从只判 `uuid_expired` 扩展为也含 `uuid_inactive`）。
3. 每步保存（Step1/Step2/图片组）走的写接口本身会刷新活动时间，覆盖"停留在某步内操作"的场景。

行为符合 D4：新链接 = 全新 uuid + 回 Step1，旧记录留库当废弃 pending（无害）。

### 5.3 功能三：完成后链接永久失效（只提示）

**数据模型**：无需新增（完成时 `step3.jsx` 的 `handleComplete` 已把 `test_status` 置为 `'completed'`）。

**后端改动：**

- `validate-uuid/:uuid` 与 `getSmileTestByUuid`：若 `test_status === 'completed'` → 返回 `success:false, error_code:'uuid_completed', message:'此微笑测试已完成，链接已失效'`。
- 写路径同样拒绝对 `completed` 记录的写入（双保险）。

**前端改动（`pd-web/src/upload/index.jsx`）：**

- 加载校验时若 `error_code === 'uuid_completed'` → 渲染一个**终结提示页**（"此微笑测试已完成，链接已失效"），不进表单、不生成新链接。新增 i18n key（如 `upload.linkCompletedMessage`）。

### 5.4 贯穿设计

**Error code 一览（前端 init 分支据此路由）：**

| error_code | 状态 | 前端行为 |
|---|---|---|
| （成功 / `uuid_not_found`） | 正常或新会话 | 进入表单；无 id 则客户端生成新 uuid |
| `uuid_expired` | 7 天过期（当前关闭） | 弹窗 + 换新空白链接 |
| `uuid_inactive` | 15 分钟无操作 | 弹窗 + 换新空白链接 |
| `uuid_completed` | 已完成上传 | 终结提示页，不换链接 |

## 6. 数据库迁移（人工在生产 RDS 执行）

```sql
ALTER TABLE dentist_info ADD COLUMN course_time_slot VARCHAR(64) NULL;
ALTER TABLE smile_test ADD COLUMN last_activity_at DATETIME NULL;
```

放入 `pd-service/pd-db/`，随分支一起交付；部署前执行。

## 7. 测试策略

- **后端（jest）**：对 `buildUuidStatus` / 写路径的纯逻辑写单测——覆盖 inactive 边界（14min59s 可写、15min01s 失效）、completed 拒绝、touch 刷新。
- **前端**：上传流程手动验证四种 error_code 分支；合作伙伴表单提交 + 后台展示手动验证三语言。

## 8. 交付边界（YAGNI）

- 不做后台配置时段的管理界面（D1 决定硬编码）。
- 不重新启用 7 天过期（A2）。
- 功能 2 的新链接不迁移旧数据（D4）。
- 功能 3 不提供重新申请入口（A1，仅提示）。
