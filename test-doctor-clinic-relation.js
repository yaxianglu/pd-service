const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'your_password', // 请替换为实际的数据库密码
  database: 'pd',
  port: 3306
};

async function testDoctorClinicRelation() {
  let connection;
  
  try {
    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');

    // 1. 检查医生用户
    console.log('\n📋 检查医生用户:');
    const [doctors] = await connection.execute(`
      SELECT id, username, full_name, role, department, status 
      FROM admin_users 
      WHERE role = 'doctor' AND is_deleted = 0
      ORDER BY username
    `);
    
    if (doctors.length === 0) {
      console.log('❌ 没有找到医生用户');
      return;
    }
    
    doctors.forEach(doctor => {
      console.log(`  - ${doctor.full_name} (${doctor.username}) - 诊所UUID: ${doctor.department || '未关联'}`);
    });

    // 2. 检查诊所信息
    console.log('\n🏥 检查诊所信息:');
    const [clinics] = await connection.execute(`
      SELECT id, clinic_id, uuid, clinic_name, city, district, status 
      FROM clinics 
      WHERE is_deleted = 0
      ORDER BY clinic_name
    `);
    
    clinics.forEach(clinic => {
      console.log(`  - ${clinic.clinic_name} (${clinic.city} ${clinic.district}) - UUID: ${clinic.uuid}`);
    });

    // 3. 检查医生和诊所的关联关系
    console.log('\n🔗 检查医生和诊所的关联关系:');
    const [relations] = await connection.execute(`
      SELECT 
        au.username,
        au.full_name,
        au.department as clinic_uuid,
        c.clinic_name,
        c.city,
        c.district
      FROM admin_users au
      LEFT JOIN clinics c ON au.department = c.uuid
      WHERE au.role = 'doctor' AND au.is_deleted = 0
      ORDER BY au.username
    `);
    
    relations.forEach(relation => {
      if (relation.clinic_name) {
        console.log(`  ✅ ${relation.full_name} -> ${relation.clinic_name} (${relation.city} ${relation.district})`);
      } else {
        console.log(`  ❌ ${relation.full_name} -> 未关联诊所`);
      }
    });

    // 4. 测试存储过程
    console.log('\n🧪 测试存储过程:');
    
    // 获取第一个诊所的医生列表
    if (clinics.length > 0) {
      const firstClinic = clinics[0];
      console.log(`\n📋 诊所 "${firstClinic.clinic_name}" 的医生列表:`);
      
      try {
        const [clinicDoctors] = await connection.execute(
          'CALL GetDoctorsByClinic(?)',
          [firstClinic.uuid]
        );
        
        if (clinicDoctors[0] && clinicDoctors[0].length > 0) {
          clinicDoctors[0].forEach(doctor => {
            console.log(`  - ${doctor.full_name} (${doctor.position})`);
          });
        } else {
          console.log('  没有找到关联的医生');
        }
      } catch (error) {
        console.log(`  ❌ 存储过程调用失败: ${error.message}`);
      }
    }

    // 5. 测试视图
    console.log('\n👁️ 测试视图:');
    try {
      const [viewData] = await connection.execute(`
        SELECT 
          doctor_name,
          doctor_position,
          clinic_name,
          clinic_city,
          clinic_district
        FROM doctor_clinic_relations
        ORDER BY clinic_name, doctor_name
      `);
      
      if (viewData.length > 0) {
        console.log('医生-诊所关联视图数据:');
        viewData.forEach(row => {
          console.log(`  - ${row.doctor_name} (${row.doctor_position}) -> ${row.clinic_name} (${row.clinic_city} ${row.clinic_district})`);
        });
      } else {
        console.log('视图中没有数据');
      }
    } catch (error) {
      console.log(`❌ 视图查询失败: ${error.message}`);
    }

    // 6. 验证数据完整性
    console.log('\n🔍 数据完整性检查:');
    
    // 检查是否有医生没有关联诊所
    const [unlinkedDoctors] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM admin_users 
      WHERE role = 'doctor' AND (department IS NULL OR department = '') AND is_deleted = 0
    `);
    
    if (unlinkedDoctors[0].count > 0) {
      console.log(`⚠️  有 ${unlinkedDoctors[0].count} 个医生未关联诊所`);
    } else {
      console.log('✅ 所有医生都已关联诊所');
    }

    // 检查是否有无效的诊所UUID关联
    const [invalidLinks] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM admin_users au
      LEFT JOIN clinics c ON au.department = c.uuid
      WHERE au.role = 'doctor' 
        AND au.department IS NOT NULL 
        AND au.department != ''
        AND c.uuid IS NULL
        AND au.is_deleted = 0
    `);
    
    if (invalidLinks[0].count > 0) {
      console.log(`⚠️  有 ${invalidLinks[0].count} 个医生关联了无效的诊所UUID`);
    } else {
      console.log('✅ 所有诊所UUID关联都有效');
    }

    console.log('\n🎉 测试完成!');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

// 运行测试
if (require.main === module) {
  testDoctorClinicRelation();
}

module.exports = { testDoctorClinicRelation };
