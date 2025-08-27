const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

// 测试基本连接
async function testBasicConnection() {
  try {
    console.log('🔍 测试基本连接...');
    
    const response = await axios.get(`${API_BASE_URL}/api/smile-test-files/test`);
    
    console.log('✅ 基本连接成功:');
    console.log('状态码:', response.status);
    console.log('响应数据:', response.data);
    
  } catch (error) {
    console.error('❌ 基本连接失败:');
    
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

// 测试文件列表API（不需要认证）
async function testFileListAPI() {
  try {
    console.log('\n🔍 测试文件列表API...');
    
    const smileTestUuid = '30772a78-1a74-4601-b61a-341ac6ba02fa';
    const url = `${API_BASE_URL}/api/smile-test-files/smile-test/${smileTestUuid}`;
    
    console.log('请求URL:', url);
    
    const response = await axios.get(url);
    
    console.log('✅ 文件列表API成功:');
    console.log('状态码:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ 文件列表API失败:');
    
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
      
      if (error.response.status === 401) {
        console.error('⚠️  需要认证，请提供有效的JWT token');
      }
    } else if (error.request) {
      console.error('请求错误:', error.message);
    } else {
      console.error('其他错误:', error.message);
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 开始API测试...\n');
  
  await testBasicConnection();
  await testFileListAPI();
  
  console.log('\n📝 测试完成');
}

main().catch(console.error);
