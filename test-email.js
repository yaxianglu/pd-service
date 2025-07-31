const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api/email';

// 测试配置
const testEmail = 'test@example.com'; // 替换为你的测试邮箱

async function testEmailService() {
  console.log('📧 开始测试邮件服务...\n');

  try {
    // 1. 测试邮件服务状态
    console.log('1. 测试邮件服务状态...');
    const statusResponse = await axios.get(`${API_BASE_URL}/status`);
    console.log('✅ 邮件服务状态:', statusResponse.data);
    console.log('');

    if (!statusResponse.data.data.configured) {
      console.log('⚠️  邮件服务未配置，跳过发送测试');
      console.log('请配置以下环境变量：');
      console.log('  - SMTP_HOST');
      console.log('  - SMTP_PORT');
      console.log('  - SMTP_USER');
      console.log('  - SMTP_PASS');
      return;
    }

    // 2. 测试发送测试邮件
    console.log('2. 测试发送测试邮件...');
    const testResponse = await axios.post(`${API_BASE_URL}/test`, {
      to: testEmail
    });
    console.log('✅ 测试邮件发送成功:', testResponse.data);
    console.log('');

    // 3. 测试发送欢迎邮件
    console.log('3. 测试发送欢迎邮件...');
    const welcomeResponse = await axios.post(`${API_BASE_URL}/welcome`, {
      to: testEmail,
      name: '张三',
      clinicName: '阳光牙科诊所'
    });
    console.log('✅ 欢迎邮件发送成功:', welcomeResponse.data);
    console.log('');

    // 4. 测试发送牙医注册邮件
    console.log('4. 测试发送牙医注册邮件...');
    const registrationResponse = await axios.post(`${API_BASE_URL}/dentist-registration`, {
      to: testEmail,
      fullName: '李医生',
      clinicName: '仁心牙科诊所',
      phone: '0912345678',
      applicationId: 'APP_' + Date.now()
    });
    console.log('✅ 牙医注册邮件发送成功:', registrationResponse.data);
    console.log('');

    // 5. 测试发送支付确认邮件
    console.log('5. 测试发送支付确认邮件...');
    const paymentResponse = await axios.post(`${API_BASE_URL}/payment-confirmation`, {
      to: testEmail,
      patientName: '王患者',
      amount: '1000.00',
      currency: 'TWD',
      treatmentType: '牙齿矫正',
      paymentId: 'PAY_' + Date.now(),
      date: new Date().toISOString().split('T')[0]
    });
    console.log('✅ 支付确认邮件发送成功:', paymentResponse.data);
    console.log('');

    // 6. 测试发送通知邮件
    console.log('6. 测试发送通知邮件...');
    const notificationResponse = await axios.post(`${API_BASE_URL}/notification`, {
      to: testEmail,
      title: '系统测试通知',
      message: '这是一封测试通知邮件，用于验证邮件服务功能。',
      actionUrl: 'https://example.com',
      actionText: '查看详情'
    });
    console.log('✅ 通知邮件发送成功:', notificationResponse.data);
    console.log('');

    // 7. 测试批量发送邮件
    console.log('7. 测试批量发送邮件...');
    const bulkResponse = await axios.post(`${API_BASE_URL}/bulk`, {
      recipients: [testEmail],
      subject: '批量测试邮件',
      html: '<h1>批量测试邮件</h1><p>这是一封批量发送的测试邮件。</p>'
    });
    console.log('✅ 批量邮件发送成功:', bulkResponse.data);
    console.log('');

    console.log('🎉 所有邮件测试通过！');
    console.log('\n📝 请检查您的邮箱收件箱，确认所有邮件都已收到。');
    console.log('测试邮箱:', testEmail);

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      console.log('\n💡 提示: 请检查邮件配置');
      console.log('   - SMTP_HOST');
      console.log('   - SMTP_PORT');
      console.log('   - SMTP_USER');
      console.log('   - SMTP_PASS');
    }
    
    if (error.response?.status === 500) {
      console.log('\n💡 提示: 邮件服务内部错误，请检查SMTP连接');
    }
  }
}

// 测试特定邮件类型
async function testSpecificEmail(type, data) {
  console.log(`📧 测试${type}邮件...`);
  
  try {
    const response = await axios.post(`${API_BASE_URL}/${type}`, {
      to: testEmail,
      ...data
    });
    console.log(`✅ ${type}邮件发送成功:`, response.data);
    return true;
  } catch (error) {
    console.error(`❌ ${type}邮件发送失败:`, error.response?.data || error.message);
    return false;
  }
}

// 运行测试
if (require.main === module) {
  testEmailService();
}

module.exports = { testEmailService, testSpecificEmail }; 