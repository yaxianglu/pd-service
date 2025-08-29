const mysql = require('mysql2/promise');

// 数据库配置
const config = {
  host: 'localhost',
  user: 'root',
  password: 'duisdui@123',
  database: 'pd',
  charset: 'utf8mb4'
};

async function updateUuidColumn() {
  let connection;
  try {
    console.log('🔧 开始更新UUID字段长度...');
    connection = await mysql.createConnection(config);

    // 1. 检查当前UUID字段长度
    const [columns] = await connection.execute(`
      DESCRIBE smile_test_files
    `);

    const uuidColumn = columns.find(col => col.Field === 'uuid');
    if (uuidColumn) {
      console.log(`📊 当前UUID字段长度: ${uuidColumn.Type}`);
    }

    // 2. 修改UUID字段长度为100
    console.log('🔄 修改UUID字段长度为100...');
    await connection.execute(`
      ALTER TABLE smile_test_files 
      MODIFY COLUMN uuid VARCHAR(100) NULL UNIQUE
    `);

    console.log('✅ UUID字段长度更新成功');

    // 3. 验证更新结果
    const [updatedColumns] = await connection.execute(`
      DESCRIBE smile_test_files
    `);

    const updatedUuidColumn = updatedColumns.find(col => col.Field === 'uuid');
    if (updatedUuidColumn) {
      console.log(`📊 更新后UUID字段长度: ${updatedUuidColumn.Type}`);
    }

    // 4. 测试legacy UUID是否可以插入
    const testLegacyUuid = 'legacy_30772a78-1a74-4601-b61a-341ac6ba02fa_allergies';
    console.log(`\n🧪 测试legacy UUID长度: ${testLegacyUuid.length} 字符`);
    console.log(`UUID内容: ${testLegacyUuid}`);

    if (testLegacyUuid.length <= 100) {
      console.log('✅ Legacy UUID长度在允许范围内');
    } else {
      console.log('❌ Legacy UUID长度超出范围');
    }

  } catch (error) {
    console.error('❌ 更新UUID字段失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 开始更新UUID字段...\n');
  await updateUuidColumn();
  console.log('\n📝 更新完成');
}

main().catch(console.error);
