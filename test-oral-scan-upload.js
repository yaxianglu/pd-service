const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 测试配置
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const SMILE_TEST_UUID = '1acfa40c-dfd3-46ac-807d-9af800c2e7a4'; // 你提到的UUID

// 创建测试文件
function createTestFile(sizeInMB) {
  const sizeInBytes = sizeInMB * 1024 * 1024;
  const buffer = Buffer.alloc(sizeInBytes, 'A'); // 填充'A'字符
  return buffer.toString('base64');
}

// 测试不同大小的文件上传
async function testFileUpload(fileSizeInMB) {
  console.log(`\n🧪 测试 ${fileSizeInMB}MB 文件上传...`);
  
  try {
    // 创建测试数据
    const testData = createTestFile(fileSizeInMB);
    const dataUrl = `data:image/jpeg;base64,${testData}`;
    
    console.log(`📊 文件信息:`);
    console.log(`   - 原始大小: ${fileSizeInMB}MB`);
    console.log(`   - Base64大小: ${Math.round(dataUrl.length / 1024 / 1024)}MB`);
    console.log(`   - 预计解码后大小: ${Math.round((dataUrl.length * 3) / 4 / 1024 / 1024)}MB`);
    
    const startTime = Date.now();
    
    // 发送请求
    const response = await axios.post(
      `${API_BASE_URL}/api/smile-test-files/smile-test/${SMILE_TEST_UUID}/oral-scan`,
      {
        file_data: dataUrl,
        file_name: `test_${fileSizeInMB}mb.jpg`,
        file_type: 'image/jpeg'
      },
      {
        timeout: 300000, // 5分钟超时
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`✅ 上传成功!`);
    console.log(`   - 响应时间: ${duration.toFixed(2)}秒`);
    console.log(`   - 响应数据:`, response.data);
    
    return true;
  } catch (error) {
    console.log(`❌ 上传失败!`);
    if (error.response) {
      console.log(`   - 状态码: ${error.response.status}`);
      console.log(`   - 错误信息: ${error.response.data?.message || error.response.statusText}`);
      console.log(`   - 响应数据:`, error.response.data);
    } else if (error.request) {
      console.log(`   - 网络错误: ${error.message}`);
    } else {
      console.log(`   - 其他错误: ${error.message}`);
    }
    return false;
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试 oral-scan 文件上传...');
  console.log(`📍 API地址: ${API_BASE_URL}`);
  console.log(`📍 测试UUID: ${SMILE_TEST_UUID}`);
  
  // 测试不同大小的文件
  const testSizes = [1, 5, 10, 20, 50, 100, 150, 200]; // MB
  
  const results = [];
  
  for (const size of testSizes) {
    const success = await testFileUpload(size);
    results.push({ size, success });
    
    // 等待一下再进行下一个测试
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // 输出测试结果汇总
  console.log('\n📋 测试结果汇总:');
  console.log('=====================================');
  results.forEach(result => {
    const status = result.success ? '✅ 成功' : '❌ 失败';
    console.log(`${result.size.toString().padStart(3)}MB: ${status}`);
  });
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  console.log(`\n📊 成功率: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`);
  
  // 找出最大成功上传的文件大小
  const maxSuccessfulSize = Math.max(...results.filter(r => r.success).map(r => r.size));
  console.log(`🏆 最大成功上传文件大小: ${maxSuccessfulSize}MB`);
}

// 运行测试
runTests().catch(console.error);
