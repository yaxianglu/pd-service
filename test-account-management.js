const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

// 测试账户管理功能
async function testAccountManagement() {
  try {
    console.log('🧪 开始测试账户管理功能...\n');

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

    // 2. 测试获取用户列表
    console.log('2. 测试获取用户列表...');
    const usersResponse = await axios.get(`${API_BASE_URL}/auth/users`, { headers });
    console.log('✅ 获取用户列表成功，共', usersResponse.data.data.length, '个用户\n');

    // 3. 测试获取诊所列表
    console.log('3. 测试获取诊所列表...');
    const clinicsResponse = await axios.get(`${API_BASE_URL}/auth/clinics`, { headers });
    console.log('✅ 获取诊所列表成功，共', clinicsResponse.data.data.length, '个诊所\n');

    // 4. 测试获取患者列表
    console.log('4. 测试获取患者列表...');
    const patientsResponse = await axios.get(`${API_BASE_URL}/auth/patients`, { headers });
    console.log('✅ 获取患者列表成功，共', patientsResponse.data.data.length, '个患者\n');

    // 5. 测试创建诊所
    console.log('5. 测试创建诊所...');
    const createClinicData = {
      clinic_name: '测试诊所',
      clinic_code: 'TEST001',
      address: '测试地址',
      city: '台北',
      district: '信义区',
      phone: '02-12345678',
      email: 'test@clinic.com'
    };
    
    const createClinicResponse = await axios.post(`${API_BASE_URL}/auth/clinics`, createClinicData, { headers });
    if (createClinicResponse.data.success) {
      console.log('✅ 创建诊所成功:', createClinicResponse.data.data.clinic_name);
      
      // 6. 测试更新诊所状态
      const clinicId = createClinicResponse.data.data.id;
      console.log('6. 测试更新诊所状态...');
      const updateStatusResponse = await axios.put(`${API_BASE_URL}/auth/clinics/${clinicId}/status`, {
        status: 'inactive'
      }, { headers });
      console.log('✅ 更新诊所状态成功\n');
      
      // 7. 测试删除诊所
      console.log('7. 测试删除诊所...');
      const deleteClinicResponse = await axios.delete(`${API_BASE_URL}/auth/clinics/${clinicId}`, { headers });
      console.log('✅ 删除诊所成功\n');
    }

    // 8. 测试创建患者
    console.log('8. 测试创建患者...');
    const createPatientData = {
      full_name: '测试患者',
      phone: '0912345678',
      email: 'patient@test.com',
      gender: 'male',
      address: '患者地址',
      emergency_contact: '紧急联系人',
      emergency_phone: '0987654321'
    };
    
    const createPatientResponse = await axios.post(`${API_BASE_URL}/auth/patients`, createPatientData, { headers });
    if (createPatientResponse.data.success) {
      console.log('✅ 创建患者成功:', createPatientResponse.data.data.full_name);
      
      // 9. 测试更新患者状态
      const patientId = createPatientResponse.data.data.id;
      console.log('9. 测试更新患者状态...');
      const updatePatientStatusResponse = await axios.put(`${API_BASE_URL}/auth/patients/${patientId}/status`, {
        status: 'inactive'
      }, { headers });
      console.log('✅ 更新患者状态成功\n');
      
      // 10. 测试删除患者
      console.log('10. 测试删除患者...');
      const deletePatientResponse = await axios.delete(`${API_BASE_URL}/auth/patients/${patientId}`, { headers });
      console.log('✅ 删除患者成功\n');
    }

    // 11. 测试创建用户
    console.log('11. 测试创建用户...');
    const createUserData = {
      username: 'testuser',
      password: 'testpass123',
      full_name: '测试用户',
      role: 'doctor',
      email: 'testuser@test.com',
      phone: '0912345678'
    };
    
    const createUserResponse = await axios.post(`${API_BASE_URL}/auth/users`, createUserData, { headers });
    if (createUserResponse.data.success) {
      console.log('✅ 创建用户成功:', createUserResponse.data.data.username);
      
      // 12. 测试更新用户状态
      const userId = createUserResponse.data.data.id;
      console.log('12. 测试更新用户状态...');
      const updateUserStatusResponse = await axios.put(`${API_BASE_URL}/auth/users/${userId}/status`, {
        status: 'inactive'
      }, { headers });
      console.log('✅ 更新用户状态成功\n');
      
      // 13. 测试删除用户
      console.log('13. 测试删除用户...');
      const deleteUserResponse = await axios.delete(`${API_BASE_URL}/auth/users/${userId}`, { headers });
      console.log('✅ 删除用户成功\n');
    }

    console.log('🎉 所有账户管理功能测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testAccountManagement();
