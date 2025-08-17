const crypto = require('crypto');

// 测试数据
const testCases = [
  {
    username: 'henrycao_doctor_user',
    currentPassword: 'P@rlD1g1t@l2024!',
    newPassword: 'NewPassword123!'
  },
  {
    username: 'admin',
    currentPassword: 'P@rlD1g1t@l2024!',
    newPassword: 'AdminNewPass456!'
  }
];

// 生成密码哈希
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// 测试修改密码
async function testChangePassword() {
  const baseURL = 'http://localhost:3000';
  
  for (const testCase of testCases) {
    console.log(`\n测试用户: ${testCase.username}`);
    console.log('='.repeat(50));
    
    try {
      // 1. 先登录获取 token
      console.log('1. 登录获取 token...');
      const loginResponse = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: testCase.username,
          password: hashPassword(testCase.currentPassword)
        })
      });
      
      if (!loginResponse.ok) {
        console.log(`❌ 登录失败: ${loginResponse.status} ${loginResponse.statusText}`);
        continue;
      }
      
      const loginData = await loginResponse.json();
      if (!loginData.success) {
        console.log(`❌ 登录失败: ${loginData.message}`);
        continue;
      }
      
      const token = loginData.data.token;
      console.log('✅ 登录成功，获取到 token');
      
      // 2. 测试修改密码
      console.log('2. 测试修改密码...');
      const changePasswordResponse = await fetch(`${baseURL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: hashPassword(testCase.currentPassword),
          newPassword: hashPassword(testCase.newPassword)
        })
      });
      
      if (!changePasswordResponse.ok) {
        console.log(`❌ 修改密码失败: ${changePasswordResponse.status} ${changePasswordResponse.statusText}`);
        continue;
      }
      
      const changePasswordData = await changePasswordResponse.json();
      if (changePasswordData.success) {
        console.log('✅ 修改密码成功');
        
        // 3. 验证新密码可以登录
        console.log('3. 验证新密码可以登录...');
        const newLoginResponse = await fetch(`${baseURL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: testCase.username,
            password: hashPassword(testCase.newPassword)
          })
        });
        
        if (newLoginResponse.ok) {
          const newLoginData = await newLoginResponse.json();
          if (newLoginData.success) {
            console.log('✅ 新密码登录成功');
          } else {
            console.log(`❌ 新密码登录失败: ${newLoginData.message}`);
          }
        } else {
          console.log(`❌ 新密码登录失败: ${newLoginResponse.status}`);
        }
        
        // 4. 恢复原密码
        console.log('4. 恢复原密码...');
        const restoreResponse = await fetch(`${baseURL}/auth/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword: hashPassword(testCase.newPassword),
            newPassword: hashPassword(testCase.currentPassword)
          })
        });
        
        if (restoreResponse.ok) {
          const restoreData = await restoreResponse.json();
          if (restoreData.success) {
            console.log('✅ 密码恢复成功');
          } else {
            console.log(`❌ 密码恢复失败: ${restoreData.message}`);
          }
        } else {
          console.log(`❌ 密码恢复失败: ${restoreResponse.status}`);
        }
        
      } else {
        console.log(`❌ 修改密码失败: ${changePasswordData.message}`);
      }
      
    } catch (error) {
      console.log(`❌ 测试过程中发生错误: ${error.message}`);
    }
  }
}

// 运行测试
console.log('开始测试修改密码功能...');
testChangePassword().then(() => {
  console.log('\n测试完成');
}).catch(error => {
  console.error('测试失败:', error);
});
