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

// 测试上传一张图片
async function testUploadImage(token, smileTestUuid) {
  try {
    console.log('\n⬆️ 测试上传图片...');
    
    const url = `${API_BASE_URL}/api/smile-test-files/smile-test/${smileTestUuid}/image/1`;
    const uploadData = {
      image_data: `data:image/jpeg;base64,${Buffer.from(`Test image data - ${Date.now()}`).toString('base64')}`,
      file_name: `test_image_${Date.now()}.jpg`
    };

    console.log('请求URL:', url);
    console.log('上传数据:', { imageIndex: 1, fileName: uploadData.file_name });

    const response = await axios.post(url, uploadData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log(`✅ 上传成功:`, {
        uuid: response.data.data.uuid,
        file_name: response.data.data.file_name,
        upload_type: response.data.data.upload_type,
        upload_time: response.data.data.upload_time
      });
      return response.data.data;
    } else {
      console.log(`❌ 上传失败:`, response.data.message);
      return null;
    }

  } catch (error) {
    console.error(`❌ 上传请求失败:`, error.message);
    if (error.response) {
      console.error('错误响应:', error.response.data);
    }
    return null;
  }
}

// 获取文件列表
async function getFileList(token, smileTestUuid) {
  try {
    console.log('\n🔍 获取文件列表...');
    
    const url = `${API_BASE_URL}/api/smile-test-files/smile-test/${smileTestUuid}`;
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.success) {
      console.log(`✅ 获取成功，共 ${response.data.data.length} 个文件:`);
      response.data.data.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.file_name} (${file.upload_type}) - ${file.uuid}`);
        console.log(`     上传时间: ${file.upload_time}`);
        console.log(`     是否legacy: ${file.uuid.includes('legacy_')}`);
      });
      return response.data.data;
    } else {
      console.log('❌ 获取失败:', response.data.message);
      return [];
    }

  } catch (error) {
    console.error('❌ 获取文件列表失败:', error.message);
    if (error.response) {
      console.error('错误响应:', error.response.data);
    }
    return [];
  }
}

// 主测试函数
async function main() {
  console.log('🚀 开始测试当前状态...\n');
  
  const token = await login();
  if (!token) {
    console.log('❌ 无法获取token，测试终止');
    return;
  }

  const smileTestUuid = '30772a78-1a74-4601-b61a-341ac6ba02fa';

  // 1. 检查当前文件列表
  console.log('=== 当前文件列表 ===');
  const currentFiles = await getFileList(token, smileTestUuid);

  // 2. 上传一张新图片
  console.log('\n=== 上传新图片 ===');
  const uploadResult = await testUploadImage(token, smileTestUuid);

  // 3. 再次检查文件列表
  console.log('\n=== 上传后的文件列表 ===');
  const newFiles = await getFileList(token, smileTestUuid);

  // 4. 分析结果
  console.log('\n=== 分析结果 ===');
  const smileTestFiles = newFiles.filter(f => f.upload_type === 'smile_test');
  const legacyFiles = newFiles.filter(f => f.uuid.includes('legacy_'));
  
  console.log(`📊 微笑测试文件数量: ${smileTestFiles.length}`);
  console.log(`📊 Legacy文件数量: ${legacyFiles.length}`);
  console.log(`📊 总文件数量: ${newFiles.length}`);
  
  if (smileTestFiles.length > 0) {
    console.log('✅ 新表中有微笑测试文件');
  } else {
    console.log('❌ 新表中没有微笑测试文件');
  }

  console.log('\n📝 测试完成');
}

main().catch(console.error);
