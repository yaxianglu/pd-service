const mysql = require('mysql2/promise');

// 数据库配置
const config = {
  host: 'localhost',
  user: 'root',
  password: 'Shein@123',
  database: 'pd',
  charset: 'utf8mb4'
};

async function checkUuidColumn() {
  let connection;
  try {
    console.log('🔍 检查UUID字段结构...');
    connection = await mysql.createConnection(config);

    // 检查smile_test_files表的UUID字段
    const [columns] = await connection.execute(`
      DESCRIBE smile_test_files
    `);

    console.log('📊 smile_test_files表结构:');
    columns.forEach(col => {
      if (col.Field === 'uuid') {
        console.log(`  UUID字段: ${col.Field}`);
        console.log(`    类型: ${col.Type}`);
        console.log(`    长度: ${col.Type.match(/\((\d+)\)/)?.[1] || 'N/A'}`);
        console.log(`    是否为空: ${col.Null}`);
        console.log(`    默认值: ${col.Default}`);
      }
    });

    // 检查smile_test表的UUID字段
    const [smileTestColumns] = await connection.execute(`
      DESCRIBE smile_test
    `);

    console.log('\n📊 smile_test表UUID字段:');
    smileTestColumns.forEach(col => {
      if (col.Field === 'uuid') {
        console.log(`  UUID字段: ${col.Field}`);
        console.log(`    类型: ${col.Type}`);
        console.log(`    长度: ${col.Type.match(/\((\d+)\)/)?.[1] || 'N/A'}`);
        console.log(`    是否为空: ${col.Null}`);
        console.log(`    默认值: ${col.Default}`);
      }
    });

    // 测试一个legacy UUID的长度
    const testLegacyUuid = 'legacy_30772a78-1a74-4601-b61a-341ac6ba02fa_allergies';
    console.log(`\n📏 测试legacy UUID长度: ${testLegacyUuid.length} 字符`);
    console.log(`UUID内容: ${testLegacyUuid}`);

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 开始检查UUID字段...\n');
  await checkUuidColumn();
  console.log('\n📝 检查完成');
}

main().catch(console.error);
