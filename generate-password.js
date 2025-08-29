const crypto = require('crypto');

function generatePasswordHash(password) {
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  return `hashed_${hash}`;
}

// 测试不同的密码
const passwords = [
  'admin123',
  'password',
  '123456',
  'admin',
  'henrycao',
  'duisdui@123'
];

console.log('🔍 生成密码哈希...\n');

passwords.forEach(password => {
  const hash = generatePasswordHash(password);
  console.log(`密码: ${password}`);
  console.log(`哈希: ${hash}`);
  console.log('---');
});

// 从数据库中的密码反推可能的原始密码
console.log('\n🔍 分析数据库中的密码哈希...\n');

const dbPasswords = [
  'hashed_8cb71bb8d9e1b...', // henrycao_super_admin
  'hashed_cabb2584d0170...', // henrycao_market_user
  'hashed_45c3562b1113e...', // henrycao_doctor_user
  'hashed_c2b0c06da7c05...', // henrycao_admin_user
];

// 尝试常见的密码组合
const commonPasswords = [
  'admin123',
  'password',
  '123456',
  'admin',
  'henrycao',
  'duisdui@123',
  'henrycao123',
  'admin@123',
  'password123',
  '123456789'
];

console.log('尝试匹配数据库中的密码哈希...\n');

commonPasswords.forEach(password => {
  const hash = generatePasswordHash(password);
  console.log(`密码: ${password} -> ${hash}`);
  
  // 检查是否匹配数据库中的任何密码
  dbPasswords.forEach(dbHash => {
    if (hash.startsWith(dbHash.substring(0, 20))) {
      console.log(`  ✅ 可能匹配: ${dbHash}`);
    }
  });
});
