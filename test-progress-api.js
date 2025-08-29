const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testProgressAPI() {
  console.log('🔍 测试修改后的进度更新API接口...\n');

  // 测试用的患者UUID（从数据库中选择不同进度的患者）
  const testPatients = [
    {
      uuid: 'c4628bd4-75fc-11f0-a571-306e96a67f88',
      name: '医生穿件',
      currentProgress: 6,
      description: '当前进度为6（治疗完成）'
    },
    {
      uuid: 'ab35a3fe-71c3-11f0-9281-dc0dad3b22f5',
      name: '张雅婷',
      currentProgress: 4,
      description: '当前进度为4（生产完成）'
    },
    {
      uuid: 'c626b2b4-75fd-11f0-a571-306e96a67f88',
      name: '123123kj',
      currentProgress: 1,
      description: '当前进度为1（预约完成）'
    },
    {
      uuid: '7c757bbe-75fd-11f0-a571-306e96a67f88',
      name: '12',
      currentProgress: null,
      description: '当前进度为NULL'
    }
  ];

  for (const patient of testPatients) {
    console.log(`📋 测试患者: ${patient.name}`);
    console.log(`   UUID: ${patient.uuid}`);
    console.log(`   ${patient.description}`);
    console.log('');

    try {
      // 测试1：尝试将进度更新为1
      console.log('   测试1: 尝试将进度更新为1');
      const response1 = await axios.put(`${API_BASE_URL}/api/smile-test/patient/${patient.uuid}/progress`, {
        progress: 1
      });
      
      if (response1.data.success) {
        console.log('   ✅ 成功: 进度已更新为1');
        console.log(`   响应: ${JSON.stringify(response1.data)}`);
      } else {
        console.log('   ❌ 失败: 不允许更新');
        console.log(`   响应: ${JSON.stringify(response1.data)}`);
      }
    } catch (error) {
      if (error.response) {
        console.log('   ❌ 失败: 不允许更新');
        console.log(`   响应: ${JSON.stringify(error.response.data)}`);
      } else {
        console.log('   ❌ 请求失败:', error.message);
      }
    }

    console.log('');

    try {
      // 测试2：尝试将进度更新为2（应该总是成功）
      console.log('   测试2: 尝试将进度更新为2');
      const response2 = await axios.put(`${API_BASE_URL}/api/smile-test/patient/${patient.uuid}/progress`, {
        progress: 2
      });
      
      if (response2.data.success) {
        console.log('   ✅ 成功: 进度已更新为2');
        console.log(`   响应: ${JSON.stringify(response2.data)}`);
      } else {
        console.log('   ❌ 失败: 不允许更新');
        console.log(`   响应: ${JSON.stringify(response2.data)}`);
      }
    } catch (error) {
      if (error.response) {
        console.log('   ❌ 失败: 不允许更新');
        console.log(`   响应: ${JSON.stringify(error.response.data)}`);
      } else {
        console.log('   ❌ 请求失败:', error.message);
      }
    }

    console.log('');

    try {
      // 测试3：尝试将进度更新为1（再次测试，现在进度应该是2）
      console.log('   测试3: 再次尝试将进度更新为1（当前进度应该是2）');
      const response3 = await axios.put(`${API_BASE_URL}/api/smile-test/patient/${patient.uuid}/progress`, {
        progress: 1
      });
      
      if (response3.data.success) {
        console.log('   ✅ 成功: 进度已更新为1');
        console.log(`   响应: ${JSON.stringify(response3.data)}`);
      } else {
        console.log('   ❌ 失败: 不允许更新');
        console.log(`   响应: ${JSON.stringify(response3.data)}`);
      }
    } catch (error) {
      if (error.response) {
        console.log('   ❌ 失败: 不允许更新');
        console.log(`   响应: ${JSON.stringify(error.response.data)}`);
      } else {
        console.log('   ❌ 请求失败:', error.message);
      }
    }

    console.log('='.repeat(60));
    console.log('');
  }

  console.log('🎯 测试总结:');
  console.log('✅ 当 progress = 1 时：');
  console.log('   - 如果当前进度 > 1，应该返回错误，不允许重置');
  console.log('   - 如果当前进度 ≤ 1 或为空，应该允许更新');
  console.log('✅ 当 progress ≠ 1 时：');
  console.log('   - 应该正常更新，不受限制');
  console.log('✅ 错误响应应该包含详细信息：');
  console.log('   - 当前进度');
  console.log('   - 请求的进度');
  console.log('   - 错误原因');
}

// 检查服务是否运行
async function checkService() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/smile-test`);
    console.log('✅ 服务正在运行');
    return true;
  } catch (error) {
    console.log('❌ 服务未运行，请先启动后端服务');
    console.log('   运行命令: npm run start:dev');
    return false;
  }
}

async function main() {
  const isRunning = await checkService();
  if (!isRunning) {
    return;
  }
  
  await testProgressAPI();
}

main().catch(console.error);
