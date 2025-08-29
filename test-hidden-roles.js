const axios = require('axios');

async function testHiddenRoles() {
  try {
    console.log('🔍 测试隐藏角色后的功能...\n');
    
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
    
    // 测试创建可用的角色用户
    const availableRoles = ['admin', 'market', 'doctor'];
    const roleNames = {
      'admin': '普通管理員',
      'market': '銷售專員', 
      'doctor': '醫生'
    };
    
    for (const role of availableRoles) {
      try {
        const testUser = {
          username: `test_${role}_${Date.now()}`,
          password: 'test123',
          full_name: `测试${roleNames[role]}`,
          role: role,
          email: `${role}@test.com`,
          phone: `123456789${availableRoles.indexOf(role)}`
        };
        
        const response = await axios.post('http://localhost:3001/auth/users', testUser, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data?.success) {
          console.log(`✅ 创建 ${roleNames[role]} 角色用户成功: ${testUser.username}`);
        } else {
          console.log(`❌ 创建 ${roleNames[role]} 角色用户失败: ${response.data?.message}`);
        }
      } catch (error) {
        console.log(`❌ 创建 ${roleNames[role]} 角色用户出错: ${error.response?.data?.message || error.message}`);
      }
    }
    
    // 测试尝试创建隐藏的角色（应该失败）
    const hiddenRoles = ['super_admin', 'hospital'];
    const hiddenRoleNames = {
      'super_admin': '超級管理員',
      'hospital': '醫院管理員'
    };
    
    console.log('\n🔒 测试隐藏角色（应该失败）:');
    for (const role of hiddenRoles) {
      try {
        const testUser = {
          username: `test_${role}_${Date.now()}`,
          password: 'test123',
          full_name: `测试${hiddenRoleNames[role]}`,
          role: role,
          email: `${role}@test.com`,
          phone: `123456789${hiddenRoles.indexOf(role)}`
        };
        
        const response = await axios.post('http://localhost:3001/auth/users', testUser, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data?.success) {
          console.log(`⚠️  意外成功创建 ${hiddenRoleNames[role]} 角色用户: ${testUser.username}`);
        } else {
          console.log(`✅ 正确阻止创建 ${hiddenRoleNames[role]} 角色用户: ${response.data?.message}`);
        }
      } catch (error) {
        console.log(`✅ 正确阻止创建 ${hiddenRoleNames[role]} 角色用户: ${error.response?.data?.message || error.message}`);
      }
    }
    
    // 获取用户列表验证
    try {
      const usersResponse = await axios.get('http://localhost:3001/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (usersResponse.data?.success) {
        console.log('\n📋 当前用户列表:');
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

testHiddenRoles();
