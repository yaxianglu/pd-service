const axios = require('axios');

async function testDefaultPassword() {
  try {
    console.log('🔍 测试默认密码功能...\n');
    
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
    
    // 获取诊所列表用于医生绑定
    const clinicsResponse = await axios.get('http://localhost:3001/auth/clinics', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    let clinicUuid = null;
    if (clinicsResponse.data?.success && clinicsResponse.data.data.length > 0) {
      clinicUuid = clinicsResponse.data.data[0].uuid;
    }
    
    // 测试创建不同角色的用户，使用默认密码
    const testUsers = [
      {
        username: `test_admin_${Date.now()}`,
        password: 'pd2025!', // 使用默认密码
        full_name: '测试管理员',
        role: 'admin',
        email: 'admin@test.com',
        phone: '1234567890'
      },
      {
        username: `test_market_${Date.now()}`,
        password: 'pd2025!', // 使用默认密码
        full_name: '测试销售专员',
        role: 'market',
        email: 'market@test.com',
        phone: '1234567891'
      },
      {
        username: `test_doctor_${Date.now()}`,
        password: 'pd2025!', // 使用默认密码
        full_name: '测试医生',
        role: 'doctor',
        department: clinicUuid,
        email: 'doctor@test.com',
        phone: '1234567892'
      }
    ];
    
    console.log('👥 测试创建用户（使用默认密码）:');
    const createdUsers = [];
    
    for (const user of testUsers) {
      try {
        const response = await axios.post('http://localhost:3001/auth/users', user, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data?.success) {
          console.log(`✅ 创建 ${user.role} 角色用户成功: ${user.username}`);
          createdUsers.push(user);
        } else {
          console.log(`❌ 创建 ${user.role} 角色用户失败: ${response.data?.message}`);
        }
      } catch (error) {
        console.log(`❌ 创建 ${user.role} 角色用户出错: ${error.response?.data?.message || error.message}`);
      }
    }
    
    // 测试使用默认密码登录新创建的用户
    console.log('\n🔐 测试使用默认密码登录:');
    for (const user of createdUsers) {
      try {
        const loginTestResponse = await axios.post('http://localhost:3001/auth/login', {
          username: user.username,
          password: 'pd2025!' // 使用默认密码登录
        });
        
        if (loginTestResponse.data?.success) {
          console.log(`✅ ${user.username} 使用默认密码登录成功`);
        } else {
          console.log(`❌ ${user.username} 使用默认密码登录失败: ${loginTestResponse.data?.message}`);
        }
      } catch (error) {
        console.log(`❌ ${user.username} 登录出错: ${error.response?.data?.message || error.message}`);
      }
    }
    
    // 测试使用错误密码登录（应该失败）
    console.log('\n❌ 测试使用错误密码登录（应该失败）:');
    if (createdUsers.length > 0) {
      const testUser = createdUsers[0];
      try {
        const wrongPasswordResponse = await axios.post('http://localhost:3001/auth/login', {
          username: testUser.username,
          password: 'wrongpassword'
        });
        
        if (wrongPasswordResponse.data?.success) {
          console.log(`⚠️ 意外成功使用错误密码登录: ${testUser.username}`);
        } else {
          console.log(`✅ 正确阻止使用错误密码登录: ${wrongPasswordResponse.data?.message}`);
        }
      } catch (error) {
        console.log(`✅ 正确阻止使用错误密码登录: ${error.response?.data?.message || error.message}`);
      }
    }
    
    // 测试创建用户时不指定密码（应该使用默认密码）
    console.log('\n🔧 测试创建用户时不指定密码:');
    const testUserNoPassword = {
      username: `test_no_password_${Date.now()}`,
      // 不设置 password 字段
      full_name: '测试无密码用户',
      role: 'admin',
      email: 'nopassword@test.com',
      phone: '1234567893'
    };
    
    try {
      const noPasswordResponse = await axios.post('http://localhost:3001/auth/users', testUserNoPassword, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (noPasswordResponse.data?.success) {
        console.log(`✅ 创建无密码用户成功: ${testUserNoPassword.username}`);
        
        // 尝试使用默认密码登录
        const defaultPasswordLoginResponse = await axios.post('http://localhost:3001/auth/login', {
          username: testUserNoPassword.username,
          password: 'pd2025!'
        });
        
        if (defaultPasswordLoginResponse.data?.success) {
          console.log(`✅ 无密码用户可以使用默认密码登录`);
        } else {
          console.log(`❌ 无密码用户无法使用默认密码登录: ${defaultPasswordLoginResponse.data?.message}`);
        }
      } else {
        console.log(`❌ 创建无密码用户失败: ${noPasswordResponse.data?.message}`);
      }
    } catch (error) {
      console.log(`❌ 创建无密码用户出错: ${error.response?.data?.message || error.message}`);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testDefaultPassword();
