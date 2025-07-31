import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { EmailConfigService } from './email-config.service';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  template?: string;
  templateData?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly templatesPath = path.join(__dirname, 'templates');

  constructor(private readonly configService: EmailConfigService) {
    this.initializeTransporter();
  }

  /**
   * 初始化邮件传输器
   */
  private async initializeTransporter() {
    if (!this.configService.isConfigured()) {
      this.logger.warn('Email configuration not found, email service will be disabled');
      return;
    }

    try {
      this.transporter = nodemailer.createTransporter({
        host: this.configService.getHost(),
        port: this.configService.getPort(),
        secure: this.configService.isSecure(),
        auth: {
          user: this.configService.getUser(),
          pass: this.configService.getPass(),
        },
      });

      // 验证连接
      await this.transporter.verify();
      this.logger.log('Email transporter initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize email transporter', error);
      this.transporter = null;
    }
  }

  /**
   * 发送邮件
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      throw new BadRequestException('Email service not configured');
    }

    try {
      const { to, subject, text, html, template, templateData, attachments, cc, bcc } = options;

      let emailHtml = html;
      let emailText = text;

      // 如果使用模板，渲染模板
      if (template) {
        const templateResult = await this.renderTemplate(template, templateData || {});
        emailHtml = templateResult.html;
        emailText = templateResult.text || text;
      }

      const mailOptions = {
        from: `"${this.configService.getFromName()}" <${this.configService.getFromEmail()}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        text: emailText,
        html: emailHtml,
        attachments,
        cc: cc ? (Array.isArray(cc) ? cc.join(', ') : cc) : undefined,
        bcc: bcc ? (Array.isArray(bcc) ? bcc.join(', ') : bcc) : undefined,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${to}, messageId: ${result.messageId}`);
      
      console.log('[EMAIL] 发送邮件成功:', {
        to,
        subject,
        messageId: result.messageId
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to send email', error);
      console.log('[EMAIL] 发送邮件失败:', error.message);
      throw new BadRequestException('Failed to send email');
    }
  }

  /**
   * 渲染邮件模板
   */
  private async renderTemplate(templateName: string, data: Record<string, any>): Promise<EmailTemplate> {
    const templatePath = path.join(this.templatesPath, `${templateName}.html`);
    
    try {
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template ${templateName} not found`);
      }

      let html = fs.readFileSync(templatePath, 'utf8');
      let text = '';

      // 替换模板变量
      Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        html = html.replace(regex, data[key]);
        text = text.replace(regex, data[key]);
      });

      // 提取主题（如果模板中包含）
      const subjectMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const subject = subjectMatch ? subjectMatch[1] : 'PD Dental Services';

      // 提取纯文本内容
      text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

      return { subject, html, text };
    } catch (error) {
      this.logger.error(`Failed to render template ${templateName}`, error);
      throw new BadRequestException(`Template ${templateName} not found or invalid`);
    }
  }

  /**
   * 发送欢迎邮件
   */
  async sendWelcomeEmail(to: string, data: { name: string; clinicName?: string }) {
    return this.sendEmail({
      to,
      subject: 'Welcome to PD Service',
      template: 'welcome',
      templateData: data,
    });
  }

  /**
   * 发送牙医注册确认邮件
   */
  async sendDentistRegistrationEmail(to: string, data: { 
    fullName: string; 
    clinicName: string; 
    phone: string;
    applicationId: string;
  }) {
    return this.sendEmail({
      to,
      subject: 'Dentist Registration Confirmation',
      template: 'dentist-registration',
      templateData: data,
    });
  }

  /**
   * 发送支付确认邮件
   */
  async sendPaymentConfirmationEmail(to: string, data: {
    patientName: string;
    amount: string;
    currency: string;
    treatmentType: string;
    paymentId: string;
    date: string;
  }) {
    return this.sendEmail({
      to,
      subject: 'Payment Confirmation',
      template: 'payment-confirmation',
      templateData: data,
    });
  }

  /**
   * 发送预约确认邮件
   */
  async sendAppointmentConfirmationEmail(to: string, data: {
    patientName: string;
    dentistName: string;
    appointmentDate: string;
    appointmentTime: string;
    clinicName: string;
    clinicAddress: string;
    appointmentId: string;
  }) {
    return this.sendEmail({
      to,
      subject: 'Appointment Confirmation',
      template: 'appointment-confirmation',
      templateData: data,
    });
  }

  /**
   * 发送密码重置邮件
   */
  async sendPasswordResetEmail(to: string, data: {
    name: string;
    resetLink: string;
    expiryTime: string;
  }) {
    return this.sendEmail({
      to,
      subject: 'Password Reset Request',
      template: 'password-reset',
      templateData: data,
    });
  }

  /**
   * 发送通知邮件
   */
  async sendNotificationEmail(to: string, data: {
    title: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
  }) {
    return this.sendEmail({
      to,
      subject: data.title,
      template: 'notification',
      templateData: data,
    });
  }

  /**
   * 发送测试邮件
   */
  async sendTestEmail(to: string) {
    return this.sendEmail({
      to,
      subject: 'PD Dental Services - 测试邮件',
      html: `
        <h2>测试邮件</h2>
        <p>这是一封来自PD Dental Services的测试邮件。</p>
        <p>发送时间: ${new Date().toLocaleString('zh-CN')}</p>
        <p>如果您收到这封邮件，说明邮件服务配置正确。</p>
      `,
    });
  }

  /**
   * 批量发送邮件
   */
  async sendBulkEmail(recipients: string[], options: Omit<EmailOptions, 'to'>) {
    const results: Array<{ recipient: string; success: boolean; error?: string }> = [];
    
    for (const recipient of recipients) {
      try {
        const result = await this.sendEmail({
          ...options,
          to: recipient,
        });
        results.push({ recipient, success: true });
      } catch (error) {
        results.push({ recipient, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * 检查邮件服务状态
   */
  async checkEmailService(): Promise<{
    configured: boolean;
    connected: boolean;
    config: any;
  }> {
    const configured = this.configService.isConfigured();
    let connected = false;

    if (configured && this.transporter) {
      try {
        await this.transporter.verify();
        connected = true;
      } catch (error) {
        this.logger.error('Email service connection failed', error);
      }
    }

    return {
      configured,
      connected,
      config: this.configService.getConfig(),
    };
  }
} 