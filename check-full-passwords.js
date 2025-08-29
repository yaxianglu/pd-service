const mysql = require('mysql2/promise');

async function checkFullPasswords() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Shein@123',
      database: 'pd'
    });

    console.log('🔍 检查数据库中的完整密码哈希...\n');

    // 检查admin_users表中的完整密码
    const [adminUsers] = await connection.execute(`
      SELECT id, username, password 
      FROM admin_users 
      ORDER BY id
    `);
    
    console.log('admin_users表中的密码哈希:');
    adminUsers.forEach(user => {
      console.log(`  - ${user.username}: ${user.password}`);
    });

    await connection.end();
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
  }
}

checkFullPasswords();
