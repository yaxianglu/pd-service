import {
  Controller,
  Post,
  Get,
  Body,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { EmailService, EmailOptions } from './email.service';

@Controller('api/email')
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly emailService: EmailService) {}

  /**
   * 发送邮件
   */
  @Post('send')
  async sendEmail(@Body() options: EmailOptions) {
    this.logger.log('Sending email', { to: options.to, subject: options.subject });
    
    try {
      const result = await this.emailService.sendEmail(options);
      console.log('[POST /api/email/send] 返回:', { success: result });
      return {
        success: true,
        message: 'Email sent successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to send email', error);
      console.log('[POST /api/email/send] 错误:', error.message);
      throw new BadRequestException('Failed to send email');
    }
  }

  /**
   * 发送测试邮件
   */
  @Post('test')
  async sendTestEmail(@Body() body: { to: string }) {
    this.logger.log('Sending test email', body);
    
    try {
      const result = await this.emailService.sendTestEmail(body.to);
      console.log('[POST /api/email/test] 返回:', { success: result });
      return {
        success: true,
        message: 'Test email sent successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to send test email', error);
      console.log('[POST /api/email/test] 错误:', error.message);
      throw new BadRequestException('Failed to send test email');
    }
  }

  /**
   * 发送欢迎邮件
   */
  @Post('welcome')
  async sendWelcomeEmail(@Body() body: { 
    to: string; 
    name: string; 
    clinicName?: string;
  }) {
    this.logger.log('Sending welcome email', body);
    
    try {
      const result = await this.emailService.sendWelcomeEmail(body.to, {
        name: body.name,
        clinicName: body.clinicName,
      });
      console.log('[POST /api/email/welcome] 返回:', { success: result });
      return {
        success: true,
        message: 'Welcome email sent successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to send welcome email', error);
      console.log('[POST /api/email/welcome] 错误:', error.message);
      throw new BadRequestException('Failed to send welcome email');
    }
  }

  /**
   * 发送牙医注册确认邮件
   */
  @Post('dentist-registration')
  async sendDentistRegistrationEmail(@Body() body: {
    to: string;
    fullName: string;
    clinicName: string;
    phone: string;
    applicationId: string;
  }) {
    this.logger.log('Sending dentist registration email', body);
    
    try {
      const result = await this.emailService.sendDentistRegistrationEmail(body.to, {
        fullName: body.fullName,
        clinicName: body.clinicName,
        phone: body.phone,
        applicationId: body.applicationId,
      });
      console.log('[POST /api/email/dentist-registration] 返回:', { success: result });
      return {
        success: true,
        message: 'Dentist registration email sent successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to send dentist registration email', error);
      console.log('[POST /api/email/dentist-registration] 错误:', error.message);
      throw new BadRequestException('Failed to send dentist registration email');
    }
  }

  /**
   * 发送支付确认邮件
   */
  @Post('payment-confirmation')
  async sendPaymentConfirmationEmail(@Body() body: {
    to: string;
    patientName: string;
    amount: string;
    currency: string;
    treatmentType: string;
    paymentId: string;
    date: string;
  }) {
    this.logger.log('Sending payment confirmation email', body);
    
    try {
      const result = await this.emailService.sendPaymentConfirmationEmail(body.to, {
        patientName: body.patientName,
        amount: body.amount,
        currency: body.currency,
        treatmentType: body.treatmentType,
        paymentId: body.paymentId,
        date: body.date,
      });
      console.log('[POST /api/email/payment-confirmation] 返回:', { success: result });
      return {
        success: true,
        message: 'Payment confirmation email sent successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to send payment confirmation email', error);
      console.log('[POST /api/email/payment-confirmation] 错误:', error.message);
      throw new BadRequestException('Failed to send payment confirmation email');
    }
  }

  /**
   * 发送预约确认邮件
   */
  @Post('appointment-confirmation')
  async sendAppointmentConfirmationEmail(@Body() body: {
    to: string;
    patientName: string;
    dentistName: string;
    appointmentDate: string;
    appointmentTime: string;
    clinicName: string;
    clinicAddress: string;
    appointmentId: string;
  }) {
    this.logger.log('Sending appointment confirmation email', body);
    
    try {
      const result = await this.emailService.sendAppointmentConfirmationEmail(body.to, {
        patientName: body.patientName,
        dentistName: body.dentistName,
        appointmentDate: body.appointmentDate,
        appointmentTime: body.appointmentTime,
        clinicName: body.clinicName,
        clinicAddress: body.clinicAddress,
        appointmentId: body.appointmentId,
      });
      console.log('[POST /api/email/appointment-confirmation] 返回:', { success: result });
      return {
        success: true,
        message: 'Appointment confirmation email sent successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to send appointment confirmation email', error);
      console.log('[POST /api/email/appointment-confirmation] 错误:', error.message);
      throw new BadRequestException('Failed to send appointment confirmation email');
    }
  }

  /**
   * 发送密码重置邮件
   */
  @Post('password-reset')
  async sendPasswordResetEmail(@Body() body: {
    to: string;
    name: string;
    resetLink: string;
    expiryTime: string;
  }) {
    this.logger.log('Sending password reset email', body);
    
    try {
      const result = await this.emailService.sendPasswordResetEmail(body.to, {
        name: body.name,
        resetLink: body.resetLink,
        expiryTime: body.expiryTime,
      });
      console.log('[POST /api/email/password-reset] 返回:', { success: result });
      return {
        success: true,
        message: 'Password reset email sent successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to send password reset email', error);
      console.log('[POST /api/email/password-reset] 错误:', error.message);
      throw new BadRequestException('Failed to send password reset email');
    }
  }

  /**
   * 发送通知邮件
   */
  @Post('notification')
  async sendNotificationEmail(@Body() body: {
    to: string;
    title: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
  }) {
    this.logger.log('Sending notification email', body);
    
    try {
      const result = await this.emailService.sendNotificationEmail(body.to, {
        title: body.title,
        message: body.message,
        actionUrl: body.actionUrl,
        actionText: body.actionText,
      });
      console.log('[POST /api/email/notification] 返回:', { success: result });
      return {
        success: true,
        message: 'Notification email sent successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to send notification email', error);
      console.log('[POST /api/email/notification] 错误:', error.message);
      throw new BadRequestException('Failed to send notification email');
    }
  }

  /**
   * 批量发送邮件
   */
  @Post('bulk')
  async sendBulkEmail(@Body() body: {
    recipients: string[];
    subject: string;
    html?: string;
    text?: string;
    template?: string;
    templateData?: Record<string, any>;
  }) {
    this.logger.log('Sending bulk email', { 
      recipientCount: body.recipients.length, 
      subject: body.subject 
    });
    
    try {
      const results = await this.emailService.sendBulkEmail(body.recipients, {
        subject: body.subject,
        html: body.html,
        text: body.text,
        template: body.template,
        templateData: body.templateData,
      });
      console.log('[POST /api/email/bulk] 返回:', { 
        total: results.length, 
        success: results.filter(r => r.success).length 
      });
      return {
        success: true,
        message: 'Bulk email sent successfully',
        data: {
          total: results.length,
          success: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          results,
        },
      };
    } catch (error) {
      this.logger.error('Failed to send bulk email', error);
      console.log('[POST /api/email/bulk] 错误:', error.message);
      throw new BadRequestException('Failed to send bulk email');
    }
  }

  /**
   * 检查邮件服务状态
   */
  @Get('status')
  async checkEmailService() {
    this.logger.log('Checking email service status');
    
    try {
      const status = await this.emailService.checkEmailService();
      console.log('[GET /api/email/status] 返回:', status);
      return {
        success: true,
        message: 'Email service status retrieved successfully',
        data: status,
      };
    } catch (error) {
      this.logger.error('Failed to check email service status', error);
      console.log('[GET /api/email/status] 错误:', error.message);
      throw new BadRequestException('Failed to check email service status');
    }
  }
} 