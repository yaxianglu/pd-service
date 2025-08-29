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

async function checkSmileTestFilesConsistency() {
  let localConnection, remoteConnection;
  
  try {
    console.log('🔍 开始检查两个环境的 smile-test-files 表一致性...\n');
    
    // 连接两个数据库
    console.log('1. 连接数据库...');
    localConnection = await mysql.createConnection(localConfig);
    console.log('   ✅ 本地数据库连接成功');
    
    remoteConnection = await mysql.createConnection(remoteConfig);
    console.log('   ✅ 远程数据库连接成功');
    console.log('');

    // 2. 检查表是否存在
    console.log('2. 检查表是否存在...');
    
    const [localTables] = await localConnection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'pd' AND TABLE_NAME = 'smile_test_files'
    `);
    
    const [remoteTables] = await remoteConnection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'pd' AND TABLE_NAME = 'smile_test_files'
    `);
    
    if (localTables.length === 0) {
      console.log('   ❌ 本地数据库中没有 smile-test-files 表');
      return;
    }
    
    if (remoteTables.length === 0) {
      console.log('   ❌ 远程数据库中没有 smile-test-files 表');
      return;
    }
    
    console.log('   ✅ 两个环境都存在 smile-test-files 表');
    console.log('');

    // 3. 比较表结构
    console.log('3. 比较表结构...');
    
    const [localColumns] = await localConnection.execute(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT,
        CHARACTER_MAXIMUM_LENGTH,
        NUMERIC_PRECISION,
        NUMERIC_SCALE,
        COLUMN_KEY,
        EXTRA,
        COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'pd' AND TABLE_NAME = 'smile_test_files'
      ORDER BY ORDINAL_POSITION
    `);
    
    const [remoteColumns] = await remoteConnection.execute(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT,
        CHARACTER_MAXIMUM_LENGTH,
        NUMERIC_PRECISION,
        NUMERIC_SCALE,
        COLUMN_KEY,
        EXTRA,
        COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'pd' AND TABLE_NAME = 'smile_test_files'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('   本地表结构:');
    localColumns.forEach(col => {
      console.log(`     ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'} ${col.COLUMN_COMMENT ? `(${col.COLUMN_COMMENT})` : ''}`);
    });
    
    console.log('');
    console.log('   远程表结构:');
    remoteColumns.forEach(col => {
      console.log(`     ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'} ${col.COLUMN_COMMENT ? `(${col.COLUMN_COMMENT})` : ''}`);
    });
    
    // 检查列数是否一致
    if (localColumns.length !== remoteColumns.length) {
      console.log(`\n   ❌ 列数不一致: 本地 ${localColumns.length} 列, 远程 ${remoteColumns.length} 列`);
    } else {
      console.log(`\n   ✅ 列数一致: ${localColumns.length} 列`);
    }
    
    // 检查每列是否一致
    const structureDifferences = [];
    const maxColumns = Math.max(localColumns.length, remoteColumns.length);
    
    for (let i = 0; i < maxColumns; i++) {
      const localCol = localColumns[i];
      const remoteCol = remoteColumns[i];
      
      if (!localCol || !remoteCol) {
        structureDifferences.push({
          column: i,
          local: localCol ? localCol.COLUMN_NAME : 'MISSING',
          remote: remoteCol ? remoteCol.COLUMN_NAME : 'MISSING',
          difference: 'Column missing in one environment'
        });
        continue;
      }
      
      if (localCol.COLUMN_NAME !== remoteCol.COLUMN_NAME ||
          localCol.DATA_TYPE !== remoteCol.DATA_TYPE ||
          localCol.IS_NULLABLE !== remoteCol.IS_NULLABLE ||
          localCol.COLUMN_DEFAULT !== remoteCol.COLUMN_DEFAULT ||
          localCol.CHARACTER_MAXIMUM_LENGTH !== remoteCol.CHARACTER_MAXIMUM_LENGTH ||
          localCol.NUMERIC_PRECISION !== remoteCol.NUMERIC_PRECISION ||
          localCol.NUMERIC_SCALE !== remoteCol.NUMERIC_SCALE ||
          localCol.COLUMN_KEY !== remoteCol.COLUMN_KEY ||
          localCol.EXTRA !== remoteCol.EXTRA) {
        
        structureDifferences.push({
          column: localCol.COLUMN_NAME,
          local: `${localCol.DATA_TYPE} ${localCol.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'} ${localCol.COLUMN_DEFAULT || 'NO DEFAULT'}`,
          remote: `${remoteCol.DATA_TYPE} ${remoteCol.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'} ${remoteCol.COLUMN_DEFAULT || 'NO DEFAULT'}`,
          difference: 'Structure differs'
        });
      }
    }
    
    if (structureDifferences.length === 0) {
      console.log('   ✅ 表结构完全一致');
    } else {
      console.log(`\n   ❌ 发现 ${structureDifferences.length} 个结构差异:`);
      structureDifferences.forEach(diff => {
        console.log(`     列: ${diff.column}`);
        console.log(`       本地: ${diff.local}`);
        console.log(`       远程: ${diff.remote}`);
        console.log(`       差异: ${diff.difference}`);
        console.log('');
      });
    }
    
    console.log('');

    // 4. 比较索引
    console.log('4. 比较索引...');
    
    const [localIndexes] = await localConnection.execute(`
      SELECT 
        INDEX_NAME,
        COLUMN_NAME,
        NON_UNIQUE,
        SEQ_IN_INDEX,
        COLLATION,
        CARDINALITY,
        SUB_PART,
        PACKED,
        NULLABLE,
        INDEX_TYPE,
        COMMENT
      FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = 'pd' AND TABLE_NAME = 'smile_test_files'
      ORDER BY INDEX_NAME, SEQ_IN_INDEX
    `);
    
    const [remoteIndexes] = await remoteConnection.execute(`
      SELECT 
        INDEX_NAME,
        COLUMN_NAME,
        NON_UNIQUE,
        SEQ_IN_INDEX,
        COLLATION,
        CARDINALITY,
        SUB_PART,
        PACKED,
        NULLABLE,
        INDEX_TYPE,
        COMMENT
      FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = 'pd' AND TABLE_NAME = 'smile_test_files'
      ORDER BY INDEX_NAME, SEQ_IN_INDEX
    `);
    
    console.log(`   本地索引数量: ${localIndexes.length}`);
    console.log(`   远程索引数量: ${remoteIndexes.length}`);
    
    if (localIndexes.length === remoteIndexes.length) {
      console.log('   ✅ 索引数量一致');
    } else {
      console.log('   ❌ 索引数量不一致');
    }
    
    console.log('');

    // 5. 比较数据量
    console.log('5. 比较数据量...');
    
    const [localCount] = await localConnection.execute(`
      SELECT COUNT(*) as count FROM smile_test_files
    `);
    
    const [remoteCount] = await remoteConnection.execute(`
      SELECT COUNT(*) as count FROM smile_test_files
    `);
    
    console.log(`   本地数据量: ${localCount[0].count} 条`);
    console.log(`   远程数据量: ${remoteCount[0].count} 条`);
    
    if (localCount[0].count === remoteCount[0].count) {
      console.log('   ✅ 数据量一致');
    } else {
      console.log('   ❌ 数据量不一致');
    }
    
    console.log('');

    // 6. 比较样本数据
    console.log('6. 比较样本数据...');
    
    const [localSample] = await localConnection.execute(`
      SELECT * FROM smile_test_files LIMIT 3
    `);
    
    const [remoteSample] = await remoteConnection.execute(`
      SELECT * FROM smile_test_files LIMIT 3
    `);
    
    console.log('   本地样本数据:');
    localSample.forEach((row, index) => {
      console.log(`     记录 ${index + 1}:`);
      Object.entries(row).forEach(([key, value]) => {
        if (typeof value === 'string' && value.length > 100) {
          console.log(`       ${key}: ${value.substring(0, 100)}... (截断)`);
        } else {
          console.log(`       ${key}: ${value}`);
        }
      });
      console.log('');
    });
    
    console.log('   远程样本数据:');
    remoteSample.forEach((row, index) => {
      console.log(`     记录 ${index + 1}:`);
      Object.entries(row).forEach(([key, value]) => {
        if (typeof value === 'string' && value.length > 100) {
          console.log(`       ${key}: ${value.substring(0, 100)}... (截断)`);
        } else {
          console.log(`       ${key}: ${value}`);
        }
      });
      console.log('');
    });

    // 7. 总结
    console.log('7. 一致性检查总结:');
    
    const hasStructureDiff = structureDifferences.length > 0;
    const hasCountDiff = localCount[0].count !== remoteCount[0].count;
    
    if (!hasStructureDiff && !hasCountDiff) {
      console.log('   🎉 两个环境的 smile-test-files 表完全一致！');
    } else {
      console.log('   ⚠️  发现不一致的地方:');
      if (hasStructureDiff) {
        console.log(`      - 表结构差异: ${structureDifferences.length} 个`);
      }
      if (hasCountDiff) {
        console.log(`      - 数据量差异: 本地 ${localCount[0].count} vs 远程 ${remoteCount[0].count}`);
      }
      console.log('   建议: 同步两个环境的表结构和数据');
    }

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    console.error('错误详情:', error);
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

checkSmileTestFilesConsistency();
