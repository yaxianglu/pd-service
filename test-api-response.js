const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testApiResponse() {
  try {
    console.log('🧪 测试API返回的数据...');
    
    const smileTestUuid = 'b0af75af-ccb4-4a51-894a-8e8a11a4a193';
    
    // 测试获取文件列表API
    console.log('\n📋 测试获取文件列表API...');
    const response = await axios.get(`${BASE_URL}/api/smile-test-files/smile-test/${smileTestUuid}`);
    
    console.log('✅ API响应状态:', response.status);
    console.log('✅ API响应数据:', {
      success: response.data.success,
      message: response.data.message,
      fileCount: response.data.data?.length || 0
    });
    
    if (response.data.success && response.data.data) {
      console.log('\n📋 文件列表详情:');
      response.data.data.forEach((file, index) => {
        console.log(`${index + 1}. ${file.file_name} (${file.upload_type})`);
        console.log(`   UUID: ${file.uuid}`);
        console.log(`   smile_test_uuid: ${file.smile_test_uuid}`);
        console.log(`   上传时间: ${file.upload_time || file.created_at}`);
        console.log(`   状态: ${file.status}`);
        console.log('');
      });
      
      // 检查是否有微笑测试图片组
      const smileTestGroup = response.data.data.find(file => 
        file.upload_type === 'smile_test' && 
        file.file_name === '微笑测试图片组'
      );
      
      if (smileTestGroup) {
        console.log('✅ 找到微笑测试图片组:', {
          uuid: smileTestGroup.uuid,
          smile_test_uuid: smileTestGroup.smile_test_uuid,
          upload_time: smileTestGroup.upload_time
        });
      } else {
        console.log('❌ 没有找到微笑测试图片组');
      }
      
      // 检查所有微笑测试文件
      const smileTestFiles = response.data.data.filter(file => file.upload_type === 'smile_test');
      console.log(`\n📊 微笑测试文件数量: ${smileTestFiles.length}`);
      smileTestFiles.forEach((file, index) => {
        console.log(`${index + 1}. ${file.file_name} - ${file.uuid}`);
      });
    }
    
  } catch (error) {
    console.error('❌ API测试错误:', error.response?.data || error.message);
  }
}

testApiResponse().catch(console.error);
