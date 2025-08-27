const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testDownloadFilename() {
  try {
    console.log('🧪 测试下载文件名格式...');
    
    const smileTestUuid = 'b0af75af-ccb4-4a51-894a-8e8a11a4a193';
    
    // 1. 先获取文件列表
    console.log('\n📋 获取文件列表...');
    const listResponse = await axios.get(`${BASE_URL}/api/smile-test-files/smile-test/${smileTestUuid}`);
    
    if (!listResponse.data.success) {
      console.error('❌ 获取文件列表失败');
      return;
    }
    
    console.log(`✅ 找到 ${listResponse.data.data.length} 个文件`);
    
    // 2. 找到微笑测试图片组
    const smileTestGroup = listResponse.data.data.find(file => 
      file.upload_type === 'smile_test' && 
      file.file_name === '微笑测试图片组'
    );
    
    if (!smileTestGroup) {
      console.log('❌ 没有找到微笑测试图片组');
      return;
    }
    
    console.log('✅ 找到微笑测试图片组:', {
      uuid: smileTestGroup.uuid,
      upload_time: smileTestGroup.upload_time,
      created_at: smileTestGroup.created_at
    });
    
    // 3. 测试下载（只获取响应头，不下载文件内容）
    console.log('\n📥 测试下载文件名...');
    try {
      const downloadResponse = await axios.get(`${BASE_URL}/api/smile-test-files/download/${smileTestGroup.uuid}`, {
        responseType: 'stream',
        validateStatus: () => true // 允许任何状态码
      });
      
      console.log('✅ 下载响应状态:', downloadResponse.status);
      
      // 检查Content-Disposition头
      const contentDisposition = downloadResponse.headers['content-disposition'];
      console.log('📋 Content-Disposition:', contentDisposition);
      
      if (contentDisposition) {
        // 解析文件名
        const filenameMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/);
        if (filenameMatch) {
          const encodedFilename = filenameMatch[1];
          const filename = decodeURIComponent(encodedFilename);
          console.log('📁 解析的文件名:', filename);
          
          // 检查文件名格式
          if (filename.match(/^微笑测试_\d{4}-\d{2}-\d{2}\.zip$/)) {
            console.log('✅ 文件名格式正确！');
          } else {
            console.log('❌ 文件名格式不正确');
          }
        } else {
          console.log('❌ 无法解析文件名');
        }
      } else {
        console.log('❌ 没有找到Content-Disposition头');
      }
      
    } catch (error) {
      console.error('❌ 下载测试失败:', error.message);
    }
    
  } catch (error) {
    console.error('❌ 测试错误:', error.response?.data || error.message);
  }
}

testDownloadFilename().catch(console.error);
