import { createConnection } from 'typeorm';

async function fixAllergiesField() {
  console.log('🔄 开始修复allergies字段...');
  
  const connection = await createConnection({
    type: 'mysql',
    host: 'pd-db-new.cgbiaakssebs.us-east-1.rds.amazonaws.com',
    port: 3306,
    username: 'henrycao',
    password: 'Pearl#89$Hc!',
    database: 'pd',
  });

  try {
    console.log('✅ 数据库连接成功');

    // 检查当前字段状态
    console.log('\n📋 检查当前allergies字段状态...');
    const currentField = await connection.query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        COLUMN_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        CHARACTER_SET_NAME,
        COLLATION_NAME
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'pd' 
        AND TABLE_NAME = 'smile_test' 
        AND COLUMN_NAME = 'allergies'
    `);
    console.log('当前字段状态:', currentField);

    // 修改字段为LONGTEXT
    console.log('\n🔧 修改allergies字段为LONGTEXT...');
    await connection.query(`
      ALTER TABLE smile_test 
      MODIFY COLUMN allergies LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL 
      COMMENT '过敏史/大文件数据存储-支持200MB'
    `);
    console.log('✅ 字段修改完成');

    // 验证修改结果
    console.log('\n✨ 验证修改结果...');
    const newField = await connection.query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        COLUMN_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        CHARACTER_SET_NAME,
        COLLATION_NAME,
        COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'pd' 
        AND TABLE_NAME = 'smile_test' 
        AND COLUMN_NAME = 'allergies'
    `);
    console.log('修改后字段状态:', newField);

    // 检查MySQL配置
    console.log('\n⚙️ 检查MySQL配置...');
    const settings = await connection.query(`
      SHOW VARIABLES WHERE Variable_name IN (
        'max_allowed_packet',
        'wait_timeout',
        'interactive_timeout'
      )
    `);
    console.log('MySQL设置:', settings);

    // 成功结果验证
    const field = newField[0];
    if (field.DATA_TYPE === 'longtext' && field.CHARACTER_MAXIMUM_LENGTH === 4294967295) {
      console.log('\n🎉 修复成功！allergies字段现在支持4GB数据');
      console.log('✅ 可以处理200MB文件了');
    } else {
      console.log('\n⚠️ 修复可能未完全成功，请检查字段状态');
    }

  } catch (error) {
    console.error('❌ 执行过程中出错:', error.message);
    if (error.code) {
      console.error('错误代码:', error.code);
    }
  } finally {
    await connection.close();
    console.log('\n🔌 数据库连接已关闭');
  }
}

// 执行修复
fixAllergiesField().catch(console.error);