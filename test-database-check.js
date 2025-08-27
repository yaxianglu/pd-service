const mysql = require('mysql2/promise');

const config = {
  host: 'localhost',
  user: 'root',
  password: 'Shein@123',
  database: 'pd',
  charset: 'utf8mb4'
};

async function checkDatabase() {
  let connection;
  
  try {
    console.log('🔍 检查数据库中的数据...');
    
    connection = await mysql.createConnection(config);
    
    // 1. 检查smile_test_files表中的最新记录
    console.log('\n📋 检查smile_test_files表中的最新记录:');
    const [filesRows] = await connection.execute(`
      SELECT 
        uuid, 
        smile_test_uuid, 
        file_name, 
        upload_type, 
        upload_time,
        created_at,
        updated_at
      FROM smile_test_files 
      WHERE smile_test_uuid = 'b0af75af-ccb4-4a51-894a-8e8a11a4a193'
      ORDER BY created_at DESC
    `);
    
    console.log(`找到 ${filesRows.length} 条记录:`);
    filesRows.forEach((row, index) => {
      console.log(`${index + 1}. UUID: ${row.uuid}`);
      console.log(`   smile_test_uuid: ${row.smile_test_uuid}`);
      console.log(`   file_name: ${row.file_name}`);
      console.log(`   upload_type: ${row.upload_type}`);
      console.log(`   upload_time: ${row.upload_time}`);
      console.log(`   created_at: ${row.created_at}`);
      console.log(`   updated_at: ${row.updated_at}`);
      console.log('');
    });
    
    // 2. 检查smile_test表中的记录
    console.log('\n📋 检查smile_test表中的记录:');
    const [smileTestRows] = await connection.execute(`
      SELECT 
        uuid, 
        test_status,
        created_at,
        updated_at
      FROM smile_test 
      WHERE uuid = 'b0af75af-ccb4-4a51-894a-8e8a11a4a193'
    `);
    
    if (smileTestRows.length > 0) {
      const row = smileTestRows[0];
      console.log(`UUID: ${row.uuid}`);
      console.log(`test_status: ${row.test_status}`);
      console.log(`created_at: ${row.created_at}`);
      console.log(`updated_at: ${row.updated_at}`);
    } else {
      console.log('❌ 没有找到对应的smile_test记录');
    }
    
    // 3. 检查所有smile_test_files记录
    console.log('\n📋 检查所有smile_test_files记录:');
    const [allFilesRows] = await connection.execute(`
      SELECT 
        uuid, 
        smile_test_uuid, 
        file_name, 
        upload_type, 
        upload_time,
        created_at
      FROM smile_test_files 
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    console.log(`最近10条记录:`);
    allFilesRows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.file_name} (${row.upload_type})`);
      console.log(`   UUID: ${row.uuid}`);
      console.log(`   smile_test_uuid: ${row.smile_test_uuid}`);
      console.log(`   创建时间: ${row.created_at}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ 数据库检查错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabase().catch(console.error);
