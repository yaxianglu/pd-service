const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testUploadSmileTestImage() {
  try {
    console.log('🧪 测试微笑测试图片上传...');
    
    const smileTestUuid = 'b0af75af-ccb4-4a51-894a-8e8a11a4a193';
    const imageIndex = 4;
    
    // 创建一个简单的测试图片数据（base64编码的1x1像素PNG）
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    console.log(`📝 上传图片到: ${smileTestUuid}, 索引: ${imageIndex}`);
    
    const response = await axios.post(`${BASE_URL}/api/smile-test-files/smile-test/${smileTestUuid}/image/${imageIndex}`, {
      image_data: testImageData
    });
    
    console.log('✅ 上传响应:', response.data);
    
  } catch (error) {
    console.log('❌ 上传错误:', error.response?.data || error.message);
  }
}

async function testGetSmileTestImage() {
  try {
    console.log('\n🧪 测试获取微笑测试图片...');
    
    const smileTestUuid = 'b0af75af-ccb4-4a51-894a-8e8a11a4a193';
    const imageIndex = 2;
    
    console.log(`📝 获取图片: ${smileTestUuid}, 索引: ${imageIndex}`);
    
    const response = await axios.get(`${BASE_URL}/api/smile-test-files/smile-test/${smileTestUuid}/image/${imageIndex}`);
    
    console.log('✅ 获取响应:', {
      success: response.data.success,
      message: response.data.message,
      hasData: !!response.data.data,
      fileName: response.data.data?.file_name,
      dataLength: response.data.data?.file_data?.length || 0
    });
    
  } catch (error) {
    console.log('❌ 获取错误:', error.response?.data || error.message);
  }
}

async function testGetSmileTestFiles() {
  try {
    console.log('\n🧪 测试获取文件列表...');
    
    const smileTestUuid = 'b0af75af-ccb4-4a51-894a-8e8a11a4a193';
    
    console.log(`📝 获取文件列表: ${smileTestUuid}`);
    
    const response = await axios.get(`${BASE_URL}/api/smile-test-files/smile-test/${smileTestUuid}`);
    
    console.log('✅ 文件列表响应:', {
      success: response.data.success,
      message: response.data.message,
      fileCount: response.data.data?.length || 0,
      files: response.data.data?.map(f => ({
        uuid: f.uuid,
        fileName: f.file_name,
        type: f.upload_type
      }))
    });
    
  } catch (error) {
    console.log('❌ 获取文件列表错误:', error.response?.data || error.message);
  }
}

async function main() {
  await testUploadSmileTestImage();
  await testGetSmileTestImage();
  await testGetSmileTestFiles();
}

main().catch(console.error);
