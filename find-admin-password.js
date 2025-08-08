const crypto = require('crypto');

// 数据库中admin用户的密码哈希
const dbHash = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';

// 常见的密码组合
const commonPasswords = [
  'admin',
  'password',
  '123456',
  'admin123',
  'root',
  'test',
  'P@rlD1g1t@l2024!',
  'pearl2024',
  'pearl',
  'digital',
  'pearldigital'
];

console.log('=== 查找admin用户的真实密码 ===');
console.log('数据库中的密码哈希:', dbHash);

for (const password of commonPasswords) {
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  if (hash === dbHash) {
    console.log('✅ 找到匹配的密码:', password);
    console.log('对应的哈希:', hash);
    break;
  } else {
    console.log(`❌ ${password} -> ${hash}`);
  }
}

console.log('\n=== 测试P@rlD1g1t@l2024!密码 ===');
const testPassword = 'P@rlD1g1t@l2024!';
const testHash = crypto.createHash('sha256').update(testPassword).digest('hex');
console.log('密码:', testPassword);
console.log('哈希:', testHash);
console.log('是否匹配:', testHash === dbHash); 