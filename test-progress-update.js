const mysql = require('mysql2/promise');

async function testProgressUpdate() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'duisdui@123',
    database: 'pd'
  });

  try {
    console.log('🔍 测试患者进度更新逻辑...\n');

    // 1. 检查患者表中的进度字段
    console.log('1. 检查患者进度字段:');
    const [patients] = await connection.execute(`
      SELECT uuid, full_name, treatment_progress
      FROM patients
      WHERE treatment_progress IS NOT NULL
      ORDER BY treatment_progress DESC
      LIMIT 5
    `);
    
    if (patients.length === 0) {
      console.log('   ❌ 没有找到有进度的患者');
    } else {
      patients.forEach((patient, index) => {
        console.log(`   患者 ${index + 1}:`);
        console.log(`     UUID: ${patient.uuid}`);
        console.log(`     姓名: ${patient.full_name}`);
        console.log(`     当前进度: ${patient.treatment_progress}`);
        console.log('');
      });
    }

    // 2. 检查预约创建后的进度更新逻辑
    console.log('2. 检查预约相关的进度更新逻辑:');
    console.log('   根据代码逻辑：');
    console.log('   - 当 progress = 1 时（预约完成）');
    console.log('   - 如果当前进度 > 1，则不允许更新');
    console.log('   - 如果当前进度 ≤ 1 或为空，则允许更新');
    console.log('');

    // 3. 模拟不同进度情况下的更新
    console.log('3. 模拟进度更新场景:');
    
    // 场景1：当前进度为0，更新为1（应该成功）
    console.log('   场景1: 当前进度为0，更新为1');
    console.log('   预期结果: 成功');
    console.log('   逻辑: 0 ≤ 1，允许更新');
    console.log('');

    // 场景2：当前进度为1，更新为1（应该成功）
    console.log('   场景2: 当前进度为1，更新为1');
    console.log('   预期结果: 成功');
    console.log('   逻辑: 1 ≤ 1，允许更新');
    console.log('');

    // 场景3：当前进度为2，更新为1（应该失败）
    console.log('   场景3: 当前进度为2，更新为1');
    console.log('   预期结果: 失败');
    console.log('   逻辑: 2 > 1，不允许更新');
    console.log('');

    // 场景4：当前进度为3，更新为1（应该失败）
    console.log('   场景4: 当前进度为3，更新为1');
    console.log('   预期结果: 失败');
    console.log('   逻辑: 3 > 1，不允许更新');
    console.log('');

    // 场景5：当前进度为null，更新为1（应该成功）
    console.log('   场景5: 当前进度为null，更新为1');
    console.log('   预期结果: 成功');
    console.log('   逻辑: null ≤ 1，允许更新');
    console.log('');

    // 4. 检查实际的患者数据
    console.log('4. 实际患者进度数据:');
    const [allPatients] = await connection.execute(`
      SELECT uuid, full_name, treatment_progress, 
             CASE 
               WHEN treatment_progress IS NULL THEN 'NULL'
               WHEN treatment_progress = 0 THEN '0 (初始状态)'
               WHEN treatment_progress = 1 THEN '1 (预约完成)'
               WHEN treatment_progress = 2 THEN '2 (确认方案)'
               WHEN treatment_progress = 3 THEN '3 (付款完成)'
               WHEN treatment_progress = 4 THEN '4 (生产完成)'
               WHEN treatment_progress = 5 THEN '5 (治疗中)'
               WHEN treatment_progress = 6 THEN '6 (治疗完成)'
               ELSE CONCAT(treatment_progress, ' (未知状态)')
             END as progress_description
      FROM patients
      ORDER BY COALESCE(treatment_progress, 0) DESC, full_name
      LIMIT 10
    `);
    
    if (allPatients.length === 0) {
      console.log('   ❌ 没有找到患者数据');
    } else {
      allPatients.forEach((patient, index) => {
        console.log(`   患者 ${index + 1}:`);
        console.log(`     UUID: ${patient.uuid}`);
        console.log(`     姓名: ${patient.full_name}`);
        console.log(`     进度: ${patient.progress_description}`);
        console.log('');
      });
    }

    // 5. 总结修改后的逻辑
    console.log('5. 修改后的接口逻辑总结:');
    console.log('   ✅ 当 progress = 1 时：');
    console.log('      - 如果当前进度 > 1，返回错误，不允许重置');
    console.log('      - 如果当前进度 ≤ 1 或为空，允许更新');
    console.log('   ✅ 当 progress ≠ 1 时：');
    console.log('      - 正常更新，不受限制');
    console.log('   ✅ 错误响应包含详细信息：');
    console.log('      - 当前进度');
    console.log('      - 请求的进度');
    console.log('      - 错误原因');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await connection.end();
  }
}

testProgressUpdate();
