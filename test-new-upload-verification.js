const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testNewUploadVerification() {
  try {
    console.log('🧪 验证新上传的图片组...');
    
    const smileTestUuid = 'b0af75af-ccb4-4a51-894a-8e8a11a4a193';
    
    console.log(`📝 查询UUID: ${smileTestUuid}`);
    
    const response = await axios.get(`${BASE_URL}/api/smile-test-files/smile-test/${smileTestUuid}`);
    
    console.log('✅ 文件列表响应:', {
      success: response.data.success,
      message: response.data.message,
      fileCount: response.data.data?.length || 0
    });
    
    if (response.data.success && response.data.data) {
      console.log('\n📋 所有文件:');
      response.data.data.forEach((file, index) => {
        console.log(`${index + 1}. ${file.file_name} (${file.upload_type}) - ${file.uuid}`);
        console.log(`   smile_test_uuid: ${file.smile_test_uuid}`);
        console.log(`   上传时间: ${file.upload_time || file.created_at}`);
        console.log(`   状态: ${file.status}`);
      });
      
      // 检查是否有正确的微笑测试图片组
      const correctImageGroup = response.data.data.find(file => 
        file.upload_type === 'smile_test' && 
        file.file_name === '微笑测试图片组' &&
        file.smile_test_uuid === smileTestUuid
      );
      
      if (correctImageGroup) {
        console.log('\n✅ 找到正确的微笑测试图片组:', {
          uuid: correctImageGroup.uuid,
          smileTestUuid: correctImageGroup.smile_test_uuid,
          fileName: correctImageGroup.file_name,
          uploadTime: correctImageGroup.upload_time
        });
      } else {
        console.log('\n❌ 没有找到正确的微笑测试图片组');
        
        // 检查是否有错误的图片组
        const wrongImageGroup = response.data.data.find(file => 
          file.upload_type === 'smile_test' && 
          file.file_name === '微笑测试图片组'
        );
        
        if (wrongImageGroup) {
          console.log('⚠️ 找到错误的图片组:', {
            uuid: wrongImageGroup.uuid,
            smileTestUuid: wrongImageGroup.smile_test_uuid,
            expectedUuid: smileTestUuid
          });
        }
      }
    }
    
  } catch (error) {
    console.log('❌ 测试错误:', error.response?.data || error.message);
  }
}

async function testUploadWithCorrectUuid() {
  try {
    console.log('\n🧪 测试使用正确UUID上传图片组...');
    
    const smileTestUuid = 'b0af75af-ccb4-4a51-894a-8e8a11a4a193';
    
    // 创建一个简单的测试图片数据
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    // 创建图片组数据
    const imageGroup = {
      images: [
        {
          index: 1,
          field: 'teeth_image_1',
          data: testImageData
        },
        {
          index: 2,
          field: 'teeth_image_2',
          data: testImageData
        },
        {
          index: 3,
          field: 'teeth_image_3',
          data: testImageData
        },
        {
          index: 4,
          field: 'teeth_image_4',
          data: testImageData
        }
      ]
    };
    
    console.log(`📝 上传图片组到UUID: ${smileTestUuid}`);
    
    const response = await axios.post(`${BASE_URL}/api/smile-test-files/smile-test/${smileTestUuid}/image-group`, {
      image_group: imageGroup
    });
    
    console.log('✅ 图片组上传响应:', {
      success: response.data.success,
      message: response.data.message,
      fileName: response.data.data?.file_name,
      uploadType: response.data.data?.upload_type,
      uuid: response.data.data?.uuid
    });
    
  } catch (error) {
    console.log('❌ 上传错误:', error.response?.data || error.message);
  }
}

async function main() {
  await testNewUploadVerification();
  await testUploadWithCorrectUuid();
}

main().catch(console.error);
