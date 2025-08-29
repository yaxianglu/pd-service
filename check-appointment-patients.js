const mysql = require('mysql2/promise');

async function checkAppointmentPatients() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'duisdui@123',
    database: 'pd'
  });

  try {
    console.log('🔍 检查预约和患者的关联关系...\n');

    // 1. 检查所有预约的patient_uuid情况
    console.log('1. 预约的patient_uuid情况:');
    const [appointments] = await connection.execute(`
      SELECT 
        id,
        uuid,
        patient_uuid,
        doctor_uuid,
        date,
        note,
        status,
        created_at
      FROM appointments
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    appointments.forEach((apt, index) => {
      console.log(`   预约 ${index + 1}:`);
      console.log(`     ID: ${apt.id}`);
      console.log(`     UUID: ${apt.uuid}`);
      console.log(`     patient_uuid: ${apt.patient_uuid || 'NULL'}`);
      console.log(`     doctor_uuid: ${apt.doctor_uuid || 'NULL'}`);
      console.log(`     日期: ${apt.date}`);
      console.log(`     备注: ${apt.note}`);
      console.log(`     状态: ${apt.status}`);
      console.log(`     创建时间: ${apt.created_at}`);
      console.log('');
    });

    // 2. 检查有patient_uuid的预约是否能找到对应的患者
    console.log('2. 检查有patient_uuid的预约:');
    const [appointmentsWithPatient] = await connection.execute(`
      SELECT 
        a.id,
        a.uuid,
        a.patient_uuid,
        a.date,
        a.note,
        p.uuid as patient_uuid_from_patients,
        p.full_name as patient_name,
        p.phone as patient_phone
      FROM appointments a
      LEFT JOIN patients p ON p.uuid = a.patient_uuid
      WHERE a.patient_uuid IS NOT NULL
      ORDER BY a.created_at DESC
      LIMIT 5
    `);
    
    appointmentsWithPatient.forEach((apt, index) => {
      console.log(`   预约 ${index + 1}:`);
      console.log(`     ID: ${apt.id}`);
      console.log(`     patient_uuid: ${apt.patient_uuid}`);
      console.log(`     患者UUID: ${apt.patient_uuid_from_patients || 'NOT FOUND'}`);
      console.log(`     患者姓名: ${apt.patient_name || 'NOT FOUND'}`);
      console.log(`     患者电话: ${apt.patient_phone || 'NOT FOUND'}`);
      console.log(`     日期: ${apt.date}`);
      console.log(`     备注: ${apt.note}`);
      console.log('');
    });

    // 3. 检查没有patient_uuid的预约
    console.log('3. 检查没有patient_uuid的预约:');
    const [appointmentsWithoutPatient] = await connection.execute(`
      SELECT 
        id,
        uuid,
        patient_uuid,
        doctor_uuid,
        date,
        note,
        status,
        created_at
      FROM appointments
      WHERE patient_uuid IS NULL
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    if (appointmentsWithoutPatient.length === 0) {
      console.log('   ✅ 所有预约都有patient_uuid');
    } else {
      console.log(`   ❌ 找到 ${appointmentsWithoutPatient.length} 个没有patient_uuid的预约:`);
      appointmentsWithoutPatient.forEach((apt, index) => {
        console.log(`   预约 ${index + 1}:`);
        console.log(`     ID: ${apt.id}`);
        console.log(`     UUID: ${apt.uuid}`);
        console.log(`     doctor_uuid: ${apt.doctor_uuid || 'NULL'}`);
        console.log(`     日期: ${apt.date}`);
        console.log(`     备注: ${apt.note}`);
        console.log(`     状态: ${apt.status}`);
        console.log(`     创建时间: ${apt.created_at}`);
        console.log('');
      });
    }

    // 4. 检查患者表中的UUID格式
    console.log('4. 检查患者UUID格式:');
    const [patientUuids] = await connection.execute(`
      SELECT uuid, full_name, phone
      FROM patients
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    patientUuids.forEach((patient, index) => {
      console.log(`   患者 ${index + 1}:`);
      console.log(`     UUID: ${patient.uuid}`);
      console.log(`     UUID长度: ${patient.uuid ? patient.uuid.length : 0}`);
      console.log(`     姓名: ${patient.full_name}`);
      console.log(`     电话: ${patient.phone}`);
      console.log('');
    });

    // 5. 尝试修复没有patient_uuid的预约（如果有的话）
    console.log('5. 尝试修复没有patient_uuid的预约...');
    const [orphanedAppointments] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM appointments
      WHERE patient_uuid IS NULL
    `);
    
    if (orphanedAppointments[0].count > 0) {
      console.log(`   找到 ${orphanedAppointments[0].count} 个没有patient_uuid的预约`);
      console.log('   建议：这些预约需要手动关联到正确的患者，或者删除无效预约');
    } else {
      console.log('   ✅ 所有预约都有正确的patient_uuid');
    }

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await connection.end();
  }
}

checkAppointmentPatients();
