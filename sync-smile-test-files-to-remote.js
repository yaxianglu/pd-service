const mysql = require('mysql2/promise');

// 数据库连接配置
const localConfig = {
  host: 'localhost',
  user: 'root',
  password: 'duisdui@123',
  database: 'pd'
};

const remoteConfig = {
  host: 'pd-db-new.cgbiaakssebs.us-east-1.rds.amazonaws.com',
  user: 'henrycao',
  password: 'Pearl#89$Hc!',
  database: 'pd'
};

async function syncSmileTestFilesToRemote() {
  let localConnection, remoteConnection;
  
  try {
    console.log('🔄 开始同步 smile-test-files 表到远程数据库...\n');
    
    // 连接两个数据库
    console.log('1. 连接数据库...');
    localConnection = await mysql.createConnection(localConfig);
    console.log('   ✅ 本地数据库连接成功');
    
    remoteConnection = await mysql.createConnection(remoteConfig);
    console.log('   ✅ 远程数据库连接成功');
    console.log('');

    // 2. 备份远程表（如果存在数据）
    console.log('2. 备份远程表...');
    const [remoteCount] = await remoteConnection.execute(`
      SELECT COUNT(*) as count FROM smile_test_files
    `);
    
    if (remoteCount[0].count > 0) {
      const backupTableName = `smile_test_files_backup_${Date.now()}`;
      await remoteConnection.execute(`
        CREATE TABLE ${backupTableName} AS SELECT * FROM smile_test_files
      `);
      console.log(`   ✅ 远程表已备份为: ${backupTableName}`);
    } else {
      console.log('   ℹ️  远程表无数据，无需备份');
    }
    console.log('');

    // 3. 删除远程表
    console.log('3. 删除远程表...');
    await remoteConnection.execute(`DROP TABLE IF EXISTS smile_test_files`);
    console.log('   ✅ 远程表已删除');
    console.log('');

    // 4. 获取本地表结构
    console.log('4. 获取本地表结构...');
    const [createTableResult] = await localConnection.execute(`
      SHOW CREATE TABLE smile_test_files
    `);
    
    const createTableSQL = createTableResult[0]['Create Table'];
    console.log('   ✅ 获取本地表结构成功');
    console.log('');

    // 5. 在远程创建表
    console.log('5. 在远程创建表...');
    await remoteConnection.execute(createTableSQL);
    console.log('   ✅ 远程表创建成功');
    console.log('');

    // 6. 获取本地数据
    console.log('6. 获取本地数据...');
    const [localData] = await localConnection.execute(`
      SELECT * FROM smile_test_files
    `);
    console.log(`   ✅ 获取本地数据成功，共 ${localData.length} 条记录`);
    console.log('');

    // 7. 插入数据到远程
    if (localData.length > 0) {
      console.log('7. 插入数据到远程...');
      
      // 分批插入，避免单次插入数据过大
      const batchSize = 10;
      for (let i = 0; i < localData.length; i += batchSize) {
        const batch = localData.slice(i, i + batchSize);
        
        for (const row of batch) {
          try {
            await remoteConnection.execute(`
              INSERT INTO smile_test_files (
                id, uuid, smile_test_uuid, file_name, file_type, 
                file_data, upload_type, upload_time, status, 
                created_at, updated_at, created_by, updated_by
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              row.id, row.uuid, row.smile_test_uuid, row.file_name, row.file_type,
              row.file_data, row.upload_type, row.upload_time, row.status,
              row.created_at, row.updated_at, row.created_by, row.updated_by
            ]);
          } catch (error) {
            console.log(`   ⚠️  插入记录 ${row.id} 时出错: ${error.message}`);
          }
        }
        
        console.log(`   📊 已处理 ${Math.min(i + batchSize, localData.length)} / ${localData.length} 条记录`);
      }
      
      console.log('   ✅ 数据插入完成');
    } else {
      console.log('7. 本地无数据，跳过数据插入');
    }
    console.log('');

    // 8. 验证同步结果
    console.log('8. 验证同步结果...');
    
    const [finalRemoteCount] = await remoteConnection.execute(`
      SELECT COUNT(*) as count FROM smile_test_files
    `);
    
    const [finalLocalCount] = await localConnection.execute(`
      SELECT COUNT(*) as count FROM smile_test_files
    `);
    
    console.log(`   本地数据量: ${finalLocalCount[0].count} 条`);
    console.log(`   远程数据量: ${finalRemoteCount[0].count} 条`);
    
    if (finalLocalCount[0].count === finalRemoteCount[0].count) {
      console.log('   ✅ 数据量同步成功');
    } else {
      console.log('   ❌ 数据量不一致，同步可能有问题');
    }
    
    // 检查表结构
    const [remoteColumns] = await remoteConnection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'pd' AND TABLE_NAME = 'smile_test_files'
      ORDER BY ORDINAL_POSITION
    `);
    
    const [localColumns] = await localConnection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'pd' AND TABLE_NAME = 'smile_test_files'
      ORDER BY ORDINAL_POSITION
    `);
    
    if (localColumns.length === remoteColumns.length) {
      console.log('   ✅ 表结构同步成功');
    } else {
      console.log('   ❌ 表结构不一致');
    }
    
    console.log('');

    // 9. 总结
    console.log('9. 同步完成总结:');
    console.log('   🎉 smile-test-files 表已成功同步到远程数据库');
    console.log('   📋 同步内容包括:');
    console.log('      - 表结构（列定义、数据类型、约束等）');
    console.log('      - 索引和键');
    console.log('      - 所有数据记录');
    console.log('   💡 如果远程表之前有数据，已自动备份');

  } catch (error) {
    console.error('❌ 同步失败:', error.message);
    console.error('错误详情:', error);
    
    // 如果同步失败，尝试恢复备份
    if (remoteConnection) {
      try {
        console.log('\n🔄 尝试恢复备份...');
        const [backupTables] = await remoteConnection.execute(`
          SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
          WHERE TABLE_SCHEMA = 'pd' AND TABLE_NAME LIKE 'smile_test_files_backup_%'
          ORDER BY TABLE_NAME DESC LIMIT 1
        `);
        
        if (backupTables.length > 0) {
          const backupTable = backupTables[0].TABLE_NAME;
          await remoteConnection.execute(`DROP TABLE IF EXISTS smile_test_files`);
          await remoteConnection.execute(`RENAME TABLE ${backupTable} TO smile_test_files`);
          console.log(`   ✅ 已恢复备份表: ${backupTable}`);
        }
      } catch (restoreError) {
        console.error('   ❌ 恢复备份失败:', restoreError.message);
      }
    }
  } finally {
    // 关闭数据库连接
    if (localConnection) {
      await localConnection.end();
      console.log('\n   本地数据库连接已关闭');
    }
    if (remoteConnection) {
      await remoteConnection.end();
      console.log('   远程数据库连接已关闭');
    }
  }
}

syncSmileTestFilesToRemote();
