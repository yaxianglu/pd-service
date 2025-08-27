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

// 测试下载微笑测试图片组
async function testDownloadImageGroup(token) {
  try {
    console.log('\n🔍 测试下载微笑测试图片组...');
    
    const uuid = 'legacy_30772a78-1a74-4601-b61a-341ac6ba02fa_teeth_images_group';
    const url = `${API_BASE_URL}/api/smile-test-files/download/${uuid}`;
    
    console.log('请求URL:', url);
    console.log('UUID:', uuid);
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      responseType: 'arraybuffer',
      validateStatus: function (status) {
        return status < 500; // 接受所有状态码以便调试
      }
    });
    
    console.log('\n📊 响应信息:');
    console.log('状态码:', response.status);
    console.log('Content-Type:', response.headers['content-type']);
    console.log('Content-Disposition:', response.headers['content-disposition']);
    console.log('文件大小:', response.data.length, 'bytes');
    
    if (response.status === 200) {
      console.log('✅ 下载成功');
      
      // 检查是否是ZIP文件
      if (response.headers['content-type'] === 'application/zip') {
        console.log('✅ 确认是ZIP文件格式');
        
        // 检查Content-Disposition头部
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition && contentDisposition.includes('filename*=UTF-8')) {
          console.log('✅ Content-Disposition头部编码正确');
        } else {
          console.log('⚠️  Content-Disposition头部可能有问题');
        }
        
        // 检查文件大小是否合理（ZIP文件应该比单个图片大）
        if (response.data.length > 10000) { // 大于10KB
          console.log('✅ ZIP文件大小合理');
        } else {
          console.log('⚠️  ZIP文件可能太小');
        }
        
      } else {
        console.log('❌ 不是ZIP文件格式');
        console.log('实际Content-Type:', response.headers['content-type']);
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
  console.log('🚀 开始测试ZIP下载功能...\n');
  
  // 先登录获取token
  const token = await login();
  
  if (!token) {
    console.log('❌ 无法获取认证token，测试终止');
    return;
  }
  
  // 测试下载图片组
  await testDownloadImageGroup(token);
  
  console.log('\n📝 测试完成');
}

main().catch(console.error);
