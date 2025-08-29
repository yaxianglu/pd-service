const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔍 测试登录...');
    
    // 尝试不同的用户名
    const users = [
      { username: 'henrycao_super_admin', password: 'admin123' },
      { username: 'henrycao_admin_user', password: 'admin123' },
      { username: 'henrycao_market_user', password: 'admin123' },
      { username: 'henrycao_doctor_user', password: 'admin123' },
      { username: 'admin', password: 'admin123' }
    ];
    
    for (const user of users) {
      try {
        console.log(`\n尝试登录: ${user.username}`);
        const response = await axios.post('http://localhost:3001/auth/login', user);
        
        if (response.data.success) {
          console.log(`✅ 登录成功: ${user.username}`);
          console.log(`   角色: ${response.data.data.role}`);
          console.log(`   Token: ${response.data.data.token.substring(0, 20)}...`);
          
          // 测试API
          const token = response.data.data.token;
          const headers = { 'Authorization': `Bearer ${token}` };
          
          // 测试 /auth/users
          try {
            const usersRes = await axios.get('http://localhost:3001/auth/users', { headers });
            console.log(`   ✅ /auth/users - 成功 (${usersRes.data.data.length} 个用户)`);
          } catch (error) {
            console.log(`   ❌ /auth/users - 失败: ${error.response?.status} ${error.response?.data?.message}`);
          }
          
          // 测试 /auth/patients
          try {
            const patientsRes = await axios.get('http://localhost:3001/auth/patients', { headers });
            console.log(`   ✅ /auth/patients - 成功 (${patientsRes.data.data.length} 个患者)`);
          } catch (error) {
            console.log(`   ❌ /auth/patients - 失败: ${error.response?.status} ${error.response?.data?.message}`);
          }
          
          return; // 找到可用的用户就停止
        } else {
          console.log(`❌ 登录失败: ${response.data.message}`);
        }
      } catch (error) {
        console.log(`❌ 登录错误: ${error.response?.data?.message || error.message}`);
      }
    }
    
    console.log('\n❌ 所有用户登录都失败了');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testLogin();
