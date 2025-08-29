const axios = require('axios');

async function testRoleUpdate() {
  try {
    console.log('🔍 测试角色更新...\n');
    
    // 测试登录
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      username: 'henrycao_super_admin',
      password: 'admin123'
    });
    
    if (!loginResponse.data?.success) {
      console.log('❌ 登录失败:', loginResponse.data?.message);
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ 登录成功');
    
    // 测试创建不同角色的用户
    const testUsers = [
      {
        username: 'test_admin',
        password: 'test123',
        full_name: '测试管理员',
        role: 'admin',
        email: 'admin@test.com',
        phone: '1234567890'
      },
      {
        username: 'test_market',
        password: 'test123',
        full_name: '测试销售专员',
        role: 'market',
        email: 'market@test.com',
        phone: '1234567891'
      },
      {
        username: 'test_hospital',
        password: 'test123',
        full_name: '测试医院管理员',
        role: 'hospital',
        email: 'hospital@test.com',
        phone: '1234567892'
      }
    ];
    
    for (const user of testUsers) {
      try {
        const response = await axios.post('http://localhost:3001/auth/users', user, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data?.success) {
          console.log(`✅ 创建 ${user.role} 角色用户成功: ${user.username}`);
        } else {
          console.log(`❌ 创建 ${user.role} 角色用户失败: ${response.data?.message}`);
        }
      } catch (error) {
        console.log(`❌ 创建 ${user.role} 角色用户出错: ${error.response?.data?.message || error.message}`);
      }
    }
    
    // 测试获取用户列表
    try {
      const usersResponse = await axios.get('http://localhost:3001/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (usersResponse.data?.success) {
        console.log('\n📋 用户列表:');
        usersResponse.data.data.forEach(user => {
          console.log(`  ${user.username} - ${user.full_name} - ${user.role} - ${user.status}`);
        });
      } else {
        console.log('❌ 获取用户列表失败:', usersResponse.data?.message);
      }
    } catch (error) {
      console.log('❌ 获取用户列表出错:', error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testRoleUpdate();
