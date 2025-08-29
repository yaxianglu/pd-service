const axios = require('axios');

async function testSimpleRoutes() {
  try {
    console.log('🔍 测试路由注册情况...\n');
    
    const routes = [
      '/auth/login',
      '/auth/doctors',
      '/auth/clinics',
      '/auth/users',
      '/auth/patients'
    ];
    
    for (const route of routes) {
      try {
        const response = await axios.get(`http://localhost:3001${route}`);
        console.log(`✅ ${route} - 状态: ${response.status}`);
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`✅ ${route} - 路由存在 (需要认证)`);
        } else if (error.response?.status === 404) {
          console.log(`❌ ${route} - 路由不存在 (404)`);
        } else {
          console.log(`❓ ${route} - 状态: ${error.response?.status} ${error.response?.data?.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testSimpleRoutes();
