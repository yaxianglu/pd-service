const mysql = require('mysql2/promise');

async function fixAllergiesField() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'duisdui@123',
    database: 'pd',
    port: 3306
  });

  try {
    console.log('🔍 检查当前 allergies 字段类型...');
    
    // 检查当前字段类型
    const [rows] = await connection.execute(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'pd' 
        AND TABLE_NAME = 'smile_test' 
        AND COLUMN_NAME = 'allergies'
    `);
    
    if (rows.length > 0) {
      const field = rows[0];
      console.log('当前字段信息:', {
        type: field.DATA_TYPE,
        maxLength: field.CHARACTER_MAXIMUM_LENGTH,
        comment: field.COLUMN_COMMENT
      });
      
      if (field.DATA_TYPE === 'text') {
        console.log('⚠️  字段类型为 TEXT，需要修改为 LONGTEXT');
        
        // 备份现有数据（可选）
        console.log('📊 检查现有数据...');
        const [dataRows] = await connection.execute(`
          SELECT COUNT(*) as count, 
                 MAX(LENGTH(allergies)) as max_length,
                 AVG(LENGTH(allergies)) as avg_length
          FROM smile_test 
          WHERE allergies IS NOT NULL
        `);
        
        if (dataRows.length > 0) {
          const stats = dataRows[0];
          console.log('数据统计:', {
            有数据的记录数: stats.count,
            最大数据长度: stats.max_length,
            平均数据长度: Math.round(stats.avg_length)
          });
        }
        
        // 修改字段类型
        console.log('🔧 修改字段类型为 LONGTEXT...');
        await connection.execute(`
          ALTER TABLE smile_test 
          MODIFY COLUMN allergies LONGTEXT NULL COMMENT '过敏史/文件数据存储'
        `);
        
        console.log('✅ 字段类型修改成功！');
        
        // 验证修改结果
        const [newRows] = await connection.execute(`
          SELECT 
            DATA_TYPE,
            CHARACTER_MAXIMUM_LENGTH
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = 'pd' 
            AND TABLE_NAME = 'smile_test' 
            AND COLUMN_NAME = 'allergies'
        `);
        
        if (newRows.length > 0) {
          const newField = newRows[0];
          console.log('✅ 修改后字段信息:', {
            type: newField.DATA_TYPE,
            maxLength: newField.CHARACTER_MAXIMUM_LENGTH
          });
        }
      } else {
        console.log('✅ 字段类型已经是', field.DATA_TYPE, '，无需修改');
      }
    } else {
      console.log('❌ 未找到 allergies 字段');
    }
    
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    throw error;
  } finally {
    await connection.end();
    console.log('🔐 数据库连接已关闭');
  }
}

// 执行修复
fixAllergiesField()
  .then(() => {
    console.log('🎉 修复完成！现在可以重启应用了。');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 修复失败:', error);
    process.exit(1);
  });