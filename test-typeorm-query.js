const { DataSource } = require('typeorm');
const { SmileTestFiles } = require('./dist/entities/smile-test-files.entity');

const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'duisdui@123',
  database: 'pd',
  charset: 'utf8mb4',
  synchronize: false,
  logging: true,
  entities: [SmileTestFiles],
});

async function testTypeORMQuery() {
  try {
    console.log('🔍 测试TypeORM查询...');
    
    await AppDataSource.initialize();
    console.log('✅ 数据库连接成功');
    
    const smileTestFilesRepo = AppDataSource.getRepository(SmileTestFiles);
    const smileTestUuid = 'b0af75af-ccb4-4a51-894a-8e8a11a4a193';
    
    // 测试查询
    console.log('\n📋 测试TypeORM查询...');
    const files = await smileTestFilesRepo.find({
      where: { 
        smile_test_uuid: smileTestUuid, 
        status: 'normal' 
      },
      order: { upload_time: 'DESC' }
    });
    
    console.log(`✅ 找到 ${files.length} 个文件`);
    
    files.forEach((file, index) => {
      console.log(`${index + 1}. ${file.file_name} (${file.upload_type})`);
      console.log(`   UUID: ${file.uuid}`);
      console.log(`   smile_test_uuid: ${file.smile_test_uuid}`);
      console.log(`   上传时间: ${file.upload_time}`);
      console.log(`   状态: ${file.status}`);
      console.log('');
    });
    
    // 检查特定文件
    const specificFile = await smileTestFilesRepo.findOne({
      where: { uuid: '6161c98f-42d5-4417-b373-0a39baa69fbe' }
    });
    
    if (specificFile) {
      console.log('✅ 特定文件详情:');
      console.log(`   UUID: ${specificFile.uuid}`);
      console.log(`   smile_test_uuid: ${specificFile.smile_test_uuid}`);
      console.log(`   file_name: ${specificFile.file_name}`);
      console.log(`   upload_type: ${specificFile.upload_type}`);
    }
    
  } catch (error) {
    console.error('❌ TypeORM查询错误:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

testTypeORMQuery().catch(console.error);
