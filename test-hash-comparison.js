const crypto = require('crypto');

// 测试密码
const password = 'Kj9#mN2$pQ7@vX5&hL8!';

// Node.js crypto.createHash 方式
const nodeHash = crypto.createHash('sha256').update(password).digest('hex');
console.log('Node.js SHA256:', nodeHash);

// 模拟浏览器 Web Crypto API 的方式
// 注意：这里只是模拟，实际浏览器中可能略有不同
const encoder = new TextEncoder();
const passwordData = encoder.encode(password);
const hashBuffer = crypto.createHash('sha256').update(passwordData).digest();
const hashArray = Array.from(new Uint8Array(hashBuffer));
const webCryptoHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
console.log('Web Crypto API:', webCryptoHash);

// 检查是否相同
console.log('是否相同:', nodeHash === webCryptoHash);

// 测试你提供的密码
const testPassword = 'pearl_admin_2025';
const testHash = crypto.createHash('sha256').update(testPassword).digest('hex');
console.log('\n测试密码:', testPassword);
console.log('期望的哈希值:', 'fb320648615b631191815ef7eb0627366dc459002c697df06911bb7fa6cf3cb5');
console.log('实际哈希值:', testHash);
console.log('是否匹配:', testHash === 'fb320648615b631191815ef7eb0627366dc459002c697df06911bb7fa6cf3cb5'); 