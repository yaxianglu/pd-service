const axios = require('axios');

async function testNoStatus() {
  try {
    console.log('🔍 测试移除状态功能后的系统...\n');
    
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
    
    // 测试获取用户列表（应该不包含状态列）
    console.log('\n📋 测试获取用户列表:');
    const usersResponse = await axios.get('http://localhost:3001/auth/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (usersResponse.data?.success) {
      console.log('✅ 获取用户列表成功');
      console.log(`   用户数量: ${usersResponse.data.data.length}`);
      
      // 检查用户数据是否包含状态字段
      if (usersResponse.data.data.length > 0) {
        const firstUser = usersResponse.data.data[0];
        console.log('   第一个用户字段:', Object.keys(firstUser));
        
        if (firstUser.hasOwnProperty('status')) {
          console.log('⚠️  用户数据仍包含状态字段');
        } else {
          console.log('✅ 用户数据已移除状态字段');
        }
      }
    } else {
      console.log('❌ 获取用户列表失败:', usersResponse.data?.message);
    }
    
    // 测试获取诊所列表（应该不包含状态列）
    console.log('\n🏥 测试获取诊所列表:');
    const clinicsResponse = await axios.get('http://localhost:3001/auth/clinics', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (clinicsResponse.data?.success) {
      console.log('✅ 获取诊所列表成功');
      console.log(`   诊所数量: ${clinicsResponse.data.data.length}`);
      
      // 检查诊所数据是否包含状态字段
      if (clinicsResponse.data.data.length > 0) {
        const firstClinic = clinicsResponse.data.data[0];
        console.log('   第一个诊所字段:', Object.keys(firstClinic));
        
        if (firstClinic.hasOwnProperty('status')) {
          console.log('⚠️  诊所数据仍包含状态字段');
        } else {
          console.log('✅ 诊所数据已移除状态字段');
        }
      }
    } else {
      console.log('❌ 获取诊所列表失败:', clinicsResponse.data?.message);
    }
    
    // 测试获取患者列表（应该不包含状态列）
    console.log('\n👥 测试获取患者列表:');
    const patientsResponse = await axios.get('http://localhost:3001/auth/patients', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (patientsResponse.data?.success) {
      console.log('✅ 获取患者列表成功');
      console.log(`   患者数量: ${patientsResponse.data.data.length}`);
      
      // 检查患者数据是否包含状态字段
      if (patientsResponse.data.data.length > 0) {
        const firstPatient = patientsResponse.data.data[0];
        console.log('   第一个患者字段:', Object.keys(firstPatient));
        
        if (firstPatient.hasOwnProperty('status')) {
          console.log('⚠️  患者数据仍包含状态字段');
        } else {
          console.log('✅ 患者数据已移除状态字段');
        }
      }
    } else {
      console.log('❌ 获取患者列表失败:', patientsResponse.data?.message);
    }
    
    // 测试状态更新API是否已被移除
    console.log('\n🚫 测试状态更新API是否已被移除:');
    
    // 测试用户状态更新API
    try {
      await axios.put('http://localhost:3001/auth/users/1/status', {
        status: 'inactive'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('❌ 用户状态更新API仍然存在');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ 用户状态更新API已被移除');
      } else {
        console.log('⚠️  用户状态更新API返回其他错误:', error.response?.status);
      }
    }
    
    // 测试诊所状态更新API
    try {
      await axios.put('http://localhost:3001/auth/clinics/1/status', {
        status: 'inactive'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('❌ 诊所状态更新API仍然存在');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ 诊所状态更新API已被移除');
      } else {
        console.log('⚠️  诊所状态更新API返回其他错误:', error.response?.status);
      }
    }
    
    // 测试患者状态更新API
    try {
      await axios.put('http://localhost:3001/auth/patients/1/status', {
        status: 'inactive'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('❌ 患者状态更新API仍然存在');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ 患者状态更新API已被移除');
      } else {
        console.log('⚠️  患者状态更新API返回其他错误:', error.response?.status);
      }
    }
    
    console.log('\n✅ 状态功能移除测试完成');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testNoStatus();
