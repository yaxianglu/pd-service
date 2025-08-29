const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

// 测试路由是否正常工作
async function testRoutes() {
  try {
    console.log('🧪 测试路由是否正常工作...\n');

    // 1. 测试登录获取token
    console.log('1. 测试登录...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('登录失败: ' + loginResponse.data.message);
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ 登录成功，获取到token\n');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. 测试现有的路由
    console.log('2. 测试现有的路由...');
    
    // 测试 /auth/doctors 路由
    try {
      const doctorsResponse = await axios.get(`${API_BASE_URL}/auth/doctors`, { headers });
      console.log('✅ /auth/doctors 路由正常，返回', doctorsResponse.data.data.length, '个医生');
    } catch (error) {
      console.log('❌ /auth/doctors 路由失败:', error.response?.status, error.response?.data?.message);
    }

    // 测试 /auth/clinics 路由
    try {
      const clinicsResponse = await axios.get(`${API_BASE_URL}/auth/clinics`, { headers });
      console.log('✅ /auth/clinics 路由正常，返回', clinicsResponse.data.data.length, '个诊所');
    } catch (error) {
      console.log('❌ /auth/clinics 路由失败:', error.response?.status, error.response?.data?.message);
    }

    // 3. 测试新的路由
    console.log('\n3. 测试新的路由...');
    
    // 测试 /auth/users 路由
    try {
      const usersResponse = await axios.get(`${API_BASE_URL}/auth/users`, { headers });
      console.log('✅ /auth/users 路由正常，返回', usersResponse.data.data.length, '个用户');
    } catch (error) {
      console.log('❌ /auth/users 路由失败:', error.response?.status, error.response?.data?.message);
      console.log('   错误详情:', error.response?.data);
    }

    // 测试 /auth/patients 路由
    try {
      const patientsResponse = await axios.get(`${API_BASE_URL}/auth/patients`, { headers });
      console.log('✅ /auth/patients 路由正常，返回', patientsResponse.data.data.length, '个患者');
    } catch (error) {
      console.log('❌ /auth/patients 路由失败:', error.response?.status, error.response?.data?.message);
      console.log('   错误详情:', error.response?.data);
    }

    // 4. 测试所有可用的路由
    console.log('\n4. 测试所有可用的路由...');
    const routes = [
      '/auth/profile',
      '/auth/verify',
      '/auth/doctors',
      '/auth/clinics',
      '/auth/doctors-with-clinic',
      '/auth/users',
      '/auth/patients'
    ];

    for (const route of routes) {
      try {
        const response = await axios.get(`${API_BASE_URL}${route}`, { headers });
        console.log(`✅ ${route} - 状态: ${response.status}`);
      } catch (error) {
        console.log(`❌ ${route} - 状态: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testRoutes();
