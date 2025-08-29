const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testFixedProgressAPI() {
  console.log('🔍 测试修复后的进度更新API接口...\n');

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
      currentProgress: 1,
      description: '当前进度为1（预约完成）'
    },
    {
      uuid: '7c757bbe-75fd-11f0-a571-306e96a67f88',
      name: '12',
      currentProgress: null,
      description: '当前进度为NULL（待预约）'
    }
  ];

  for (const patient of testPatients) {
    console.log(`📋 测试患者: ${patient.name}`);
    console.log(`   UUID: ${patient.uuid}`);
    console.log(`   ${patient.description}`);
    console.log('');

    try {
      // 测试1：尝试将进度更新为1（预约完成）
      console.log('   测试1: 尝试将进度更新为1（预约完成）');
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
      // 测试2：尝试将进度更新为2（确认方案）
      console.log('   测试2: 尝试将进度更新为2（确认方案）');
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
      // 测试3：再次尝试将进度更新为1（预约完成）
      console.log('   测试3: 再次尝试将进度更新为1（预约完成）');
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
  console.log('✅ 修复后的逻辑：');
  console.log('   - 只有在"待预约"状态下，才能更新为"预约完成"（progress: 1）');
  console.log('   - 如果当前进度 > 0，则不允许重置为预约完成状态');
  console.log('   - 其他进度更新不受限制，可以正常推进或回退');
  console.log('');
  console.log('✅ 预期结果：');
  console.log('   - 待预约患者（进度为0或NULL）：可以更新为预约完成');
  console.log('   - 预约完成患者（进度为1）：可以重复设置为预约完成');
  console.log('   - 高级进度患者（进度>1）：不能重置为预约完成');
  console.log('');
  console.log('✅ 错误响应包含详细信息：');
  console.log('   - 当前进度和状态');
  console.log('   - 请求的进度和状态');
  console.log('   - 明确的错误原因');
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
  
  await testFixedProgressAPI();
}

main().catch(console.error);
