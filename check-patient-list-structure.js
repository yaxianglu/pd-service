const mysql = require('mysql2/promise');

async function checkPatientListStructure() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'duisdui@123',
    database: 'pd'
  });

  try {
    console.log('🔍 检查患者列表数据结构...\n');

    // 1. 检查 patients 表结构
    console.log('1. patients 表结构:');
    const [patientColumns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'pd' AND TABLE_NAME = 'patients'
      ORDER BY ORDINAL_POSITION
    `);
    
    patientColumns.forEach(col => {
      console.log(`   ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    console.log('');

    // 2. 检查 smile_test 表结构
    console.log('2. smile_test 表结构:');
    const [smileColumns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'pd' AND TABLE_NAME = 'smile_test'
      ORDER BY ORDINAL_POSITION
    `);
    
    smileColumns.forEach(col => {
      console.log(`   ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    console.log('');

    // 3. 检查患者数据示例
    console.log('3. patients 表数据示例:');
    const [patients] = await connection.execute(`
      SELECT 
        id,
        patient_id,
        uuid,
        full_name,
        phone,
        email,
        gender,
        birth_date,
        assigned_doctor_uuid,
        created_at
      FROM patients
      WHERE is_deleted = 0
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    if (patients.length === 0) {
      console.log('   ❌ 没有找到患者数据');
    } else {
      patients.forEach((patient, index) => {
        console.log(`   患者 ${index + 1}:`);
        console.log(`     ID: ${patient.id}`);
        console.log(`     patient_id: ${patient.patient_id || 'NULL'}`);
        console.log(`     uuid: ${patient.uuid || 'NULL'}`);
        console.log(`     姓名: ${patient.full_name || 'NULL'}`);
        console.log(`     电话: ${patient.phone || 'NULL'}`);
        console.log(`     邮箱: ${patient.email || 'NULL'}`);
        console.log(`     性别: ${patient.gender || 'NULL'}`);
        console.log(`     生日: ${patient.birth_date || 'NULL'}`);
        console.log(`     主治医生UUID: ${patient.assigned_doctor_uuid || 'NULL'}`);
        console.log(`     创建时间: ${patient.created_at}`);
        console.log('');
      });
    }

    // 4. 检查微笑测试数据示例
    console.log('4. smile_test 表数据示例:');
    const [smileTests] = await connection.execute(`
      SELECT 
        id,
        test_id,
        uuid,
        full_name,
        phone,
        email,
        gender,
        birth_date,
        patient_uuid,
        created_at
      FROM smile_test
      WHERE is_deleted = 0
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    if (smileTests.length === 0) {
      console.log('   ❌ 没有找到微笑测试数据');
    } else {
      smileTests.forEach((smile, index) => {
        console.log(`   微笑测试 ${index + 1}:`);
        console.log(`     ID: ${smile.id}`);
        console.log(`     test_id: ${smile.test_id || 'NULL'}`);
        console.log(`     uuid: ${smile.uuid || 'NULL'}`);
        console.log(`     姓名: ${smile.full_name || 'NULL'}`);
        console.log(`     电话: ${smile.phone || 'NULL'}`);
        console.log(`     邮箱: ${smile.email || 'NULL'}`);
        console.log(`     性别: ${smile.gender || 'NULL'}`);
        console.log(`     生日: ${smile.birth_date || 'NULL'}`);
        console.log(`     患者UUID: ${smile.patient_uuid || 'NULL'}`);
        console.log(`     创建时间: ${smile.created_at}`);
        console.log('');
      });
    }

    // 5. 检查患者与微笑测试的关联关系
    console.log('5. 患者与微笑测试的关联关系:');
    const [relationships] = await connection.execute(`
      SELECT 
        p.id as patient_id,
        p.patient_id as patient_patient_id,
        p.uuid as patient_uuid,
        p.full_name as patient_name,
        st.id as smile_test_id,
        st.test_id as smile_test_test_id,
        st.uuid as smile_test_uuid,
        st.full_name as smile_test_name,
        st.patient_uuid as smile_test_patient_uuid
      FROM patients p
      LEFT JOIN smile_test st ON st.patient_uuid = p.uuid
      WHERE p.is_deleted = 0
      ORDER BY p.created_at DESC
      LIMIT 5
    `);
    
    if (relationships.length === 0) {
      console.log('   ❌ 没有找到关联数据');
    } else {
      relationships.forEach((rel, index) => {
        console.log(`   关联 ${index + 1}:`);
        console.log(`     患者表:`);
        console.log(`       ID: ${rel.patient_id}`);
        console.log(`       patient_id: ${rel.patient_patient_id || 'NULL'}`);
        console.log(`       uuid: ${rel.patient_uuid || 'NULL'}`);
        console.log(`       姓名: ${rel.patient_name || 'NULL'}`);
        console.log(`     微笑测试表:`);
        console.log(`       ID: ${rel.smile_test_id || 'NULL'}`);
        console.log(`       test_id: ${rel.smile_test_test_id || 'NULL'}`);
        console.log(`       uuid: ${rel.smile_test_uuid || 'NULL'}`);
        console.log(`       姓名: ${rel.smile_test_name || 'NULL'}`);
        console.log(`       patient_uuid: ${rel.smile_test_patient_uuid || 'NULL'}`);
        console.log(`     关联状态: ${rel.smile_test_uuid ? '✅ 已关联' : '❌ 未关联'}`);
        console.log('');
      });
    }

    // 6. 检查医生与患者的关联
    console.log('6. 医生与患者的关联:');
    const [doctorPatients] = await connection.execute(`
      SELECT 
        au.uuid as doctor_uuid,
        au.username as doctor_username,
        au.full_name as doctor_name,
        au.role as doctor_role,
        p.uuid as patient_uuid,
        p.full_name as patient_name,
        p.assigned_doctor_uuid
      FROM admin_users au
      LEFT JOIN patients p ON p.assigned_doctor_uuid = au.uuid
      WHERE au.role = 'doctor' AND au.is_deleted = 0
      ORDER BY au.created_at DESC
      LIMIT 5
    `);
    
    if (doctorPatients.length === 0) {
      console.log('   ❌ 没有找到医生患者关联数据');
    } else {
      doctorPatients.forEach((dp, index) => {
        console.log(`   医生患者关联 ${index + 1}:`);
        console.log(`     医生:`);
        console.log(`       UUID: ${dp.doctor_uuid || 'NULL'}`);
        console.log(`       用户名: ${dp.doctor_username || 'NULL'}`);
        console.log(`       姓名: ${dp.doctor_name || 'NULL'}`);
        console.log(`       角色: ${dp.doctor_role || 'NULL'}`);
        console.log(`     患者:`);
        console.log(`       UUID: ${dp.patient_uuid || 'NULL'}`);
        console.log(`       姓名: ${dp.patient_name || 'NULL'}`);
        console.log(`       主治医生UUID: ${dp.assigned_doctor_uuid || 'NULL'}`);
        console.log(`     关联状态: ${dp.patient_uuid ? '✅ 已关联' : '❌ 未关联'}`);
        console.log('');
      });
    }

    // 7. 问题分析和建议
    console.log('7. 问题分析和建议:');
    console.log('   当前问题:');
    console.log('   - 患者列表显示的用户ID应该是 smile_test.uuid，而不是 patients.uuid');
    console.log('   - 前端代码中 pt.uuid 指向的是 patients.uuid，这是错误的');
    console.log('   - 应该显示 st.uuid (smile_test.uuid) 作为用户ID');
    console.log('');
    console.log('   建议修复:');
    console.log('   - 修改前端代码，将用户ID字段改为 smile_test.uuid');
    console.log('   - 确保数据关联正确：smile_test.patient_uuid -> patients.uuid');
    console.log('   - 患者列表应该以 smile_test 为主表，patients 为辅表');

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await connection.end();
  }
}

checkPatientListStructure();
