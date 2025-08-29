const mysql = require('mysql2/promise');

async function testAppointmentStructure() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'duisdui@123',
    database: 'pd'
  });

  try {
    console.log('🔍 检查预约数据结构...\n');

    // 1. 检查预约表的基本结构
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

    console.log('');

    // 2. 检查预约数据的实际内容
    console.log('2. 预约数据示例:');
    const [appointments] = await connection.execute(`
      SELECT 
        id,
        uuid,
        patient_uuid,
        doctor_uuid,
        date,
        start_time,
        end_time,
        note,
        status,
        priority,
        created_at,
        updated_at
      FROM appointments
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    if (appointments.length === 0) {
      console.log('   ❌ 没有找到预约数据');
    } else {
      appointments.forEach((apt, index) => {
        console.log(`   预约 ${index + 1}:`);
        console.log(`     ID: ${apt.id}`);
        console.log(`     UUID: ${apt.uuid}`);
        console.log(`     patient_uuid: ${apt.patient_uuid || 'NULL'}`);
        console.log(`     doctor_uuid: ${apt.doctor_uuid || 'NULL'}`);
        console.log(`     date: ${apt.date} (类型: ${typeof apt.date})`);
        console.log(`     start_time: ${apt.start_time} (类型: ${typeof apt.start_time})`);
        console.log(`     end_time: ${apt.end_time} (类型: ${typeof apt.end_time})`);
        console.log(`     note: ${apt.note || 'NULL'}`);
        console.log(`     status: ${apt.status}`);
        console.log(`     priority: ${apt.priority || 'NULL'}`);
        console.log(`     创建时间: ${apt.created_at}`);
        console.log('');
      });
    }

    // 3. 检查预约与患者的关联
    console.log('3. 预约与患者关联:');
    const [appointmentsWithPatients] = await connection.execute(`
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
        p.uuid as patient_uuid_from_patients,
        p.full_name as patient_name,
        p.phone as patient_phone
      FROM appointments a
      LEFT JOIN patients p ON p.uuid = a.patient_uuid
      ORDER BY a.created_at DESC
      LIMIT 5
    `);
    
    if (appointmentsWithPatients.length === 0) {
      console.log('   ❌ 没有找到预约数据');
    } else {
      appointmentsWithPatients.forEach((apt, index) => {
        console.log(`   预约 ${index + 1}:`);
        console.log(`     ID: ${apt.id}`);
        console.log(`     患者UUID: ${apt.patient_uuid || 'NULL'}`);
        console.log(`     患者姓名: ${apt.patient_name || 'NOT FOUND'}`);
        console.log(`     患者电话: ${apt.patient_phone || 'NOT FOUND'}`);
        console.log(`     日期: ${apt.date}`);
        console.log(`     时间: ${apt.start_time} - ${apt.end_time}`);
        console.log(`     备注: ${apt.note || 'NULL'}`);
        console.log(`     状态: ${apt.status}`);
        console.log('');
      });
    }

    // 4. 检查预约与医生的关联
    console.log('4. 预约与医生关联:');
    const [appointmentsWithDoctors] = await connection.execute(`
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
        d.uuid as doctor_uuid_from_admin_users,
        d.username as doctor_username,
        d.full_name as doctor_full_name,
        d.email as doctor_email
      FROM appointments a
      LEFT JOIN admin_users d ON d.uuid = a.doctor_uuid
      ORDER BY a.created_at DESC
      LIMIT 5
    `);
    
    if (appointmentsWithDoctors.length === 0) {
      console.log('   ❌ 没有找到预约数据');
    } else {
      appointmentsWithDoctors.forEach((apt, index) => {
        console.log(`   预约 ${index + 1}:`);
        console.log(`     ID: ${apt.id}`);
        console.log(`     医生UUID: ${apt.doctor_uuid || 'NULL'}`);
        console.log(`     医生用户名: ${apt.doctor_username || 'NOT FOUND'}`);
        console.log(`     医生姓名: ${apt.doctor_full_name || 'NOT FOUND'}`);
        console.log(`     医生邮箱: ${apt.doctor_email || 'NOT FOUND'}`);
        console.log(`     日期: ${apt.date}`);
        console.log(`     时间: ${apt.start_time} - ${apt.end_time}`);
        console.log(`     备注: ${apt.note || 'NULL'}`);
        console.log(`     状态: ${apt.status}`);
        console.log('');
      });
    }

    // 5. 检查特定日期的预约
    console.log('5. 检查特定日期的预约:');
    const currentDate = new Date();
    const dateStr = currentDate.toISOString().split('T')[0];
    
    const [dateAppointments] = await connection.execute(`
      SELECT 
        id,
        uuid,
        patient_uuid,
        doctor_uuid,
        date,
        start_time,
        end_time,
        note,
        status
      FROM appointments
      WHERE DATE(date) = ?
      ORDER BY start_time
    `, [dateStr]);
    
    if (dateAppointments.length === 0) {
      console.log(`   ❌ ${dateStr} 没有找到预约数据`);
    } else {
      console.log(`   ✅ ${dateStr} 找到 ${dateAppointments.length} 个预约:`);
      dateAppointments.forEach((apt, index) => {
        console.log(`     预约 ${index + 1}:`);
        console.log(`       ID: ${apt.id}`);
        console.log(`       患者UUID: ${apt.patient_uuid || 'NULL'}`);
        console.log(`       医生UUID: ${apt.doctor_uuid || 'NULL'}`);
        console.log(`       时间: ${apt.start_time} - ${apt.end_time}`);
        console.log(`       备注: ${apt.note || 'NULL'}`);
        console.log(`       状态: ${apt.status}`);
        console.log('');
      });
    }

    // 6. 总结数据结构问题
    console.log('6. 数据结构问题分析:');
    console.log('   可能的问题:');
    console.log('   - 日期字段格式不一致');
    console.log('   - 时间字段格式不一致');
    console.log('   - 患者和医生UUID关联问题');
    console.log('   - 状态字段值不一致');
    console.log('');
    console.log('   建议:');
    console.log('   - 统一日期时间格式');
    console.log('   - 确保UUID关联正确');
    console.log('   - 标准化状态字段值');

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await connection.end();
  }
}

testAppointmentStructure();
