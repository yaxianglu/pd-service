const crypto = require('crypto');

// 计算所有密码的正确哈希值
const passwords = [
  'Kj9#mN2$pQ7@vX5&hL8!',           // 超级管理员
  'pearl_admin_2025',                // 销售账号
  'Dr7#kP9$mN2@vX5&hL8!',           // 医生账号
  'Ad5#nM8$pQ2@vX7&hL9!'            // 普通管理员
];

console.log('密码哈希值计算:');
console.log('================');

passwords.forEach((password, index) => {
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  console.log(`${index + 1}. 密码: ${password}`);
  console.log(`   哈希值: ${hash}`);
  console.log(`   数据库格式: hashed_${hash}`);
  console.log('');
});

// 验证你提供的密码
const testPassword = 'pearl_admin_2025';
const testHash = crypto.createHash('sha256').update(testPassword).digest('hex');
console.log('验证 pearl_admin_2025:');
console.log('期望哈希值: fb320648615b631191815ef7eb0627366dc459002c697df06911bb7fa6cf3cb5');
console.log('实际哈希值:', testHash);
console.log('是否匹配:', testHash === 'fb320648615b631191815ef7eb0627366dc459002c697df06911bb7fa6cf3cb5'); 