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

// 测试获取文件列表（应该只显示一个微笑测试图片组）
async function testGetFileList(token) {
  try {
    console.log('\n🔍 测试获取文件列表（图片组）...');
    
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
      
      // 检查是否有微笑测试图片组
      const smileTestGroup = response.data.data.find(file => 
        file.uuid.includes('teeth_images_group') && file.upload_type === 'smile_test'
      );
      
      if (smileTestGroup) {
        console.log('\n✅ 找到微笑测试图片组:', smileTestGroup.file_name);
        return smileTestGroup.uuid;
      } else {
        console.log('\n⚠️  没有找到微笑测试图片组');
      }
    } else {
      console.log('⚠️  没有找到文件');
    }
    
  } catch (error) {
    console.error('❌ 获取文件列表失败:', error.message);
    if (error.response) {
      console.error('错误信息:', error.response.data);
    }
  }
  
  return null;
}

// 测试下载微笑测试图片组
async function testDownloadImageGroup(token, groupUuid) {
  try {
    console.log(`\n🔍 测试下载微笑测试图片组: ${groupUuid}`);
    
    const url = `${API_BASE_URL}/api/smile-test-files/download/${groupUuid}`;
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
    console.log('Content-Type:', response.headers['content-type']);
    console.log('Content-Disposition:', response.headers['content-disposition']);
    
    if (response.status === 200) {
      console.log('✅ 下载成功');
      console.log('文件大小:', response.data.length, 'bytes');
      
      // 检查是否是ZIP文件
      if (response.headers['content-type'] === 'application/zip') {
        console.log('✅ 确认是ZIP文件格式');
      } else {
        console.log('⚠️  不是ZIP文件格式');
      }
    } else {
      console.log('❌ 下载失败');
      if (response.headers['content-type']?.includes('application/json')) {
        const errorData = JSON.parse(response.data.toString());
        console.log('错误信息:', errorData);
      }
    }
    
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
    
    if (error.response) {
      console.error('状态码:', error.response.status);
      if (error.response.headers['content-type']?.includes('application/json')) {
        const errorData = JSON.parse(error.response.data.toString());
        console.error('错误信息:', errorData);
      }
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 开始测试微笑测试图片组功能...\n');
  
  // 先登录获取token
  const token = await login();
  
  if (!token) {
    console.log('❌ 无法获取认证token，测试终止');
    return;
  }
  
  // 测试获取文件列表
  const groupUuid = await testGetFileList(token);
  
  // 测试下载图片组
  if (groupUuid) {
    await testDownloadImageGroup(token, groupUuid);
  }
  
  console.log('\n📝 测试完成');
}

main().catch(console.error);
