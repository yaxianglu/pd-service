关于表
- admin_users: 管理员账号
  - role
    - super_admin：超管只有一个
    - market：市场人员
    - hospital：医院
    - doctor：医生
    - admin：普通管理员

- clinics: 诊所信息

- dentist_info: 合作夥伴注册表

- files: 文件

- patients: 就诊者 和 治疗方案
  - assigned_doctor_uuid: 绑定admin_users中role为doctor的医生uuid

- regions: 地区表

- smile_test: 微笑测试表
  - patient_uuid: 指向patients表的uuid

表关联关系：
1. smile_test.patient_uuid → patients.uuid
2. patients.assigned_doctor_uuid → admin_users.uuid (role = 'doctor')
3. admin_users(role = 'doctor').department = clinics.uuid


