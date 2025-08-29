const mysql = require('mysql2/promise');

async function checkDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'duisdui@123',
    database: 'pd'
  });

  try {
    console.log('=== 检查数据库连接 ===');
    
    // 检查admin_users表是否存在
    const [tables] = await connection.execute('SHOW TABLES LIKE "admin_users"');
    console.log('admin_users表存在:', tables.length > 0);
    
    if (tables.length > 0) {
      // 检查所有可能的用户名
      const [users] = await connection.execute('SELECT id, username, status, password FROM admin_users WHERE username LIKE ?', ['%pearl%']);
      
      // 也检查admin用户
      const [adminUsers] = await connection.execute('SELECT id, username, status, password FROM admin_users WHERE username = ?', ['admin']);
      
      if (users.length > 0) {
        console.log('找到包含pearl的用户:');
        users.forEach(user => {
          console.log('用户:', {
            id: user.id,
            username: user.username,
            status: user.status,
            passwordLength: user.password.length,
            passwordPrefix: user.password.substring(0, 20) + '...'
          });
        });
      } else {
          console.log('未找到用户 pearl_admin_2025');
          
          if (adminUsers.length > 0) {
            console.log('admin用户存在，密码:', adminUsers[0].password);
          }
          
          // 列出所有用户
          const [allUsers] = await connection.execute('SELECT username, status, password FROM admin_users LIMIT 10');
          console.log('数据库中的所有用户:', allUsers.map(u => ({
            username: u.username,
            status: u.status,
            passwordLength: u.password.length,
            passwordPrefix: u.password.substring(0, 20) + '...'
          })));
        }
    }
    
  } catch (error) {
    console.error('数据库检查错误:', error);
  } finally {
    await connection.end();
  }
}

checkDatabase(); 