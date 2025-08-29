const fs = require('fs');
const path = require('path');

// 旧密码和新密码
const OLD_PASSWORD = 'duisdui@123';
const NEW_PASSWORD = 'duisdui@123';

// 需要检查的文件扩展名
const FILE_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.json', '.env', '.env.local', '.env.development'];

function updatePasswordInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // 检查是否包含旧密码
    if (content.includes(OLD_PASSWORD)) {
      console.log(`🔍 在文件 ${filePath} 中找到旧密码`);
      
      // 替换密码
      content = content.replace(new RegExp(OLD_PASSWORD.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), NEW_PASSWORD);
      hasChanges = true;
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 已更新文件: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ 处理文件 ${filePath} 时出错:`, error.message);
    return false;
  }
}

function updatePasswordInDirectory(dir) {
  const files = fs.readdirSync(dir);
  let totalUpdated = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // 递归处理子目录
      totalUpdated += updatePasswordInDirectory(filePath);
    } else if (FILE_EXTENSIONS.some(ext => file.endsWith(ext))) {
      // 处理指定扩展名的文件
      if (updatePasswordInFile(filePath)) {
        totalUpdated++;
      }
    }
  });
  
  return totalUpdated;
}

// 开始更新
console.log('🔍 开始更新MySQL密码...');
console.log(`旧密码: ${OLD_PASSWORD}`);
console.log(`新密码: ${NEW_PASSWORD}`);
console.log('');

// 更新当前目录及子目录
const currentDir = __dirname;
console.log(`检查目录: ${currentDir}`);
const updatedCount = updatePasswordInDirectory(currentDir);

console.log('');
console.log(`✅ 密码更新完成！共更新了 ${updatedCount} 个文件`);
console.log('');
console.log('⚠️  请注意：');
console.log('1. 确保MySQL服务器已更新密码');
console.log('2. 重启后端服务以使用新密码');
console.log('3. 测试数据库连接是否正常');
