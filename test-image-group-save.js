const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testImageGroupSave() {
  try {
    console.log('🧪 测试image-group接口的保存过程...');
    
    const smileTestUuid = 'b0af75af-ccb4-4a51-894a-8e8a11a4a193';
    
    // 创建一个简单的测试图片数据
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    // 模拟4张照片的数据
    const photos = [
      { step: 1, url: testImageData },
      { step: 2, url: testImageData },
      { step: 3, url: testImageData },
      { step: 4, url: testImageData }
    ];
    
    console.log('📝 测试参数:');
    console.log(`📝 smile_test_uuid: ${smileTestUuid}`);
    console.log(`📝 照片数量: ${photos.length}`);
    
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
    
    console.log('\n📦 发送的图片组数据:', {
      imageCount: imageGroup.images.length,
      photo1Length: imageGroup.images[0]?.data?.length || 0,
      photo2Length: imageGroup.images[1]?.data?.length || 0,
      photo3Length: imageGroup.images[2]?.data?.length || 0,
      photo4Length: imageGroup.images[3]?.data?.length || 0
    });
    
    // 调用image-group接口
    console.log('\n📤 调用image-group接口...');
    const response = await axios.post(`${BASE_URL}/api/smile-test-files/smile-test/${smileTestUuid}/image-group`, {
      image_group: imageGroup
    });
    
    console.log('✅ 接口响应:', {
      success: response.data.success,
      message: response.data.message,
      fileName: response.data.data?.file_name,
      uploadType: response.data.data?.upload_type,
      uuid: response.data.data?.uuid,
      uploadTime: response.data.data?.upload_time
    });
    
    if (!response.data.success) {
      console.error('❌ 接口调用失败');
      return;
    }
    
    // 立即查询保存的文件
    console.log('\n📋 立即查询保存的文件...');
    const queryResponse = await axios.get(`${BASE_URL}/api/smile-test-files/smile-test/${smileTestUuid}`);
    
    console.log('✅ 查询响应:', {
      success: queryResponse.data.success,
      message: queryResponse.data.message,
      fileCount: queryResponse.data.data?.length || 0
    });
    
    if (queryResponse.data.success && queryResponse.data.data) {
      console.log('\n📋 文件列表详情:');
      queryResponse.data.data.forEach((file, index) => {
        console.log(`${index + 1}. ${file.file_name} (${file.upload_type})`);
        console.log(`   UUID: ${file.uuid}`);
        console.log(`   smile_test_uuid: ${file.smile_test_uuid}`);
        console.log(`   上传时间: ${file.upload_time || file.created_at}`);
        console.log(`   状态: ${file.status}`);
        console.log('');
      });
      
      // 检查是否有微笑测试图片组
      const smileTestGroup = queryResponse.data.data.find(file => 
        file.upload_type === 'smile_test' && 
        file.file_name === '微笑测试图片组'
      );
      
      if (smileTestGroup) {
        console.log('✅ 找到微笑测试图片组:', {
          uuid: smileTestGroup.uuid,
          smile_test_uuid: smileTestGroup.smile_test_uuid,
          upload_time: smileTestGroup.upload_time
        });
        
        if (smileTestGroup.smile_test_uuid === smileTestUuid) {
          console.log('✅ smile_test_uuid字段正确！');
        } else {
          console.log('❌ smile_test_uuid字段不正确！');
          console.log(`   期望: ${smileTestUuid}`);
          console.log(`   实际: ${smileTestGroup.smile_test_uuid}`);
        }
      } else {
        console.log('❌ 没有找到微笑测试图片组');
      }
    }
    
  } catch (error) {
    console.error('❌ 测试错误:', error.response?.data || error.message);
  }
}

testImageGroupSave().catch(console.error);
