const crypto = require('crypto');

// 测试密码
const password = 'P@rlD1g1t@l2024!';
const storedHash = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';

// 计算哈希
const inputHash = crypto.createHash('sha256').update(password).digest('hex');

console.log('原始密码:', password);
console.log('计算的哈希:', inputHash);
console.log('存储的哈希:', storedHash);
console.log('匹配结果:', inputHash === storedHash);

// 测试数据库格式
const dbPassword = `hashed_${storedHash}`;
console.log('数据库中的密码格式:', dbPassword);

// 模拟后端验证逻辑
if (dbPassword.startsWith('hashed_')) {
  const hash = dbPassword.replace('hashed_', '');
  console.log('提取的哈希:', hash);
  console.log('验证结果:', hash === inputHash);
} 