const axios = require('axios');
const fs = require('fs');

const API_BASE_URL = 'http://localhost:3001/api/pdf';

// 测试数据
const testInvoiceData = {
  invoiceNumber: 'INV-2024-001',
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  patientName: '张三',
  patientEmail: 'zhangsan@example.com',
  patientPhone: '0912345678',
  patientAddress: '台北市信义区信义路五段7号',
  dentistName: '李医生',
  clinicName: '阳光牙科诊所',
  clinicAddress: '台北市信义区信义路五段7号',
  items: [
    {
      description: '牙齿检查',
      quantity: 1,
      unitPrice: 500,
      amount: 500,
    },
    {
      description: '洗牙',
      quantity: 1,
      unitPrice: 800,
      amount: 800,
    },
  ],
  subtotal: 1300,
  tax: 65,
  total: 1365,
  notes: '请按时付款',
};

const testTreatmentPlanData = {
  patientName: '张三',
  patientId: 'PAT-001',
  patientEmail: 'zhangsan@example.com',
  patientPhone: '0912345678',
  patientAddress: '台北市信义区信义路五段7号',
  dentistName: '李医生',
  clinicName: '阳光牙科诊所',
  planDate: new Date().toISOString().split('T')[0],
  treatments: [
    {
      treatmentType: '牙齿矫正',
      description: '使用隐形牙套进行牙齿矫正',
      estimatedCost: 50000,
      duration: '18个月',
      priority: 'high',
    },
    {
      treatmentType: '定期检查',
      description: '每3个月进行一次检查',
      estimatedCost: 2000,
      duration: '3个月',
      priority: 'medium',
    },
  ],
  totalEstimatedCost: 52000,
  notes: '请按计划进行治疗',
};

const testMedicalReportData = {
  patientName: '张三',
  patientId: 'PAT-001',
  patientAge: 30,
  patientGender: '男',
  reportDate: new Date().toISOString().split('T')[0],
  dentistName: '李医生',
  clinicName: '阳光牙科诊所',
  diagnosis: '牙齿排列不齐，存在轻微龋齿',
  treatment: '建议进行牙齿矫正治疗，同时进行龋齿修复',
  recommendations: [
    '定期刷牙，每天至少2次',
    '使用牙线清洁牙缝',
    '定期复诊，每3个月一次',
    '避免食用过多甜食',
    '保持良好口腔卫生习惯',
  ],
  followUpDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  notes: '患者情况良好，配合度高',
};

const testAppointmentData = {
  appointmentId: 'APT-001',
  appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  appointmentTime: '14:00',
  patientName: '张三',
  patientEmail: 'zhangsan@example.com',
  patientPhone: '0912345678',
  dentistName: '李医生',
  clinicName: '阳光牙科诊所',
  clinicAddress: '台北市信义区信义路五段7号',
  treatmentType: '牙齿检查',
  duration: '30分钟',
  notes: '请提前15分钟到达，携带身份证件',
};

