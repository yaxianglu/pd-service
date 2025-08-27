const mysql = require('mysql2/promise');

// 数据库配置
const config = {
  host: 'localhost',
  user: 'root',
  password: 'Shein@123',
  database: 'pd',
  charset: 'utf8mb4'
};

async function checkSmileTestData() {
  let connection;
  try {
    console.log('🔍 检查数据库中的微笑测试数据...');
    connection = await mysql.createConnection(config);
    
    const smileTestUuid = '30772a78-1a74-4601-b61a-341ac6ba02fa';
    
    // 查询smile_test表
    const [rows] = await connection.execute(`
      SELECT 
        uuid,
        teeth_image_1,
        teeth_image_2,
        teeth_image_3,
        teeth_image_4,
        allergies,
        created_at,
        updated_at
      FROM smile_test 
      WHERE uuid = ?
    `, [smileTestUuid]);
    
    if (rows.length === 0) {
      console.log('❌ 没有找到对应的微笑测试记录');
      return;
    }
    
    const record = rows[0];
    console.log('✅ 找到微笑测试记录:');
    console.log('UUID:', record.uuid);
    console.log('创建时间:', record.created_at);
    console.log('更新时间:', record.updated_at);
    
    // 检查teeth_image字段
    console.log('\n📸 检查teeth_image字段:');
    ['teeth_image_1', 'teeth_image_2', 'teeth_image_3', 'teeth_image_4'].forEach(field => {
      const value = record[field];
      const hasData = value && value.length > 0;
      console.log(`${field}: ${hasData ? '有数据' : '无数据'} ${hasData ? `(${value.length} 字符)` : ''}`);
    });
    
    // 检查allergies字段
    console.log('\n📄 检查allergies字段:');
    if (record.allergies) {
      console.log('allergies: 有数据', `(${record.allergies.length} 字符)`);
      try {
        const parsed = JSON.parse(record.allergies);
        console.log('allergies JSON解析成功:', {
          name: parsed.name,
          type: parsed.type,
          dataLength: parsed.data ? parsed.data.length : 0
        });
      } catch (error) {
        console.log('allergies JSON解析失败:', error.message);
      }
    } else {
      console.log('allergies: 无数据');
    }
    
    // 检查smile_test_files表
    console.log('\n📁 检查smile_test_files表:');
    const [fileRows] = await connection.execute(`
      SELECT 
        uuid,
        file_name,
        upload_type,
        status,
        created_at
      FROM smile_test_files 
      WHERE smile_test_uuid = ?
    `, [smileTestUuid]);
    
    if (fileRows.length === 0) {
      console.log('smile_test_files表: 没有找到文件记录');
    } else {
      console.log(`smile_test_files表: 找到 ${fileRows.length} 条文件记录`);
      fileRows.forEach((file, index) => {
        console.log(`${index + 1}. ${file.file_name} (${file.upload_type}) - ${file.uuid} - ${file.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 数据库查询失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 开始检查数据库数据...\n');
  
  await checkSmileTestData();
  
  console.log('\n📝 检查完成');
}

main().catch(console.error);
