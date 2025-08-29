const axios = require('axios');

async function testDoctorClinicBinding() {
  try {
    console.log('🔍 测试医生绑定诊所功能...\n');
    
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
    
    // 首先获取诊所列表
    console.log('\n📋 获取诊所列表:');
    const clinicsResponse = await axios.get('http://localhost:3001/auth/clinics', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    let clinicUuid = null;
    if (clinicsResponse.data?.success && clinicsResponse.data.data.length > 0) {
      clinicUuid = clinicsResponse.data.data[0].uuid;
      console.log(`✅ 找到诊所: ${clinicsResponse.data.data[0].clinic_name} (UUID: ${clinicUuid})`);
    } else {
      console.log('❌ 没有找到诊所，先创建一个诊所');
      
      // 创建诊所
      const createClinicResponse = await axios.post('http://localhost:3001/auth/clinics', {
        clinic_name: '测试诊所',
        clinic_code: 'TEST001',
        address: '测试地址',
        city: '台北',
        district: '信义区',
        phone: '02-12345678',
        email: 'test@clinic.com'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (createClinicResponse.data?.success) {
        clinicUuid = createClinicResponse.data.data.uuid;
        console.log(`✅ 创建诊所成功: ${createClinicResponse.data.data.clinic_name} (UUID: ${clinicUuid})`);
      } else {
        console.log('❌ 创建诊所失败:', createClinicResponse.data?.message);
        return;
      }
    }
    
    // 测试创建绑定诊所的医生
    console.log('\n👨‍⚕️ 测试创建绑定诊所的医生:');
    const testDoctor = {
      username: `test_doctor_${Date.now()}`,
      password: 'test123',
      full_name: '测试医生',
      role: 'doctor',
      department: clinicUuid, // 绑定诊所
      email: 'doctor@test.com',
      phone: '0912345678'
    };
    
    const createDoctorResponse = await axios.post('http://localhost:3001/auth/users', testDoctor, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (createDoctorResponse.data?.success) {
      console.log(`✅ 创建医生成功: ${testDoctor.username}`);
      console.log(`   绑定诊所: ${clinicUuid}`);
    } else {
      console.log('❌ 创建医生失败:', createDoctorResponse.data?.message);
    }
    
    // 测试创建不绑定诊所的医生（应该失败）
    console.log('\n⚠️ 测试创建不绑定诊所的医生（应该失败）:');
    const testDoctorNoClinic = {
      username: `test_doctor_no_clinic_${Date.now()}`,
      password: 'test123',
      full_name: '测试医生（无诊所）',
      role: 'doctor',
      // 不设置 department
      email: 'doctor_no_clinic@test.com',
      phone: '0912345679'
    };
    
    try {
      const createDoctorNoClinicResponse = await axios.post('http://localhost:3001/auth/users', testDoctorNoClinic, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (createDoctorNoClinicResponse.data?.success) {
        console.log(`⚠️ 意外成功创建医生: ${testDoctorNoClinic.username}`);
      } else {
        console.log(`✅ 正确阻止创建医生: ${createDoctorNoClinicResponse.data?.message}`);
      }
    } catch (error) {
      console.log(`✅ 正确阻止创建医生: ${error.response?.data?.message || error.message}`);
    }
    
    // 获取用户列表验证
    console.log('\n📋 获取用户列表验证:');
    const usersResponse = await axios.get('http://localhost:3001/auth/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (usersResponse.data?.success) {
      console.log('用户列表:');
      usersResponse.data.data.forEach(user => {
        if (user.role === 'doctor') {
          console.log(`  👨‍⚕️ ${user.username} - ${user.full_name} - 诊所: ${user.department || '未绑定'}`);
        } else {
          console.log(`  👤 ${user.username} - ${user.full_name} - 角色: ${user.role}`);
        }
      });
    } else {
      console.log('❌ 获取用户列表失败:', usersResponse.data?.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testDoctorClinicBinding();