async function testPdfService() {
  console.log('📄 开始测试PDF服务...\n');

  try {
    // 1. 测试PDF配置
    console.log('1. 测试PDF配置...');
    const configResponse = await axios.get(`${API_BASE_URL}/config`);
    console.log('✅ PDF配置:', configResponse.data);
    console.log('');

    // 2. 测试PDF生成
    console.log('2. 测试PDF生成...');
    const testResponse = await axios.post(`${API_BASE_URL}/test`, {}, {
      responseType: 'arraybuffer',
    });
    
    // 保存测试PDF
    fs.writeFileSync('test-invoice.pdf', testResponse.data);
    console.log('✅ 测试PDF生成成功，已保存为 test-invoice.pdf');
    console.log('');

    // 3. 测试发票PDF生成
    console.log('3. 测试发票PDF生成...');
    const invoiceResponse = await axios.post(`${API_BASE_URL}/invoice`, testInvoiceData, {
      responseType: 'arraybuffer',
    });
    
    // 保存发票PDF
    fs.writeFileSync('invoice.pdf', invoiceResponse.data);
    console.log('✅ 发票PDF生成成功，已保存为 invoice.pdf');
    console.log('');

    // 4. 测试治疗计划PDF生成
    console.log('4. 测试治疗计划PDF生成...');
    const treatmentPlanResponse = await axios.post(`${API_BASE_URL}/treatment-plan`, testTreatmentPlanData, {
      responseType: 'arraybuffer',
    });
    
    // 保存治疗计划PDF
    fs.writeFileSync('treatment-plan.pdf', treatmentPlanResponse.data);
    console.log('✅ 治疗计划PDF生成成功，已保存为 treatment-plan.pdf');
    console.log('');

    // 5. 测试医疗报告PDF生成
    console.log('5. 测试医疗报告PDF生成...');
    const medicalReportResponse = await axios.post(`${API_BASE_URL}/medical-report`, testMedicalReportData, {
      responseType: 'arraybuffer',
    });
    
    // 保存医疗报告PDF
    fs.writeFileSync('medical-report.pdf', medicalReportResponse.data);
    console.log('✅ 医疗报告PDF生成成功，已保存为 medical-report.pdf');
    console.log('');

    // 6. 测试预约确认PDF生成
    console.log('6. 测试预约确认PDF生成...');
    const appointmentResponse = await axios.post(`${API_BASE_URL}/appointment`, testAppointmentData, {
      responseType: 'arraybuffer',
    });
    
    // 保存预约确认PDF
    fs.writeFileSync('appointment.pdf', appointmentResponse.data);
    console.log('✅ 预约确认PDF生成成功，已保存为 appointment.pdf');
    console.log('');

    // 7. 测试HTML预览
    console.log('7. 测试HTML预览...');
    const previewResponse = await axios.post(`${API_BASE_URL}/preview`, {
      type: 'invoice',
      data: testInvoiceData,
    });
    console.log('✅ HTML预览生成成功');
    console.log('预览HTML长度:', previewResponse.data.data.html.length, '字符');
    console.log('');

    // 8. 测试保存PDF文件
    console.log('8. 测试保存PDF文件...');
    const saveResponse = await axios.post(`${API_BASE_URL}/save`, {
      type: 'invoice',
      data: testInvoiceData,
      filename: 'saved-invoice.pdf',
    });
    console.log('✅ PDF文件保存成功:', saveResponse.data.data.filePath);
    console.log('');

    console.log('🎉 所有PDF测试通过！');
    console.log('\n📝 生成的PDF文件:');
    console.log('  - test-invoice.pdf (测试发票)');
    console.log('  - invoice.pdf (发票)');
    console.log('  - treatment-plan.pdf (治疗计划)');
    console.log('  - medical-report.pdf (医疗报告)');
    console.log('  - appointment.pdf (预约确认)');
    console.log('  - saved-invoice.pdf (保存的发票)');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.log('\n💡 提示: 请检查Puppeteer是否正确安装');
      console.log('   npm install puppeteer');
    }
    
    if (error.response?.status === 400) {
      console.log('\n💡 提示: 请检查请求数据格式');
    }
  }
}

// 测试特定PDF类型
async function testSpecificPdf(type, data, filename) {
  console.log(`📄 测试${type}PDF生成...`);
  
  try {
    const response = await axios.post(`${API_BASE_URL}/${type}`, data, {
      responseType: 'arraybuffer',
    });
    
    fs.writeFileSync(filename, response.data);
    console.log(`✅ ${type}PDF生成成功，已保存为 ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ ${type}PDF生成失败:`, error.response?.data || error.message);
    return false;
  }
}

// 测试HTML预览
async function testHtmlPreview(type, data) {
  console.log(`📄 测试${type}HTML预览...`);
  
  try {
    const response = await axios.post(`${API_BASE_URL}/preview`, {
      type,
      data,
    });
    
    console.log(`✅ ${type}HTML预览生成成功`);
    console.log('HTML长度:', response.data.data.html.length, '字符');
    return true;
  } catch (error) {
    console.error(`❌ ${type}HTML预览失败:`, error.response?.data || error.message);
    return false;
  }
}

// 运行测试
if (require.main === module) {
  testPdfService();
}

module.exports = { testPdfService, testSpecificPdf, testHtmlPreview }; 