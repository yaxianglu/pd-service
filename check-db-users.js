const mysql = require('mysql2/promise');

async function checkUsers() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'duisdui@123',
      database: 'pd'
    });

    console.log('🔍 检查数据库中的用户数据...\n');

    // 检查admin_users表
    console.log('1. admin_users表数据:');
    const [adminUsers] = await connection.execute(`
      SELECT id, username, full_name, role, status, is_deleted, password 
      FROM admin_users 
      ORDER BY id
    `);
    
    console.log('admin_users表记录数:', adminUsers.length);
    adminUsers.forEach(user => {
      console.log(`  - ID: ${user.id}, 用户名: ${user.username}, 姓名: ${user.full_name}, 角色: ${user.role}, 状态: ${user.status}, 已删除: ${user.is_deleted}`);
      console.log(`    密码: ${user.password.substring(0, 20)}...`);
    });

    // 检查smile_test表
    console.log('\n2. smile_test表数据:');
    const [smileTests] = await connection.execute(`
      SELECT id, test_id, full_name, test_status, is_deleted 
      FROM smile_test 
      ORDER BY id
    `);
    
    console.log('smile_test表记录数:', smileTests.length);
    smileTests.forEach(test => {
      console.log(`  - ID: ${test.id}, 测试ID: ${test.test_id}, 姓名: ${test.full_name}, 状态: ${test.test_status}, 已删除: ${test.is_deleted}`);
    });

    // 检查clinics表
    console.log('\n3. clinics表数据:');
    const [clinics] = await connection.execute(`
      SELECT id, clinic_name, status, is_deleted 
      FROM clinics 
      ORDER BY id
    `);
    
    console.log('clinics表记录数:', clinics.length);
    clinics.forEach(clinic => {
      console.log(`  - ID: ${clinic.id}, 诊所名: ${clinic.clinic_name}, 状态: ${clinic.status}, 已删除: ${clinic.is_deleted}`);
    });

    await connection.end();
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
  }
}

checkUsers();
