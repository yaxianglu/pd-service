const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testFrontendDownload() {
  try {
    console.log('🧪 模拟前端下载逻辑测试...');
    
    const smileTestUuid = 'b0af75af-ccb4-4a51-894a-8e8a11a4a193';
    
    // 1. 获取文件列表
    console.log('\n📋 获取文件列表...');
    const listResponse = await axios.get(`${BASE_URL}/api/smile-test-files/smile-test/${smileTestUuid}`);
    
    if (!listResponse.data.success) {
      console.error('❌ 获取文件列表失败');
      return;
    }
    
    // 2. 找到最新的微笑测试图片组
    const smileTestFiles = listResponse.data.data.filter(file => 
      file.upload_type === 'smile_test' && 
      file.file_name === '微笑测试图片组'
    );
    
    if (smileTestFiles.length === 0) {
      console.log('❌ 没有找到微笑测试图片组');
      return;
    }
    
    const latestFile = smileTestFiles[0]; // 最新的文件
    console.log('✅ 找到最新文件:', {
      uuid: latestFile.uuid,
      file_name: latestFile.file_name,
      upload_time: latestFile.upload_time
    });
    
    // 3. 模拟前端下载逻辑
    console.log('\n📥 模拟前端下载逻辑...');
    const downloadResponse = await axios.get(`${BASE_URL}/api/smile-test-files/download/${latestFile.uuid}`, {
      responseType: 'stream',
      validateStatus: () => true
    });
    
    console.log('✅ 下载响应状态:', downloadResponse.status);
    
    // 4. 检查响应头
    const contentDisposition = downloadResponse.headers['content-disposition'];
    console.log('📋 Content-Disposition:', contentDisposition);
    
    // 5. 模拟前端文件名解析逻辑
    let filename = null;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/);
      if (filenameMatch) {
        filename = decodeURIComponent(filenameMatch[1]);
        console.log('✅ 解析的文件名:', filename);
      } else {
        console.log('❌ 无法解析文件名');
      }
    } else {
      console.log('❌ 没有Content-Disposition头');
    }
    
    // 6. 检查文件名格式
    if (filename) {
      if (filename.match(/^微笑测试_\d{4}-\d{2}-\d{2}\.zip$/)) {
        console.log('✅ 文件名格式正确！');
        console.log('📁 最终下载文件名:', filename);
      } else {
        console.log('❌ 文件名格式不正确');
        console.log('📁 实际文件名:', filename);
      }
    }
    
    // 7. 检查Content-Type
    const contentType = downloadResponse.headers['content-type'];
    console.log('📋 Content-Type:', contentType);
    
  } catch (error) {
    console.error('❌ 测试错误:', error.response?.data || error.message);
  }
}

testFrontendDownload().catch(console.error);

