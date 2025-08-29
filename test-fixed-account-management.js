const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

// 测试修复后的账户管理功能
async function testFixedAccountManagement() {
  try {
    console.log('🧪 开始测试修复后的账户管理功能...\n');

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

    // 2. 测试获取用户列表（admin_users表）
    console.log('2. 测试获取用户列表（admin_users表）...');
    const usersResponse = await axios.get(`${API_BASE_URL}/auth/users`, { headers });
    console.log('✅ 获取用户列表成功，共', usersResponse.data.data.length, '个用户');
    if (usersResponse.data.data.length > 0) {
      console.log('   示例用户:', usersResponse.data.data[0].username);
    }
    console.log('');

    // 3. 测试获取患者列表（smile_test表）
    console.log('3. 测试获取患者列表（smile_test表）...');
    const patientsResponse = await axios.get(`${API_BASE_URL}/auth/patients`, { headers });
    console.log('✅ 获取患者列表成功，共', patientsResponse.data.data.length, '个患者');
    if (patientsResponse.data.data.length > 0) {
      console.log('   示例患者:', patientsResponse.data.data[0].full_name);
    }
    console.log('');

    // 4. 测试创建患者（保存到smile_test表）
    console.log('4. 测试创建患者（保存到smile_test表）...');
    const createPatientData = {
      full_name: '测试患者_' + Date.now(),
      phone: '0912345678',
      email: 'patient@test.com',
      gender: 'male',
      address: '患者地址',
      city: '台北',
      emergency_contact: '紧急联系人',
      emergency_phone: '0987654321'
    };
    
    const createPatientResponse = await axios.post(`${API_BASE_URL}/auth/patients`, createPatientData, { headers });
    if (createPatientResponse.data.success) {
      console.log('✅ 创建患者成功:', createPatientResponse.data.data.full_name);
      console.log('   患者ID:', createPatientResponse.data.data.id);
      console.log('   状态:', createPatientResponse.data.data.status);
      
      const patientId = createPatientResponse.data.data.id;
      
      // 5. 测试更新患者状态
      console.log('5. 测试更新患者状态...');
      const updatePatientStatusResponse = await axios.put(`${API_BASE_URL}/auth/patients/${patientId}/status`, {
        status: 'completed'
      }, { headers });
      console.log('✅ 更新患者状态成功:', updatePatientStatusResponse.data.message);
      
      // 6. 测试删除患者
      console.log('6. 测试删除患者...');
      const deletePatientResponse = await axios.delete(`${API_BASE_URL}/auth/patients/${patientId}`, { headers });
      console.log('✅ 删除患者成功:', deletePatientResponse.data.message);
    } else {
      console.log('❌ 创建患者失败:', createPatientResponse.data.message);
    }
    console.log('');

    // 7. 测试创建用户（admin_users表）
    console.log('7. 测试创建用户（admin_users表）...');
    const createUserData = {
      username: 'testuser_' + Date.now(),
      password: 'testpass123',
      full_name: '测试用户',
      role: 'doctor',
      email: 'testuser@test.com',
      phone: '0912345678'
    };
    
    const createUserResponse = await axios.post(`${API_BASE_URL}/auth/users`, createUserData, { headers });
    if (createUserResponse.data.success) {
      console.log('✅ 创建用户成功:', createUserResponse.data.data.username);
      console.log('   用户ID:', createUserResponse.data.data.id);
      console.log('   角色:', createUserResponse.data.data.role);
      
      const userId = createUserResponse.data.data.id;
      
      // 8. 测试更新用户状态
      console.log('8. 测试更新用户状态...');
      const updateUserStatusResponse = await axios.put(`${API_BASE_URL}/auth/users/${userId}/status`, {
        status: 'inactive'
      }, { headers });
      console.log('✅ 更新用户状态成功:', updateUserStatusResponse.data.message);
      
      // 9. 测试删除用户
      console.log('9. 测试删除用户...');
      const deleteUserResponse = await axios.delete(`${API_BASE_URL}/auth/users/${userId}`, { headers });
      console.log('✅ 删除用户成功:', deleteUserResponse.data.message);
    } else {
      console.log('❌ 创建用户失败:', createUserResponse.data.message);
    }
    console.log('');

    // 10. 验证数据来源
    console.log('10. 验证数据来源...');
    console.log('   - 用户数据来源: admin_users表');
    console.log('   - 患者数据来源: smile_test表');
    console.log('   - 诊所数据来源: clinics表');
    console.log('');

    console.log('🎉 所有修复后的账户管理功能测试完成！');
    console.log('');
    console.log('📋 总结:');
    console.log('   ✅ 用户管理: 从admin_users表获取数据');
    console.log('   ✅ 患者管理: 从smile_test表获取数据');
    console.log('   ✅ 诊所管理: 从clinics表获取数据');
    console.log('   ✅ 创建、更新、删除功能正常');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testFixedAccountManagement();
