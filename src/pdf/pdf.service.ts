import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PdfConfigService } from './pdf-config.service';
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';

export interface PdfOptions {
  format?: 'A4' | 'A3' | 'Letter' | 'Legal';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  headerTemplate?: string;
  footerTemplate?: string;
  displayHeaderFooter?: boolean;
  printBackground?: boolean;
  preferCSSPageSize?: boolean;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAddress: string;
  dentistName: string;
  clinicName: string;
  clinicAddress: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

export interface TreatmentPlanData {
  patientName: string;
  patientId: string;
  patientEmail: string;
  patientPhone: string;
  patientAddress: string;
  dentistName: string;
  clinicName: string;
  planDate: string;
  treatments: Array<{
    treatmentType: string;
    description: string;
    estimatedCost: number;
    duration: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  totalEstimatedCost: number;
  notes?: string;
}

export interface MedicalReportData {
  patientName: string;
  patientId: string;
  patientAge: number;
  patientGender: string;
  reportDate: string;
  dentistName: string;
  clinicName: string;
  diagnosis: string;
  treatment: string;
  recommendations: string[];
  followUpDate?: string;
  notes?: string;
}

export interface AppointmentData {
  appointmentId: string;
  appointmentDate: string;
  appointmentTime: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  dentistName: string;
  clinicName: string;
  clinicAddress: string;
  treatmentType: string;
  duration: string;
  notes?: string;
}

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private browser: puppeteer.Browser | null = null;

  constructor(private readonly configService: PdfConfigService) {
    this.initializeBrowser();
  }

  /**
   * 初始化浏览器
   */
  private async initializeBrowser() {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      this.logger.log('PDF browser initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize PDF browser', error);
    }
  }

  /**
   * 生成PDF文件
   */
  async generatePdf(html: string, options: PdfOptions = {}): Promise<Buffer> {
    if (!this.browser) {
      throw new BadRequestException('PDF browser not initialized');
    }

    try {
      const page = await this.browser.newPage();
      
      // 设置内容
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // 生成PDF
      const pdfBuffer = await page.pdf({
        format: options.format || 'A4',
        margin: options.margin || {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm',
        },
        displayHeaderFooter: options.displayHeaderFooter || false,
        headerTemplate: options.headerTemplate,
        footerTemplate: options.footerTemplate,
        printBackground: options.printBackground || true,
        preferCSSPageSize: options.preferCSSPageSize || false,
      });

      await page.close();
      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error('Failed to generate PDF', error);
      throw new BadRequestException('Failed to generate PDF');
    }
  }

