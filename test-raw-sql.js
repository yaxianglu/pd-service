const mysql = require('mysql2/promise');

const config = {
  host: 'localhost',
  user: 'root',
  password: 'Shein@123',
  database: 'pd',
  charset: 'utf8mb4'
};

async function testRawSQL() {
  let connection;
  
  try {
    console.log('🔍 使用原始SQL查询验证数据...');
    
    connection = await mysql.createConnection(config);
    
    const smileTestUuid = 'b0af75af-ccb4-4a51-894a-8e8a11a4a193';
    
    // 使用原始SQL查询
    console.log('\n📋 原始SQL查询结果:');
    const [rows] = await connection.execute(`
      SELECT 
        uuid, 
        smile_test_uuid, 
        file_name, 
        upload_type, 
        upload_time,
        created_at,
        updated_at
      FROM smile_test_files 
      WHERE smile_test_uuid = ?
      ORDER BY created_at DESC
    `, [smileTestUuid]);
    
    console.log(`找到 ${rows.length} 条记录:`);
    rows.forEach((row, index) => {
      console.log(`${index + 1}. UUID: ${row.uuid}`);
      console.log(`   smile_test_uuid: ${row.smile_test_uuid}`);
      console.log(`   file_name: ${row.file_name}`);
      console.log(`   upload_type: ${row.upload_type}`);
      console.log(`   upload_time: ${row.upload_time}`);
      console.log(`   created_at: ${row.created_at}`);
      console.log(`   updated_at: ${row.updated_at}`);
      console.log('');
    });
    
    // 检查特定记录
    const specificUuid = '6161c98f-42d5-4417-b373-0a39baa69fbe';
    console.log(`\n📋 检查特定记录 ${specificUuid}:`);
    const [specificRows] = await connection.execute(`
      SELECT 
        uuid, 
        smile_test_uuid, 
        file_name, 
        upload_type, 
        upload_time,
        created_at,
        updated_at
      FROM smile_test_files 
      WHERE uuid = ?
    `, [specificUuid]);
    
    if (specificRows.length > 0) {
      const row = specificRows[0];
      console.log(`UUID: ${row.uuid}`);
      console.log(`smile_test_uuid: ${row.smile_test_uuid}`);
      console.log(`file_name: ${row.file_name}`);
      console.log(`upload_type: ${row.upload_type}`);
      console.log(`upload_time: ${row.upload_time}`);
      console.log(`created_at: ${row.created_at}`);
      console.log(`updated_at: ${row.updated_at}`);
      
      if (row.smile_test_uuid === smileTestUuid) {
        console.log('✅ 数据库中的smile_test_uuid字段是正确的！');
      } else {
        console.log('❌ 数据库中的smile_test_uuid字段不正确！');
      }
    } else {
      console.log('❌ 没有找到指定UUID的记录');
    }
    
  } catch (error) {
    console.error('❌ SQL查询错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testRawSQL().catch(console.error);
