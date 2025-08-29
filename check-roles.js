const mysql = require('mysql2/promise');

async function checkRoles() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Shein@123',
    database: 'pd'
  });

  try {
    console.log('🔍 检查admin_users表中的角色定义...\n');
    
    // 查询所有不同的角色
    const [roles] = await connection.execute(`
      SELECT DISTINCT role, COUNT(*) as count 
      FROM admin_users 
      WHERE is_deleted = 0 
      GROUP BY role 
      ORDER BY count DESC
    `);
    
    console.log('📊 角色统计:');
    roles.forEach(row => {
      console.log(`  ${row.role}: ${row.count} 个用户`);
    });
    
    console.log('\n📋 详细用户列表:');
    const [users] = await connection.execute(`
      SELECT id, username, full_name, role, status, created_at 
      FROM admin_users 
      WHERE is_deleted = 0 
      ORDER BY role, created_at DESC
    `);
    
    users.forEach(user => {
      console.log(`  ID: ${user.id}, 用户名: ${user.username}, 姓名: ${user.full_name || 'N/A'}, 角色: ${user.role}, 状态: ${user.status}, 创建时间: ${user.created_at}`);
    });
    
  } catch (error) {
    console.error('❌ 查询失败:', error.message);
  } finally {
    await connection.end();
  }
}

checkRoles();
