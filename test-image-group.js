const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testImageGroupUpload() {
  try {
    console.log('🧪 测试图片组上传...');
    
    const smileTestUuid = 'b0af75af-ccb4-4a51-894a-8e8a11a4a193';
    
    // 创建一个简单的测试图片数据（base64编码的1x1像素PNG）
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    // 上传4张图片，应该都保存到同一个图片组中
    for (let i = 1; i <= 4; i++) {
      console.log(`📝 上传图片 ${i}...`);
      
      const response = await axios.post(`${BASE_URL}/api/smile-test-files/smile-test/${smileTestUuid}/image/${i}`, {
        image_data: testImageData
      });
      
      console.log(`✅ 图片 ${i} 上传响应:`, {
        success: response.data.success,
        message: response.data.message,
        fileName: response.data.data?.file_name
      });
    }
    
  } catch (error) {
    console.log('❌ 上传错误:', error.response?.data || error.message);
  }
}

async function testGetFileList() {
  try {
    console.log('\n🧪 测试获取文件列表...');
    
    const smileTestUuid = 'b0af75af-ccb4-4a51-894a-8e8a11a4a193';
    
    const response = await axios.get(`${BASE_URL}/api/smile-test-files/smile-test/${smileTestUuid}`);
    
    console.log('✅ 文件列表响应:', {
      success: response.data.success,
      message: response.data.message,
      fileCount: response.data.data?.length || 0,
      files: response.data.data?.map(f => ({
        uuid: f.uuid,
        fileName: f.file_name,
        type: f.upload_type,
        uploadTime: f.upload_time
      }))
    });
    
  } catch (error) {
    console.log('❌ 获取文件列表错误:', error.response?.data || error.message);
  }
}

async function testGetSpecificImage() {
  try {
    console.log('\n🧪 测试获取特定图片...');
    
    const smileTestUuid = 'b0af75af-ccb4-4a51-894a-8e8a11a4a193';
    
    // 获取图片2
    const response = await axios.get(`${BASE_URL}/api/smile-test-files/smile-test/${smileTestUuid}/image/2`);
    
    console.log('✅ 获取特定图片响应:', {
      success: response.data.success,
      message: response.data.message,
      hasData: !!response.data.data,
      fileName: response.data.data?.file_name,
      dataLength: response.data.data?.file_data?.length || 0
    });
    
  } catch (error) {
    console.log('❌ 获取特定图片错误:', error.response?.data || error.message);
  }
}

async function testDownloadImageGroup() {
  try {
    console.log('\n🧪 测试下载图片组...');
    
    // 先获取文件列表，找到图片组的UUID
    const smileTestUuid = 'b0af75af-ccb4-4a51-894a-8e8a11a4a193';
    const listResponse = await axios.get(`${BASE_URL}/api/smile-test-files/smile-test/${smileTestUuid}`);
    
    const imageGroup = listResponse.data.data?.find(f => f.file_name === '微笑测试图片组');
    
    if (imageGroup) {
      console.log(`📝 下载图片组: ${imageGroup.uuid}`);
      
      const response = await axios.get(`${BASE_URL}/api/smile-test-files/download/${imageGroup.uuid}`, {
        responseType: 'arraybuffer'
      });
      
      console.log('✅ 下载图片组响应:', {
        status: response.status,
        contentType: response.headers['content-type'],
        contentLength: response.headers['content-length'],
        dataLength: response.data.length
      });
    } else {
      console.log('⚠️ 没有找到图片组');
    }
    
  } catch (error) {
    console.log('❌ 下载图片组错误:', error.response?.status, error.response?.statusText);
  }
}

async function main() {
  await testImageGroupUpload();
  await testGetFileList();
  await testGetSpecificImage();
  await testDownloadImageGroup();
}

main().catch(console.error);
