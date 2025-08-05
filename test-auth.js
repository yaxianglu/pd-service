const axios = require('axios');

// 配置
const API_BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  username: 'pearl_admin_2025',
  password: 'P@rlD1g1t@l2024!'
};

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 测试函数
async function testAuthSystem() {
  console.log('🧪 开始测试 Pearl Digital 认证系统...\n');

  try {
    // 1. 测试登录
    console.log('1️⃣ 测试用户登录...');
    const loginResponse = await api.post('/auth/login', TEST_USER);
    
    if (loginResponse.data.success) {
      console.log('✅ 登录成功');
      console.log(`   用户: ${loginResponse.data.data.user.full_name}`);
      console.log(`   角色: ${loginResponse.data.data.user.role}`);
      console.log(`   Token: ${loginResponse.data.data.token.substring(0, 20)}...`);
      
      const token = loginResponse.data.data.token;
      const refreshToken = loginResponse.data.data.refresh_token;
      
      // 设置默认headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // 2. 测试验证token
      console.log('\n2️⃣ 测试Token验证...');
      const verifyResponse = await api.get('/auth/verify');
      
      if (verifyResponse.data.success) {
        console.log('✅ Token验证成功');
      }
      
      // 3. 测试获取用户信息
      console.log('\n3️⃣ 测试获取用户信息...');
      const profileResponse = await api.get('/auth/profile');
      
      if (profileResponse.data.success) {
        console.log('✅ 获取用户信息成功');
        console.log(`   用户名: ${profileResponse.data.data.username}`);
        console.log(`   邮箱: ${profileResponse.data.data.email}`);
        console.log(`   部门: ${profileResponse.data.data.department}`);
      }
      
      // 4. 测试刷新token
      console.log('\n4️⃣ 测试刷新Token...');
      const refreshResponse = await api.post('/auth/refresh', {
        refresh_token: refreshToken
      });
      
      if (refreshResponse.data.success) {
        console.log('✅ Token刷新成功');
        console.log(`   新Token: ${refreshResponse.data.data.token.substring(0, 20)}...`);
      }
      
      // 5. 测试登出
      console.log('\n5️⃣ 测试用户登出...');
      const logoutResponse = await api.post('/auth/logout');
      
      if (logoutResponse.data.success) {
        console.log('✅ 登出成功');
      }
      
      // 6. 测试登出后的token验证（应该失败）
      console.log('\n6️⃣ 测试登出后的Token验证...');
      try {
        await api.get('/auth/verify');
        console.log('❌ 登出后Token仍然有效（这不应该发生）');
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.log('✅ 登出后Token已失效（正确行为）');
        } else {
          console.log('❌ 意外的错误:', error.message);
        }
      }
      
    } else {
      console.log('❌ 登录失败:', loginResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    
    if (error.response) {
      console.error('   响应状态:', error.response.status);
      console.error('   响应数据:', error.response.data);
    }
  }
  
  console.log('\n🎉 测试完成！');
}

// 测试错误情况
async function testErrorCases() {
  console.log('\n🔍 测试错误情况...\n');
  
  try {
    // 1. 测试错误的用户名密码
    console.log('1️⃣ 测试错误的用户名密码...');
    try {
      await api.post('/auth/login', {
        username: 'wrong_user',
        password: 'wrong_password'
      });
      console.log('❌ 应该失败但成功了');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ 错误凭据被正确拒绝');
      } else {
        console.log('❌ 意外的错误:', error.message);
      }
    }
    
    // 2. 测试缺少认证的API调用
    console.log('\n2️⃣ 测试缺少认证的API调用...');
    try {
      await api.get('/auth/profile');
      console.log('❌ 应该失败但成功了');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ 缺少认证被正确拒绝');
      } else {
        console.log('❌ 意外的错误:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ 错误测试过程中发生错误:', error.message);
  }
}

// 运行测试
async function runTests() {
  await testAuthSystem();
  await testErrorCases();
}

// 如果直接运行此脚本
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testAuthSystem, testErrorCases }; 