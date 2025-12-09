const mysql = require('mysql2/promise');

// 数据库配置 - 使用远程数据库（与 database.config.ts 中的配置一致）
const dbConfig = {
  host: 'pd-db-new.cgbiaakssebs.us-east-1.rds.amazonaws.com',
  user: 'henrycao',
  password: 'Pearl#89$Hc!',
  database: 'pd',
  port: 3306,
  charset: 'utf8mb4'
};

async function migrateTeethType() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('🔍 检查当前 teeth_type 字段类型...');
    
    // 检查当前字段类型
    const [rows] = await connection.execute(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        COLUMN_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'pd' 
        AND TABLE_NAME = 'smile_test' 
        AND COLUMN_NAME = 'teeth_type'
    `);
    
    if (rows.length === 0) {
      console.log('❌ 未找到 teeth_type 字段');
      return;
    }
    
    const field = rows[0];
    console.log('当前字段信息:', {
      type: field.DATA_TYPE,
      columnType: field.COLUMN_TYPE,
      maxLength: field.CHARACTER_MAXIMUM_LENGTH,
      comment: field.COLUMN_COMMENT
    });
    
    // 检查是否已经是 LONGTEXT
    if (field.DATA_TYPE === 'longtext') {
      console.log('✅ 字段类型已经是 LONGTEXT，无需修改');
      return;
    }
    
    // 检查现有数据
    console.log('📊 检查现有数据...');
    const [dataRows] = await connection.execute(`
      SELECT COUNT(*) as count, 
             COUNT(DISTINCT teeth_type) as distinct_values,
             GROUP_CONCAT(DISTINCT teeth_type SEPARATOR ', ') as sample_values
      FROM smile_test 
      WHERE teeth_type IS NOT NULL
      LIMIT 1
    `);
    
    if (dataRows.length > 0) {
      const stats = dataRows[0];
      console.log('数据统计:', {
        有数据的记录数: stats.count,
        不同值的数量: stats.distinct_values,
        示例值: stats.sample_values ? stats.sample_values.substring(0, 100) : '无'
      });
    }
    
    // 步骤1: 删除索引（如果存在）
    console.log('🔧 步骤1: 删除 teeth_type 字段上的索引（如果存在）...');
    try {
      await connection.execute(`
        ALTER TABLE smile_test 
        DROP INDEX idx_teeth_type
      `);
      console.log('✅ 索引删除成功');
    } catch (error) {
      if (error.message.includes('Unknown key') || error.message.includes('check that it exists')) {
        console.log('ℹ️  索引不存在，跳过删除步骤');
      } else {
        throw error;
      }
    }
    
    // 步骤2: 修改字段类型
    console.log('🔧 步骤2: 修改字段类型为 LONGTEXT...');
    await connection.execute(`
      ALTER TABLE smile_test 
      MODIFY COLUMN teeth_type LONGTEXT NULL COMMENT '牙齿类型（支持多选，用逗号分隔）'
    `);
    
    console.log('✅ 字段类型修改成功！');
    
    // 验证修改结果
    console.log('🔍 验证修改结果...');
    const [newRows] = await connection.execute(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        COLUMN_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'pd' 
        AND TABLE_NAME = 'smile_test' 
        AND COLUMN_NAME = 'teeth_type'
    `);
    
    if (newRows.length > 0) {
      const newField = newRows[0];
      console.log('✅ 修改后字段信息:', {
        type: newField.DATA_TYPE,
        columnType: newField.COLUMN_TYPE,
        maxLength: newField.CHARACTER_MAXIMUM_LENGTH,
        comment: newField.COLUMN_COMMENT
      });
    }
    
    console.log('\n🎉 迁移完成！teeth_type 字段现在支持多选（用逗号分隔存储）');
    
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    console.error('错误详情:', error);
    throw error;
  } finally {
    await connection.end();
    console.log('🔐 数据库连接已关闭');
  }
}

// 执行迁移
migrateTeethType()
  .then(() => {
    console.log('\n✅ 迁移脚本执行完成！现在可以重启后端服务了。');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 迁移失败:', error);
    process.exit(1);
  });