  /**
   * 保存PDF文件
   */
  async savePdf(pdfBuffer: Buffer, filename: string): Promise<string> {
    try {
      const outputPath = this.configService.getOutputPath();
      
      // 确保输出目录存在
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }

      const filePath = path.join(outputPath, filename);
      fs.writeFileSync(filePath, pdfBuffer);

      this.logger.log(`PDF saved: ${filePath}`);
      return filePath;
    } catch (error) {
      this.logger.error('Failed to save PDF', error);
      throw new BadRequestException('Failed to save PDF');
    }
  }

  /**
   * 生成发票PDF
   */
  async generateInvoicePdf(data: InvoiceData, options: PdfOptions = {}): Promise<Buffer> {
    const html = this.renderInvoiceTemplate(data);
    return this.generatePdf(html, options);
  }

  /**
   * 生成治疗计划PDF
   */
  async generateTreatmentPlanPdf(data: TreatmentPlanData, options: PdfOptions = {}): Promise<Buffer> {
    const html = this.renderTreatmentPlanTemplate(data);
    return this.generatePdf(html, options);
  }

  /**
   * 生成医疗报告PDF
   */
  async generateMedicalReportPdf(data: MedicalReportData, options: PdfOptions = {}): Promise<Buffer> {
    const html = this.renderMedicalReportTemplate(data);
    return this.generatePdf(html, options);
  }

  /**
   * 生成预约确认PDF
   */
  async generateAppointmentPdf(data: AppointmentData, options: PdfOptions = {}): Promise<Buffer> {
    const html = this.renderAppointmentTemplate(data);
    return this.generatePdf(html, options);
  }

  /**
   * 生成自定义PDF
   */
  async generateCustomPdf(templateName: string, data: Record<string, any>, options: PdfOptions = {}): Promise<Buffer> {
    const html = this.renderCustomTemplate(templateName, data);
    return this.generatePdf(html, options);
  }

  /**
   * 渲染发票模板
   */
  private renderInvoiceTemplate(data: InvoiceData): string {
    const itemsHtml = data.items.map(item => `
      <tr>
        <td>${item.description}</td>
        <td>${item.quantity}</td>
        <td>$${item.unitPrice.toFixed(2)}</td>
        <td>$${item.amount.toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>发票 - ${data.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-info { margin-bottom: 20px; }
          .invoice-details { margin-bottom: 20px; }
          .patient-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { text-align: right; font-weight: bold; }
          .footer { margin-top: 30px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${this.configService.getCompanyName()}</h1>
          <p>${this.configService.getCompanyAddress()}</p>
          <p>电话: ${this.configService.getCompanyPhone()} | 邮箱: ${this.configService.getCompanyEmail()}</p>
        </div>

        <div class="invoice-details">
          <h2>发票</h2>
          <p><strong>发票号码:</strong> ${data.invoiceNumber}</p>
          <p><strong>发票日期:</strong> ${data.invoiceDate}</p>
          <p><strong>到期日期:</strong> ${data.dueDate}</p>
        </div>

        <div class="patient-info">
          <h3>患者信息</h3>
          <p><strong>姓名:</strong> ${data.patientName}</p>
          <p><strong>邮箱:</strong> ${data.patientEmail}</p>
          <p><strong>电话:</strong> ${data.patientPhone}</p>
          <p><strong>地址:</strong> ${data.patientAddress}</p>
        </div>

        <div class="clinic-info">
          <h3>诊所信息</h3>
          <p><strong>诊所名称:</strong> ${data.clinicName}</p>
          <p><strong>医生:</strong> ${data.dentistName}</p>
          <p><strong>地址:</strong> ${data.clinicAddress}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>项目描述</th>
              <th>数量</th>
              <th>单价</th>
              <th>金额</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="total">
          <p>小计: $${data.subtotal.toFixed(2)}</p>
          <p>税费: $${data.tax.toFixed(2)}</p>
          <p><strong>总计: $${data.total.toFixed(2)}</strong></p>
        </div>

        ${data.notes ? `<div class="notes"><h3>备注</h3><p>${data.notes}</p></div>` : ''}

        <div class="footer">
          <p>感谢您选择我们的服务！</p>
          <p>如有任何问题，请随时联系我们。</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * 渲染治疗计划模板
   */
  private renderTreatmentPlanTemplate(data: TreatmentPlanData): string {
    const treatmentsHtml = data.treatments.map(treatment => `
      <tr>
        <td>${treatment.treatmentType}</td>
        <td>${treatment.description}</td>
        <td>$${treatment.estimatedCost.toFixed(2)}</td>
        <td>${treatment.duration}</td>
        <td>${treatment.priority}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>治疗计划 - ${data.patientName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .patient-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { text-align: right; font-weight: bold; }
          .footer { margin-top: 30px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${this.configService.getCompanyName()}</h1>
          <h2>治疗计划</h2>
        </div>

        <div class="patient-info">
          <h3>患者信息</h3>
          <p><strong>姓名:</strong> ${data.patientName}</p>
          <p><strong>患者ID:</strong> ${data.patientId}</p>
          <p><strong>邮箱:</strong> ${data.patientEmail}</p>
          <p><strong>电话:</strong> ${data.patientPhone}</p>
          <p><strong>地址:</strong> ${data.patientAddress}</p>
        </div>

        <div class="plan-info">
          <h3>计划信息</h3>
          <p><strong>制定日期:</strong> ${data.planDate}</p>
          <p><strong>医生:</strong> ${data.dentistName}</p>
          <p><strong>诊所:</strong> ${data.clinicName}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>治疗类型</th>
              <th>描述</th>
              <th>预估费用</th>
              <th>持续时间</th>
              <th>优先级</th>
            </tr>
          </thead>
          <tbody>
            ${treatmentsHtml}
          </tbody>
        </table>

        <div class="total">
          <p><strong>总预估费用: $${data.totalEstimatedCost.toFixed(2)}</strong></p>
        </div>

        ${data.notes ? `<div class="notes"><h3>备注</h3><p>${data.notes}</p></div>` : ''}

        <div class="footer">
          <p>此治疗计划仅供参考，具体治疗方案请咨询您的医生。</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * 渲染医疗报告模板
   */
  private renderMedicalReportTemplate(data: MedicalReportData): string {
    const recommendationsHtml = data.recommendations.map(rec => `<li>${rec}</li>`).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>医疗报告 - ${data.patientName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .patient-info { margin-bottom: 20px; }
          .report-content { margin-bottom: 20px; }
          .footer { margin-top: 30px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${this.configService.getCompanyName()}</h1>
          <h2>医疗报告</h2>
        </div>

        <div class="patient-info">
          <h3>患者信息</h3>
          <p><strong>姓名:</strong> ${data.patientName}</p>
          <p><strong>患者ID:</strong> ${data.patientId}</p>
          <p><strong>年龄:</strong> ${data.patientAge}岁</p>
          <p><strong>性别:</strong> ${data.patientGender}</p>
          <p><strong>报告日期:</strong> ${data.reportDate}</p>
        </div>

        <div class="doctor-info">
          <h3>医生信息</h3>
          <p><strong>医生:</strong> ${data.dentistName}</p>
          <p><strong>诊所:</strong> ${data.clinicName}</p>
        </div>

        <div class="report-content">
          <h3>诊断</h3>
          <p>${data.diagnosis}</p>

          <h3>治疗方案</h3>
          <p>${data.treatment}</p>

          <h3>建议</h3>
          <ul>
            ${recommendationsHtml}
          </ul>

          ${data.followUpDate ? `<h3>复诊日期</h3><p>${data.followUpDate}</p>` : ''}
        </div>

        ${data.notes ? `<div class="notes"><h3>备注</h3><p>${data.notes}</p></div>` : ''}

        <div class="footer">
          <p>此报告仅供医疗参考，请遵循医生的专业建议。</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * 渲染预约确认模板
   */
  private renderAppointmentTemplate(data: AppointmentData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>预约确认 - ${data.appointmentId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .appointment-info { margin-bottom: 20px; }
          .patient-info { margin-bottom: 20px; }
          .clinic-info { margin-bottom: 20px; }
          .footer { margin-top: 30px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${this.configService.getCompanyName()}</h1>
          <h2>预约确认</h2>
        </div>

        <div class="appointment-info">
          <h3>预约信息</h3>
          <p><strong>预约编号:</strong> ${data.appointmentId}</p>
          <p><strong>预约日期:</strong> ${data.appointmentDate}</p>
          <p><strong>预约时间:</strong> ${data.appointmentTime}</p>
          <p><strong>治疗类型:</strong> ${data.treatmentType}</p>
          <p><strong>预计时长:</strong> ${data.duration}</p>
        </div>

        <div class="patient-info">
          <h3>患者信息</h3>
          <p><strong>姓名:</strong> ${data.patientName}</p>
          <p><strong>邮箱:</strong> ${data.patientEmail}</p>
          <p><strong>电话:</strong> ${data.patientPhone}</p>
        </div>

        <div class="clinic-info">
          <h3>诊所信息</h3>
          <p><strong>诊所名称:</strong> ${data.clinicName}</p>
          <p><strong>医生:</strong> ${data.dentistName}</p>
          <p><strong>地址:</strong> ${data.clinicAddress}</p>
        </div>

        ${data.notes ? `<div class="notes"><h3>备注</h3><p>${data.notes}</p></div>` : ''}

        <div class="footer">
          <p>请提前15分钟到达诊所。</p>
          <p>如需取消或改期，请提前24小时联系我们。</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * 渲染自定义模板
   */
  private renderCustomTemplate(templateName: string, data: Record<string, any>): string {
    const templatePath = path.join(this.configService.getTemplatesPath(), `${templateName}.html`);
    
    try {
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template ${templateName} not found`);
      }

      let html = fs.readFileSync(templatePath, 'utf8');

      // 替换模板变量
      Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        html = html.replace(regex, data[key]);
      });

      return html;
    } catch (error) {
      this.logger.error(`Failed to render template ${templateName}`, error);
      throw new BadRequestException(`Template ${templateName} not found or invalid`);
    }
  }

  /**
   * 清理临时文件
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
} 