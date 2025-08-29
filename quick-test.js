const axios = require('axios');

async function quickTest() {
  try {
    console.log('🔍 快速测试路由...');
    
    // 测试登录
    const loginRes = await axios.post('http://localhost:3001/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    if (loginRes.data.success) {
      const token = loginRes.data.data.token;
      const headers = { 'Authorization': `Bearer ${token}` };
      
      console.log('✅ 登录成功');
      
      // 测试路由
      const routes = ['/auth/users', '/auth/patients'];
      
      for (const route of routes) {
        try {
          const res = await axios.get(`http://localhost:3001${route}`, { headers });
          console.log(`✅ ${route} - 成功 (${res.data.data.length} 条记录)`);
        } catch (error) {
          console.log(`❌ ${route} - 失败: ${error.response?.status} ${error.response?.data?.message}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

quickTest();
