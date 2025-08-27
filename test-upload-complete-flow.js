const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testUploadCompleteFlow() {
  try {
    console.log('🧪 测试完整的上传流程...');
    
    const smileTestUuid = 'b0af75af-ccb4-4a51-894a-8e8a11a4a193';
    
    // 创建一个简单的测试图片数据（base64编码的1x1像素PNG）
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    // 模拟4张照片的数据
    const photos = [
      { step: 1, url: testImageData },
      { step: 2, url: testImageData },
      { step: 3, url: testImageData },
      { step: 4, url: testImageData }
    ];
    
    console.log('📝 模拟完成提交流程...');
    console.log(`📝 使用的UUID: ${smileTestUuid}`);
    console.log(`📝 照片数量: ${photos.length}`);
    
    // 1. 保存4张图片到smile_test_files表
    console.log('\n📸 步骤1: 保存4张图片到smile_test_files表...');
    
    // 准备照片数据，按步骤排序
    const sortedPhotos = photos.sort((a, b) => a.step - b.step);
    
    // 创建图片组数据
    const imageGroup = {
      images: sortedPhotos.map((photo, index) => ({
        index: index + 1,
        field: `teeth_image_${index + 1}`,
        data: photo.url
      }))
    };
    
    console.log('📦 图片组数据:', {
      imageCount: imageGroup.images.length,
      photo1Length: imageGroup.images[0]?.data?.length || 0,
      photo2Length: imageGroup.images[1]?.data?.length || 0,
      photo3Length: imageGroup.images[2]?.data?.length || 0,
      photo4Length: imageGroup.images[3]?.data?.length || 0
    });
    
    // 保存到smile_test_files表
    const imageGroupResponse = await axios.post(`${BASE_URL}/api/smile-test-files/smile-test/${smileTestUuid}/image-group`, {
      image_group: imageGroup
    });
    
    console.log('✅ 图片组保存响应:', {
      success: imageGroupResponse.data.success,
      message: imageGroupResponse.data.message,
      fileName: imageGroupResponse.data.data?.file_name,
      uploadType: imageGroupResponse.data.data?.upload_type,
      uuid: imageGroupResponse.data.data?.uuid
    });
    
    if (!imageGroupResponse.data.success) {
      console.error('❌ 图片组保存失败');
      return;
    }
    
    // 2. 更新smile_test表的test_status
    console.log('\n📝 步骤2: 更新smile_test表的test_status...');
    
    const statusResponse = await axios.put(`${BASE_URL}/api/smile-test/uuid/${smileTestUuid}`, {
      test_status: 'completed'
    });
    
    console.log('✅ 状态更新响应:', {
      success: statusResponse.data.success,
      message: statusResponse.data.message
    });
    
    // 3. 验证文件列表
    console.log('\n📋 步骤3: 验证文件列表...');
    
    const listResponse = await axios.get(`${BASE_URL}/api/smile-test-files/smile-test/${smileTestUuid}`);
    
    console.log('✅ 文件列表响应:', {
      success: listResponse.data.success,
      message: listResponse.data.message,
      fileCount: listResponse.data.data?.length || 0
    });
    
    if (listResponse.data.success && listResponse.data.data) {
      console.log('\n📋 所有文件:');
      listResponse.data.data.forEach((file, index) => {
        console.log(`${index + 1}. ${file.file_name} (${file.upload_type}) - ${file.uuid}`);
        console.log(`   smile_test_uuid: ${file.smile_test_uuid}`);
        console.log(`   上传时间: ${file.upload_time || file.created_at}`);
      });
      
      // 检查是否有正确的微笑测试图片组
      const smileTestGroup = listResponse.data.data.find(file => 
        file.upload_type === 'smile_test' && 
        file.file_name === '微笑测试图片组' &&
        file.smile_test_uuid === smileTestUuid
      );
      
      if (smileTestGroup) {
        console.log('\n✅ 验证成功：找到正确的微笑测试图片组');
      } else {
        console.log('\n❌ 验证失败：没有找到正确的微笑测试图片组');
      }
    }
    
  } catch (error) {
    console.log('❌ 测试错误:', error.response?.data || error.message);
  }
}

async function main() {
  await testUploadCompleteFlow();
}

main().catch(console.error);
