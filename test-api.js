const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

// 测试微笑测试文件列表API
async function testGetSmileTestFiles() {
  try {
    console.log('🔍 测试获取微笑测试文件列表API...');
    
    const smileTestUuid = '30772a78-1a74-4601-b61a-341ac6ba02fa';
    const url = `${API_BASE_URL}/api/smile-test-files/smile-test/${smileTestUuid}`;
    
    console.log('请求URL:', url);
    
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        // 如果需要认证，在这里添加token
        // 'Authorization': 'Bearer your-token-here'
      }
    });
    
    console.log('✅ API响应成功:');
    console.log('状态码:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ API测试失败:');
    
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      console.error('请求错误:', error.message);
      console.error('请确保后端服务正在运行在 http://localhost:3001');
    } else {
      console.error('其他错误:', error.message);
    }
  }
}

// 测试其他API端点
async function testOtherEndpoints() {
  const smileTestUuid = '30772a78-1a74-4601-b61a-341ac6ba02fa';
  
  const endpoints = [
    `/api/smile-test-files/smile-test/${smileTestUuid}/images`,
    `/api/smile-test-files/smile-test/${smileTestUuid}/oral-scan`,
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 测试端点: ${endpoint}`);
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      console.log('✅ 成功:', response.status);
    } catch (error) {
      console.log('❌ 失败:', error.response?.status || error.message);
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 开始API测试...\n');
  
  await testGetSmileTestFiles();
  await testOtherEndpoints();
  
  console.log('\n📝 测试完成');
}

main().catch(console.error);
