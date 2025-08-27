const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

// 登录获取token
async function login() {
  try {
    console.log('🔐 尝试登录获取token...');
    
    const loginData = {
      username: 'pearl_admin_2025',
      password: 'P@rlD1g1t@l2024!'
    };
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
    
    if (response.data.success) {
      console.log('✅ 登录成功');
      return response.data.data.token;
    } else {
      console.log('❌ 登录失败:', response.data.message);
      return null;
    }
    
  } catch (error) {
    console.error('❌ 登录请求失败:', error.message);
    return null;
  }
}

// 测试获取文件列表（包括旧API的文件）
async function testGetFilesWithLegacy(token) {
  try {
    console.log('\n🔍 测试获取文件列表（包括旧API文件）...');
    
    const smileTestUuid = '30772a78-1a74-4601-b61a-341ac6ba02fa';
    const url = `${API_BASE_URL}/api/smile-test-files/smile-test/${smileTestUuid}`;
    
    console.log('请求URL:', url);
    
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ 文件列表获取成功:');
    console.log('状态码:', response.status);
    console.log('文件数量:', response.data.data?.length || 0);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('\n📋 文件列表:');
      response.data.data.forEach((file, index) => {
        console.log(`${index + 1}. ${file.file_name} (${file.upload_type}) - ${file.uuid}`);
      });
    } else {
      console.log('⚠️  没有找到文件');
    }
    
  } catch (error) {
    console.error('❌ 获取文件列表失败:');
    
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      console.error('请求错误:', error.message);
    } else {
      console.error('其他错误:', error.message);
    }
  }
}

// 测试下载旧API的文件
async function testDownloadLegacyFile(token) {
  try {
    console.log('\n🔍 测试下载旧API文件...');
    
    const smileTestUuid = '30772a78-1a74-4601-b61a-341ac6ba02fa';
    const legacyFileUuid = `legacy_${smileTestUuid}_allergies`;
    const url = `${API_BASE_URL}/api/smile-test-files/download/${legacyFileUuid}`;
    
    console.log('请求URL:', url);
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      responseType: 'arraybuffer'
    });
    
    console.log('✅ 文件下载成功:');
    console.log('状态码:', response.status);
    console.log('文件大小:', response.data.length, 'bytes');
    console.log('Content-Type:', response.headers['content-type']);
    
  } catch (error) {
    console.error('❌ 文件下载失败:');
    
    if (error.response) {
      console.error('状态码:', error.response.status);
      if (error.response.headers['content-type']?.includes('application/json')) {
        const errorData = JSON.parse(error.response.data.toString());
        console.error('错误信息:', errorData);
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
  console.log('🚀 开始测试旧文件兼容性...\n');
  
  // 先登录获取token
  const token = await login();
  
  if (!token) {
    console.log('❌ 无法获取认证token，测试终止');
    return;
  }
  
  // 测试获取文件列表
  await testGetFilesWithLegacy(token);
  
  // 测试下载旧文件
  await testDownloadLegacyFile(token);
  
  console.log('\n📝 测试完成');
}

main().catch(console.error);
