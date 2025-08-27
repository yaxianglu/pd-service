// 测试TypeScript编译
const { exec } = require('child_process');

console.log('🔍 测试TypeScript编译...');

exec('npx tsc --noEmit', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ TypeScript编译错误:');
    console.error(stderr);
    process.exit(1);
  }
  
  if (stderr) {
    console.warn('⚠️ TypeScript警告:');
    console.warn(stderr);
  }
  
  console.log('✅ TypeScript编译成功');
  console.log('📝 输出:', stdout);
  
  console.log('\n🎉 所有实体类和模块编译成功！');
  console.log('\n📝 下一步:');
  console.log('1. 启动服务: npm run start:dev');
  console.log('2. 测试API接口');
});