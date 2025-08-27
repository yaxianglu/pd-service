const mysql = require('mysql2/promise');

// 数据库配置
const config = {
  host: 'localhost',
  user: 'root',
  password: 'Shein@123',
  database: 'pd',
  charset: 'utf8mb4'
};

async function fixNullUuids() {
  let connection;
  try {
    console.log('🔧 开始修复null UUID...');
    connection = await mysql.createConnection(config);

    // 1. 查找所有UUID为null的记录
    const [nullUuidRecords] = await connection.execute(`
      SELECT id, file_name, upload_type, created_at 
      FROM smile_test_files 
      WHERE uuid IS NULL OR uuid = ''
    `);

    console.log(`📊 找到 ${nullUuidRecords.length} 条UUID为null的记录:`);
    nullUuidRecords.forEach(record => {
      console.log(`  - ID: ${record.id}, 文件名: ${record.file_name}, 类型: ${record.upload_type}`);
    });

    if (nullUuidRecords.length === 0) {
      console.log('✅ 没有找到UUID为null的记录');
      return;
    }

    // 2. 为每条记录生成新的UUID
    const { v4: uuidv4 } = require('uuid');
    
    for (const record of nullUuidRecords) {
      const newUuid = uuidv4();
      
      await connection.execute(`
        UPDATE smile_test_files 
        SET uuid = ? 
        WHERE id = ?
      `, [newUuid, record.id]);
      
      console.log(`✅ 修复记录 ID: ${record.id}, 新UUID: ${newUuid}`);
    }

    // 3. 验证修复结果
    const [remainingNullRecords] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM smile_test_files 
      WHERE uuid IS NULL OR uuid = ''
    `);

    console.log(`📊 修复后，剩余null UUID记录: ${remainingNullRecords[0].count}`);

    if (remainingNullRecords[0].count === 0) {
      console.log('✅ 所有null UUID已修复完成');
    } else {
      console.log('⚠️  仍有null UUID记录未修复');
    }

  } catch (error) {
    console.error('❌ 修复null UUID失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 开始修复null UUID...\n');
  await fixNullUuids();
  console.log('\n📝 修复完成');
}

main().catch(console.error);
