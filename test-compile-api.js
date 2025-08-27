const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 检查API相关文件...');

// 检查必要的文件是否存在
const requiredFiles = [
  'src/smile-test-files/smile-test-files.controller.ts',
  'src/smile-test-files/smile-test-files.service.ts',
  'src/smile-test-files/smile-test-files.module.ts',
  'src/entities/smile-test-files.entity.ts',
  'src/app.module.ts'
];

console.log('\n📁 检查文件存在性:');
for (const file of requiredFiles) {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
}

// 检查app.module.ts是否导入了SmileTestFilesModule
console.log('\n📋 检查模块导入:');
try {
  const appModuleContent = fs.readFileSync('src/app.module.ts', 'utf8');
  const hasImport = appModuleContent.includes('SmileTestFilesModule');
  const hasInImports = appModuleContent.includes('SmileTestFilesModule,');
  
  console.log(`✅ SmileTestFilesModule 导入: ${hasImport ? '是' : '否'}`);
  console.log(`✅ SmileTestFilesModule 在imports数组中: ${hasInImports ? '是' : '否'}`);
  
  if (!hasImport || !hasInImports) {
    console.log('⚠️  需要修复app.module.ts中的模块导入');
  }
} catch (error) {
  console.log('❌ 无法读取app.module.ts:', error.message);
}

// 检查TypeScript编译
console.log('\n🔧 检查TypeScript编译:');
try {
  const result = execSync('npx tsc --noEmit --skipLibCheck', { 
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log('✅ TypeScript编译检查通过');
} catch (error) {
  console.log('❌ TypeScript编译错误:');
  console.log(error.stdout || error.stderr);
}

console.log('\n📝 检查完成');
