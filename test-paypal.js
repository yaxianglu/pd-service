const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api/paypal';

// 测试配置
const testConfig = {
  amount: 10.00,
  currency: 'USD',
  description: '测试牙科治疗费用',
  returnUrl: 'http://localhost:3000/payment/success',
  cancelUrl: 'http://localhost:3000/payment/cancel',
  customId: 'TEST_ORDER_' + Date.now(),
};

async function testPayPalService() {
  console.log('🚀 开始测试PayPal服务...\n');

  try {
    // 1. 测试配置接口
    console.log('1. 测试配置接口...');
    const configResponse = await axios.get(`${API_BASE_URL}/config`);
    console.log('✅ 配置信息:', configResponse.data);
    console.log('');

    // 2. 测试创建支付
    console.log('2. 测试创建支付...');
    const createResponse = await axios.post(`${API_BASE_URL}/create-payment`, testConfig);
    console.log('✅ 支付创建成功:', createResponse.data);
    
    const orderId = createResponse.data.data.id;
    console.log('订单ID:', orderId);
    console.log('');

    // 3. 测试获取支付详情
    console.log('3. 测试获取支付详情...');
    const detailsResponse = await axios.get(`${API_BASE_URL}/payment/${orderId}`);
    console.log('✅ 支付详情:', detailsResponse.data);
    console.log('');

    // 4. 测试获取支付历史
    console.log('4. 测试获取支付历史...');
    const historyResponse = await axios.get(`${API_BASE_URL}/history?page=1&pageSize=5`);
    console.log('✅ 支付历史:', historyResponse.data);
    console.log('');

    console.log('🎉 所有测试通过！');
    console.log('\n📝 下一步操作:');
    console.log('1. 访问PayPal支付链接完成支付');
    console.log('2. 支付完成后调用捕获接口');
    console.log('3. 检查Webhook事件处理');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 提示: 请检查PayPal环境变量配置');
      console.log('   - PAYPAL_CLIENT_ID');
      console.log('   - PAYPAL_CLIENT_SECRET');
      console.log('   - PAYPAL_ENVIRONMENT');
    }
  }
}

// 运行测试
if (require.main === module) {
  testPayPalService();
}

module.exports = { testPayPalService }; 