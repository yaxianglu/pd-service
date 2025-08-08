const axios = require('axios');
const crypto = require('crypto');

// 配置
const API_BASE_URL = 'http://localhost:3000';

// 测试用户
const TEST_USERS = [
  {
    username: 'super_admin',
    password: 'Kj9#mN2$pQ7@vX5&hL8!',
    role: 'super_admin',
    description: '超级管理员'
  },
  {
    username: 'admin_user',
    password: 'Ad5#nM8$pQ2@vX7&hL9!',
    role: 'operator',
    description: '普通管理员'
  }
];

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 对密码进行SHA256加密
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// 测试登录函数
async function testLogin(user) {
  console.log(`\n🧪 测试 ${user.description} 登录...`);
  console.log(`   用户名: ${user.username}`);
  console.log(`   角色: ${user.role}`);
  
  try {
    const hashedPassword = hashPassword(user.password);
    
    const response = await api.post('/auth/login', {
      username: user.username,
      password: hashedPassword,
    });

    if (response.data.success) {
      console.log('✅ 登录成功');
      console.log(`   用户ID: ${response.data.data.user.id}`);
      console.log(`   用户名: ${response.data.data.user.username}`);
      console.log(`   角色: ${response.data.data.user.role}`);
      console.log(`   部门: ${response.data.data.user.department}`);
      console.log(`   职位: ${response.data.data.user.position}`);
      console.log(`   Token: ${response.data.data.token.substring(0, 20)}...`);
      
      return response.data.data.token;
    } else {
      console.log('❌ 登录失败');
      console.log(`   错误信息: ${response.data.message}`);
      return null;
    }
  } catch (error) {
    console.log('❌ 登录失败');
    console.log(`   错误信息: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// 测试Token验证
async function testTokenVerification(token, user) {
  if (!token) return;
  
  console.log(`\n🔍 测试 ${user.description} Token验证...`);
  
  try {
    const response = await api.get('/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.success) {
      console.log('✅ Token验证成功');
      console.log(`   用户信息: ${response.data.data.username}`);
    } else {
      console.log('❌ Token验证失败');
      console.log(`   错误信息: ${response.data.message}`);
    }
  } catch (error) {
    console.log('❌ Token验证失败');
    console.log(`   错误信息: ${error.response?.data?.message || error.message}`);
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试管理员登录功能...\n');

  for (const user of TEST_USERS) {
    const token = await testLogin(user);
    await testTokenVerification(token, user);
  }

  console.log('\n✨ 测试完成！');
}

// 运行测试
runTests().catch(console.error); 