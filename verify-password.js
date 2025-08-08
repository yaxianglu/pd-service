const crypto = require('crypto');

// 测试密码
const password = 'P@rlD1g1t@l2024!';

// 计算SHA256哈希
const hash = crypto.createHash('sha256').update(password).digest('hex');

console.log('原始密码:', password);
console.log('计算的哈希:', hash);
console.log('前端发送的哈希:', 'fb320648615b631191815ef7eb0627366dc459002c697df06911bb7fa6cf3cb5');
console.log('匹配结果:', hash === 'fb320648615b631191815ef7eb0627366dc459002c697df06911bb7fa6cf3cb5');

// 检查数据库中admin用户的密码
const dbPassword = 'hashed_8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';
const dbHash = dbPassword.replace('hashed_', '');

console.log('\n数据库中的密码哈希:', dbHash);
console.log('前端哈希与数据库哈希匹配:', 'fb320648615b631191815ef7eb0627366dc459002c697df06911bb7fa6cf3cb5' === dbHash); 