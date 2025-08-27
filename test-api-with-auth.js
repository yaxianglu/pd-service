const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

// 登录获取token
async function login() {
  try {
    console.log('🔐 尝试登录获取token...');
    
    const loginData = {
      username: 'pearl_admin_2025',
      password: 'P@rlD1g1t@l2024!'
    };
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
    
    if (response.data.success) {
      console.log('✅ 登录成功');
      return response.data.data.token;
    } else {
      console.log('❌ 登录失败:', response.data.message);
      return null;
    }
    
  } catch (error) {
    console.error('❌ 登录请求失败:', error.message);
    return null;
  }
}

// 测试带认证的API
async function testAPIWithAuth(token) {
  try {
    console.log('\n🔍 测试带认证的文件列表API...');
    
    const smileTestUuid = '30772a78-1a74-4601-b61a-341ac6ba02fa';
    const url = `${API_BASE_URL}/api/smile-test-files/smile-test/${smileTestUuid}`;
    
    console.log('请求URL:', url);
    
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ API响应成功:');
    console.log('状态码:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ API测试失败:');
    
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      console.error('请求错误:', error.message);
    } else {
      console.error('其他错误:', error.message);
    }
  }
}

// 测试其他端点
async function testOtherEndpoints(token) {
  const smileTestUuid = '30772a78-1a74-4601-b61a-341ac6ba02fa';
  
  const endpoints = [
    `/api/smile-test-files/smile-test/${smileTestUuid}/images`,
    `/api/smile-test-files/smile-test/${smileTestUuid}/oral-scan`,
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 测试端点: ${endpoint}`);
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ 成功:', response.status);
      console.log('数据:', response.data);
    } catch (error) {
      console.log('❌ 失败:', error.response?.status || error.message);
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 开始带认证的API测试...\n');
  
  // 先登录获取token
  const token = await login();
  
  if (!token) {
    console.log('❌ 无法获取认证token，测试终止');
    return;
  }
  
  // 测试API
  await testAPIWithAuth(token);
  await testOtherEndpoints(token);
  
  console.log('\n📝 测试完成');
}

main().catch(console.error);
