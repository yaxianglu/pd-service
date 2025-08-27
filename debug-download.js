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

// 调试UUID解析
function debugUuidParsing(uuid) {
  console.log('\n🔍 调试UUID解析:');
  console.log('原始UUID:', uuid);
  
  if (uuid.startsWith('legacy_')) {
    const parts = uuid.split('_');
    console.log('分割后的parts:', parts);
    console.log('parts.length:', parts.length);
    
    if (parts.length >= 3) {
      const smileTestUuid = parts[1];
      const fieldName = parts[2];
      
      console.log('smileTestUuid:', smileTestUuid);
      console.log('fieldName:', fieldName);
      console.log('fieldName.startsWith("teeth_image_"):', fieldName.startsWith('teeth_image_'));
      
      if (fieldName.startsWith('teeth_image_')) {
        const index = fieldName.split('_')[2];
        console.log('提取的index:', index);
      }
    }
  }
}

// 测试下载功能
async function testDownload(token, uuid) {
  try {
    console.log(`\n🔍 测试下载文件: ${uuid}`);
    
    const url = `${API_BASE_URL}/api/smile-test-files/download/${uuid}`;
    console.log('请求URL:', url);
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      responseType: 'arraybuffer',
      validateStatus: function (status) {
        return status < 500; // 接受所有状态码以便调试
      }
    });
    
    console.log('响应状态码:', response.status);
    console.log('响应头:', response.headers);
    
    if (response.status === 200) {
      console.log('✅ 下载成功');
      console.log('文件大小:', response.data.length, 'bytes');
      console.log('Content-Type:', response.headers['content-type']);
    } else {
      console.log('❌ 下载失败');
      if (response.headers['content-type']?.includes('application/json')) {
        const errorData = JSON.parse(response.data.toString());
        console.log('错误信息:', errorData);
      } else {
        console.log('响应数据:', response.data.toString());
      }
    }
    
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
    
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应头:', error.response.headers);
      if (error.response.headers['content-type']?.includes('application/json')) {
        const errorData = JSON.parse(error.response.data.toString());
        console.error('错误信息:', errorData);
      }
    }
  }
}

// 测试获取文件列表
async function testGetFileList(token, smileTestUuid) {
  try {
    console.log(`\n🔍 测试获取文件列表: ${smileTestUuid}`);
    
    const url = `${API_BASE_URL}/api/smile-test-files/smile-test/${smileTestUuid}`;
    console.log('请求URL:', url);
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ 文件列表获取成功');
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
    console.error('❌ 获取文件列表失败:', error.message);
    if (error.response) {
      console.error('错误信息:', error.response.data);
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 开始调试下载功能...\n');
  
  // 先登录获取token
  const token = await login();
  
  if (!token) {
    console.log('❌ 无法获取认证token，测试终止');
    return;
  }
  
  const smileTestUuid = '30772a78-1a74-4601-b61a-341ac6ba02fa';
  const testUuid = `legacy_${smileTestUuid}_teeth_image_2`;
  
  // 调试UUID解析
  debugUuidParsing(testUuid);
  
  // 测试获取文件列表
  await testGetFileList(token, smileTestUuid);
  
  // 测试下载
  await testDownload(token, testUuid);
  
  console.log('\n📝 调试完成');
}

main().catch(console.error);
