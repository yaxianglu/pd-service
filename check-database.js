const mysql = require('mysql2/promise');

// 数据库配置
const localConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Shein@123',
  database: 'pd',
  charset: 'utf8mb4'
};

const remoteConfig = {
  host: 'pd-db-new.cgbiaakssebs.us-east-1.rds.amazonaws.com',
  user: 'henrycao',
  password: 'Pearl#89$Hc!',
  database: 'pd',
  charset: 'utf8mb4'
};

async function checkDatabase(config, dbName) {
  let connection;
  try {
    console.log(`\n🔍 检查 ${dbName} 数据库状态...`);
    connection = await mysql.createConnection(config);
    
    // 检查 smile_test_files 表是否存在
    const [tables] = await connection.execute(`
      SELECT 
        TABLE_NAME,
        TABLE_COMMENT
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'pd' 
        AND TABLE_NAME = 'smile_test_files'
    `);
    
    if (tables.length > 0) {
      console.log(`✅ ${dbName} smile_test_files 表存在: ${tables[0].TABLE_NAME} - ${tables[0].TABLE_COMMENT}`);
      
      // 检查表结构
      const [columns] = await connection.execute(`
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          IS_NULLABLE,
          COLUMN_DEFAULT,
          COLUMN_COMMENT
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'pd' 
          AND TABLE_NAME = 'smile_test_files'
        ORDER BY ORDINAL_POSITION
      `);
      
      console.log(`📊 ${dbName} 表字段信息:`);
      columns.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'} ${col.COLUMN_DEFAULT ? `DEFAULT ${col.COLUMN_DEFAULT}` : ''} ${col.COLUMN_COMMENT ? `(${col.COLUMN_COMMENT})` : ''}`);
      });
      
      // 检查 smile_test 表的 uuid 字段类型
      const [uuidColumns] = await connection.execute(`
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          CHARACTER_MAXIMUM_LENGTH
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'pd' 
          AND TABLE_NAME = 'smile_test'
          AND COLUMN_NAME = 'uuid'
      `);
      
      if (uuidColumns.length > 0) {
        const uuidCol = uuidColumns[0];
        console.log(`📊 ${dbName} smile_test.uuid 字段类型: ${uuidCol.DATA_TYPE}(${uuidCol.CHARACTER_MAXIMUM_LENGTH})`);
      }
      
    } else {
      console.log(`❌ ${dbName} smile_test_files 表不存在`);
    }
    
  } catch (error) {
    console.error(`❌ ${dbName} 检查失败:`, error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function main() {
  console.log('🚀 检查数据库状态...');
  
  // 检查本地数据库
  await checkDatabase(localConfig, '本地数据库 (localhost)');
  
  // 检查远程数据库
  await checkDatabase(remoteConfig, '远程数据库 (AWS RDS)');
  
  console.log('\n📝 分析结果:');
  console.log('1. 如果表不存在，需要重新创建');
  console.log('2. 如果字段类型不匹配，需要修改');
  console.log('3. 如果一切正常，可以启动服务');
}

main().catch(console.error);
