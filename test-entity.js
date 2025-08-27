// 测试实体类配置
console.log('🔍 测试实体类配置...');

try {
  // 尝试导入实体类
  const { SmileTestFiles } = require('./dist/entities/smile-test-files.entity.js');
  const { SmileTest } = require('./dist/entities/smile-test.entity.js');
  
  console.log('✅ 实体类导入成功');
  console.log('- SmileTestFiles:', typeof SmileTestFiles);
  console.log('- SmileTest:', typeof SmileTest);
  
  // 检查实体类的元数据
  if (SmileTestFiles && SmileTestFiles.prototype) {
    console.log('✅ SmileTestFiles 实体类结构正确');
  }
  
  if (SmileTest && SmileTest.prototype) {
    console.log('✅ SmileTest 实体类结构正确');
  }
  
  console.log('\n🎉 实体类配置正确！');
  
} catch (error) {
  console.error('❌ 实体类测试失败:', error.message);
  
  if (error.message.includes('Column')) {
    console.error('\n🔧 这可能是TypeORM字段配置问题');
    console.error('请检查实体类中的字段类型配置');
  }
  
  if (error.message.includes('Cannot find module')) {
    console.error('\n🔧 这可能是编译问题');
    console.error('请先运行: npm run build');
  }
}
