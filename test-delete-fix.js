const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testDeleteLegacyFile() {
  try {
    console.log('🧪 测试删除legacy文件...');
    
    const legacyUuid = 'legacy_30772a78-1a74-4601-b61a-341ac6ba02fa_teeth_images_group';
    
    console.log(`📝 尝试删除: ${legacyUuid}`);
    
    const response = await axios.delete(`${BASE_URL}/api/smile-test-files/${legacyUuid}`);
    
    console.log('✅ 响应:', response.data);
    
  } catch (error) {
    console.log('❌ 错误响应:', error.response?.data || error.message);
  }
}

async function testDeleteNormalFile() {
  try {
    console.log('\n🧪 测试删除正常文件...');
    
    // 先获取文件列表
    const listResponse = await axios.get(`${BASE_URL}/api/smile-test-files/smile-test/30772a78-1a74-4601-b61a-341ac6ba02fa`);
    
    console.log('📋 文件列表:', listResponse.data);
    
    // 找到第一个非legacy文件
    const normalFile = listResponse.data.data?.find(file => !file.uuid.startsWith('legacy_'));
    
    if (normalFile) {
      console.log(`📝 尝试删除正常文件: ${normalFile.uuid}`);
      
      const deleteResponse = await axios.delete(`${BASE_URL}/api/smile-test-files/${normalFile.uuid}`);
      
      console.log('✅ 删除响应:', deleteResponse.data);
    } else {
      console.log('⚠️ 没有找到正常文件进行测试');
    }
    
  } catch (error) {
    console.log('❌ 错误响应:', error.response?.data || error.message);
  }
}

async function main() {
  await testDeleteLegacyFile();
  await testDeleteNormalFile();
}

main().catch(console.error);
