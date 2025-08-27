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

// 测试上传微笑测试图片
async function uploadSmileTestImage(token, smileTestUuid, imageIndex, fileName) {
  try {
    console.log(`\n⬆️ 上传微笑测试图片 (index: ${imageIndex}, file: ${fileName})...`);
    
    const url = `${API_BASE_URL}/api/smile-test-files/smile-test/${smileTestUuid}/image/${imageIndex}`;
    const uploadData = {
      image_data: `data:image/jpeg;base64,${Buffer.from(`Test image data for ${fileName} - ${Date.now()}`).toString('base64')}`,
      file_name: fileName
    };

    console.log('请求URL:', url);
    console.log('上传数据:', { imageIndex, fileName });

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

// 检查数据库中的实际记录
async function checkDatabaseRecords(smileTestUuid) {
  try {
    console.log('\n🔍 检查数据库中的实际记录...');
    
    // 这里我们需要直接查询数据库，但由于没有数据库连接，我们通过API来检查
    // 我们可以通过获取文件列表来间接检查
    
    const url = `${API_BASE_URL}/api/smile-test-files/smile-test/${smileTestUuid}`;
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.success) {
      const files = response.data.data;
      const smileTestFiles = files.filter(f => f.upload_type === 'smile_test');
      
      console.log(`📊 数据库中的微笑测试文件:`);
      console.log(`  总数: ${files.length}`);
      console.log(`  微笑测试文件: ${smileTestFiles.length}`);
      
      smileTestFiles.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.file_name}`);
        console.log(`     UUID: ${file.uuid}`);
        console.log(`     上传时间: ${file.upload_time}`);
        console.log(`     是否legacy: ${file.uuid.includes('legacy_')}`);
      });
      
      return smileTestFiles;
    }
    
  } catch (error) {
    console.error('❌ 检查数据库记录失败:', error.message);
  }
  
  return [];
}

// 主测试函数
async function main() {
  console.log('🚀 开始调试上传逻辑...\n');
  
  const token = await login();
  if (!token) {
    console.log('❌ 无法获取token，测试终止');
    return;
  }

  const smileTestUuid = '30772a78-1a74-4601-b61a-341ac6ba02fa';

  // 1. 初始状态检查
  console.log('=== 初始状态检查 ===');
  await getFileList(token, smileTestUuid);

  // 2. 上传第一张图片
  console.log('\n=== 上传第一张图片 ===');
  await uploadSmileTestImage(token, smileTestUuid, 1, 'test_image_1.jpg');
  await getFileList(token, smileTestUuid);

  // 3. 上传第二张图片
  console.log('\n=== 上传第二张图片 ===');
  await uploadSmileTestImage(token, smileTestUuid, 2, 'test_image_2.jpg');
  await getFileList(token, smileTestUuid);

  // 4. 上传第三张图片
  console.log('\n=== 上传第三张图片 ===');
  await uploadSmileTestImage(token, smileTestUuid, 3, 'test_image_3.jpg');
  await getFileList(token, smileTestUuid);

  // 5. 再次上传第一张图片（测试是否覆盖）
  console.log('\n=== 再次上传第一张图片（测试覆盖） ===');
  await uploadSmileTestImage(token, smileTestUuid, 1, 'test_image_1_updated.jpg');
  await getFileList(token, smileTestUuid);

  // 6. 最终检查
  console.log('\n=== 最终状态检查 ===');
  await checkDatabaseRecords(smileTestUuid);

  console.log('\n📝 调试完成');
}

main().catch(console.error);
