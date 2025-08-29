const mysql = require('mysql2/promise');

async function testAppointmentData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'duisdui@123',
    database: 'pd'
  });

  try {
    console.log('🔍 测试预约数据结构...\n');

    // 1. 检查预约表结构
    console.log('1. 预约表结构:');
    const [appointmentColumns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'pd' AND TABLE_NAME = 'appointments'
      ORDER BY ORDINAL_POSITION
    `);
    appointmentColumns.forEach(col => {
      console.log(`   ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // 2. 检查患者表结构
    console.log('\n2. 患者表结构:');
    const [patientColumns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'pd' AND TABLE_NAME = 'patients'
      ORDER BY ORDINAL_POSITION
    `);
    patientColumns.forEach(col => {
      console.log(`   ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // 3. 检查预约数据
    console.log('\n3. 预约数据示例:');
    const [appointments] = await connection.execute(`
      SELECT 
        a.id,
        a.uuid,
        a.patient_uuid,
        a.doctor_uuid,
        a.date,
        a.start_time,
        a.end_time,
        a.note,
        a.status,
        p.full_name as patient_name,
        p.uuid as patient_uuid_from_patients
      FROM appointments a
      LEFT JOIN patients p ON p.uuid = a.patient_uuid
      LIMIT 5
    `);
    
    if (appointments.length === 0) {
      console.log('   ❌ 没有找到预约数据');
    } else {
      appointments.forEach((apt, index) => {
        console.log(`   预约 ${index + 1}:`);
        console.log(`     ID: ${apt.id}`);
        console.log(`     UUID: ${apt.uuid}`);
        console.log(`     patient_uuid: ${apt.patient_uuid}`);
        console.log(`     patient_name: ${apt.patient_name}`);
        console.log(`     patient_uuid_from_patients: ${apt.patient_uuid_from_patients}`);
        console.log(`     日期: ${apt.date}`);
        console.log(`     时间: ${apt.start_time} - ${apt.end_time}`);
        console.log(`     备注: ${apt.note}`);
        console.log(`     状态: ${apt.status}`);
        console.log('');
      });
    }

    // 4. 检查患者数据
    console.log('4. 患者数据示例:');
    const [patients] = await connection.execute(`
      SELECT uuid, full_name, phone, email
      FROM patients
      LIMIT 5
    `);
    
    if (patients.length === 0) {
      console.log('   ❌ 没有找到患者数据');
    } else {
      patients.forEach((patient, index) => {
        console.log(`   患者 ${index + 1}:`);
        console.log(`     UUID: ${patient.uuid}`);
        console.log(`     姓名: ${patient.full_name}`);
        console.log(`     电话: ${patient.phone}`);
        console.log(`     邮箱: ${patient.email}`);
        console.log('');
      });
    }

    // 5. 测试预约查询（模拟后端API）
    console.log('5. 测试预约查询（模拟后端API）:');
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    const [monthAppointments] = await connection.execute(`
      SELECT 
        a.id as id,
        a.uuid as uuid,
        a.date as date,
        a.start_time as start_time,
        a.end_time as end_time,
        a.note as note,
        a.status as status,
        a.priority as priority,
        a.patient_uuid as patient_uuid,
        a.doctor_uuid as doctor_uuid,
        p.full_name as patient_name,
        d.username as doctor_name
      FROM appointments a
      LEFT JOIN patients p ON p.uuid = a.patient_uuid
      LEFT JOIN admin_users d ON d.uuid = a.doctor_uuid
      WHERE DATE_FORMAT(a.date, '%Y-%m') = ?
      AND a.status != 'cancelled'
      ORDER BY a.created_at DESC
      LIMIT 3
    `, [`${currentYear}-${String(currentMonth).padStart(2, '0')}`]);
    
    if (monthAppointments.length === 0) {
      console.log(`   ❌ ${currentYear}年${currentMonth}月没有找到预约数据`);
    } else {
      console.log(`   ✅ ${currentYear}年${currentMonth}月找到 ${monthAppointments.length} 个预约:`);
      monthAppointments.forEach((apt, index) => {
        console.log(`     预约 ${index + 1}:`);
        console.log(`       patient_uuid: ${apt.patient_uuid}`);
        console.log(`       patient_name: ${apt.patient_name}`);
        console.log(`       doctor_uuid: ${apt.doctor_uuid}`);
        console.log(`       doctor_name: ${apt.doctor_name}`);
        console.log(`       日期: ${apt.date} ${apt.start_time}-${apt.end_time}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await connection.end();
  }
}

testAppointmentData();
