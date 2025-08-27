const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testHistoryDisplay() {
  try {
    console.log('🧪 测试历史资料显示逻辑...');
    
    const smileTestUuid = 'b0af75af-ccb4-4a51-894a-8e8a11a4a193';
    
    console.log(`📝 获取文件列表: ${smileTestUuid}`);
    
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
        console.log(`   上传时间: ${file.upload_time || file.created_at}`);
        console.log(`   状态: ${file.status}`);
      });
      
      // 模拟患者用户（只显示微笑测试图片）
      console.log('\n👤 患者用户看到的文件:');
      const patientFiles = response.data.data.filter(file => file.upload_type === 'smile_test');
      patientFiles.forEach((file, index) => {
        console.log(`${index + 1}. ${file.file_name} (${file.upload_type}) - ${file.uuid}`);
      });
      
      // 模拟医生用户（显示所有文件）
      console.log('\n👨‍⚕️ 医生用户看到的文件:');
      response.data.data.forEach((file, index) => {
        console.log(`${index + 1}. ${file.file_name} (${file.upload_type}) - ${file.uuid}`);
      });
      
      // 检查是否有微笑测试图片组
      const smileTestGroup = response.data.data.find(file => 
        file.upload_type === 'smile_test' && 
        file.file_name === '微笑测试图片组'
      );
      
      if (smileTestGroup) {
        console.log('\n✅ 找到微笑测试图片组:', {
          uuid: smileTestGroup.uuid,
          fileName: smileTestGroup.file_name,
          uploadTime: smileTestGroup.upload_time,
          status: smileTestGroup.status
        });
      } else {
        console.log('\n❌ 没有找到微笑测试图片组');
      }
    }
    
  } catch (error) {
    console.log('❌ 测试错误:', error.response?.data || error.message);
  }
}

async function testDownloadImageGroup() {
  try {
    console.log('\n🧪 测试下载图片组...');
    
    const smileTestUuid = 'b0af75af-ccb4-4a51-894a-8e8a11a4a193';
    
    // 先获取文件列表
    const listResponse = await axios.get(`${BASE_URL}/api/smile-test-files/smile-test/${smileTestUuid}`);
    
    const imageGroup = listResponse.data.data?.find(f => 
      f.upload_type === 'smile_test' && 
      f.file_name === '微笑测试图片组'
    );
    
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
  await testHistoryDisplay();
  await testDownloadImageGroup();
}

main().catch(console.error);
