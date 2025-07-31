import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { PdfService, PdfOptions, InvoiceData, TreatmentPlanData, MedicalReportData, AppointmentData } from './pdf.service';

@Controller('api/pdf')
export class PdfController {
  private readonly logger = new Logger(PdfController.name);

  constructor(private readonly pdfService: PdfService) {}

  /**
   * 生成发票PDF
   */
  @Post('invoice')
  async generateInvoicePdf(@Body() data: InvoiceData, @Res() res: Response) {
    this.logger.log('Generating invoice PDF', { invoiceNumber: data.invoiceNumber });
    
    try {
      const pdfBuffer = await this.pdfService.generateInvoicePdf(data);
      
      console.log('[POST /api/pdf/invoice] 生成成功:', { invoiceNumber: data.invoiceNumber });
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${data.invoiceNumber}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });
      
      res.send(pdfBuffer);
    } catch (error) {
      this.logger.error('Failed to generate invoice PDF', error);
      console.log('[POST /api/pdf/invoice] 错误:', error.message);
      throw new BadRequestException('Failed to generate invoice PDF');
    }
  }

  /**
   * 生成治疗计划PDF
   */
  @Post('treatment-plan')
  async generateTreatmentPlanPdf(@Body() data: TreatmentPlanData, @Res() res: Response) {
    this.logger.log('Generating treatment plan PDF', { patientName: data.patientName });
    
    try {
      const pdfBuffer = await this.pdfService.generateTreatmentPlanPdf(data);
      
      console.log('[POST /api/pdf/treatment-plan] 生成成功:', { patientName: data.patientName });
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="treatment-plan-${data.patientId}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });
      
      res.send(pdfBuffer);
    } catch (error) {
      this.logger.error('Failed to generate treatment plan PDF', error);
      console.log('[POST /api/pdf/treatment-plan] 错误:', error.message);
      throw new BadRequestException('Failed to generate treatment plan PDF');
    }
  }

  /**
   * 生成医疗报告PDF
   */
  @Post('medical-report')
  async generateMedicalReportPdf(@Body() data: MedicalReportData, @Res() res: Response) {
    this.logger.log('Generating medical report PDF', { patientName: data.patientName });
    
    try {
      const pdfBuffer = await this.pdfService.generateMedicalReportPdf(data);
      
      console.log('[POST /api/pdf/medical-report] 生成成功:', { patientName: data.patientName });
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="medical-report-${data.patientId}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });
      
      res.send(pdfBuffer);
    } catch (error) {
      this.logger.error('Failed to generate medical report PDF', error);
      console.log('[POST /api/pdf/medical-report] 错误:', error.message);
      throw new BadRequestException('Failed to generate medical report PDF');
    }
  }

  /**
   * 生成预约确认PDF
   */
  @Post('appointment')
  async generateAppointmentPdf(@Body() data: AppointmentData, @Res() res: Response) {
    this.logger.log('Generating appointment PDF', { appointmentId: data.appointmentId });
    
    try {
      const pdfBuffer = await this.pdfService.generateAppointmentPdf(data);
      
      console.log('[POST /api/pdf/appointment] 生成成功:', { appointmentId: data.appointmentId });
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="appointment-${data.appointmentId}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });
      
      res.send(pdfBuffer);
    } catch (error) {
      this.logger.error('Failed to generate appointment PDF', error);
      console.log('[POST /api/pdf/appointment] 错误:', error.message);
      throw new BadRequestException('Failed to generate appointment PDF');
    }
  }

  /**
   * 生成自定义PDF
   */
  @Post('custom')
  async generateCustomPdf(
    @Body() body: {
      templateName: string;
      data: Record<string, any>;
      options?: PdfOptions;
    },
    @Res() res: Response
  ) {
    this.logger.log('Generating custom PDF', { templateName: body.templateName });
    
    try {
      const pdfBuffer = await this.pdfService.generateCustomPdf(
        body.templateName,
        body.data,
        body.options || {}
      );
      
      console.log('[POST /api/pdf/custom] 生成成功:', { templateName: body.templateName });
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${body.templateName}-${Date.now()}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });
      
      res.send(pdfBuffer);
    } catch (error) {
      this.logger.error('Failed to generate custom PDF', error);
      console.log('[POST /api/pdf/custom] 错误:', error.message);
      throw new BadRequestException('Failed to generate custom PDF');
    }
  }

  /**
   * 生成HTML预览
   */
  @Post('preview')
  async generateHtmlPreview(@Body() body: {
    type: 'invoice' | 'treatment-plan' | 'medical-report' | 'appointment';
    data: any;
  }) {
    this.logger.log('Generating HTML preview', { type: body.type });
    
    try {
      let html: string;
      
      switch (body.type) {
        case 'invoice':
          html = this.pdfService['renderInvoiceTemplate'](body.data);
          break;
        case 'treatment-plan':
          html = this.pdfService['renderTreatmentPlanTemplate'](body.data);
          break;
        case 'medical-report':
          html = this.pdfService['renderMedicalReportTemplate'](body.data);
          break;
        case 'appointment':
          html = this.pdfService['renderAppointmentTemplate'](body.data);
          break;
        default:
          throw new BadRequestException('Invalid PDF type');
      }
      
      console.log('[POST /api/pdf/preview] 生成成功:', { type: body.type });
      
      return {
        success: true,
        message: 'HTML preview generated successfully',
        data: { html },
      };
    } catch (error) {
      this.logger.error('Failed to generate HTML preview', error);
      console.log('[POST /api/pdf/preview] 错误:', error.message);
      throw new BadRequestException('Failed to generate HTML preview');
    }
  }

  /**
   * 保存PDF文件
   */
  @Post('save')
  async savePdf(@Body() body: {
    type: 'invoice' | 'treatment-plan' | 'medical-report' | 'appointment' | 'custom';
    data: any;
    filename: string;
    options?: PdfOptions;
    templateName?: string;
  }) {
    this.logger.log('Saving PDF file', { filename: body.filename });
    
    try {
      let pdfBuffer: Buffer;
      
      switch (body.type) {
        case 'invoice':
          pdfBuffer = await this.pdfService.generateInvoicePdf(body.data, body.options);
          break;
        case 'treatment-plan':
          pdfBuffer = await this.pdfService.generateTreatmentPlanPdf(body.data, body.options);
          break;
        case 'medical-report':
          pdfBuffer = await this.pdfService.generateMedicalReportPdf(body.data, body.options);
          break;
        case 'appointment':
          pdfBuffer = await this.pdfService.generateAppointmentPdf(body.data, body.options);
          break;
        case 'custom':
          if (!body.templateName) {
            throw new BadRequestException('Template name is required for custom PDF');
          }
          pdfBuffer = await this.pdfService.generateCustomPdf(body.templateName, body.data, body.options);
          break;
        default:
          throw new BadRequestException('Invalid PDF type');
      }
      
      const filePath = await this.pdfService.savePdf(pdfBuffer, body.filename);
      
      console.log('[POST /api/pdf/save] 保存成功:', { filePath });
      
      return {
        success: true,
        message: 'PDF saved successfully',
        data: { filePath },
      };
    } catch (error) {
      this.logger.error('Failed to save PDF', error);
      console.log('[POST /api/pdf/save] 错误:', error.message);
      throw new BadRequestException('Failed to save PDF');
    }
  }

  /**
   * 获取PDF配置
   */
  @Get('config')
  async getPdfConfig() {
    this.logger.log('Getting PDF configuration');
    
    try {
      const config = this.pdfService['configService'].getConfig();
      console.log('[GET /api/pdf/config] 返回:', config);
      
      return {
        success: true,
        message: 'PDF configuration retrieved successfully',
        data: config,
      };
    } catch (error) {
      this.logger.error('Failed to get PDF configuration', error);
      console.log('[GET /api/pdf/config] 错误:', error.message);
      throw new BadRequestException('Failed to get PDF configuration');
    }
  }

  /**
   * 测试PDF生成
   */
  @Post('test')
  async testPdfGeneration(@Res() res: Response) {
    this.logger.log('Testing PDF generation');
    
    try {
      const testData = {
        invoiceNumber: 'TEST-001',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        patientName: '测试患者',
        patientEmail: 'test@example.com',
        patientPhone: '0912345678',
        patientAddress: '台北市信义区信义路五段7号',
        dentistName: '测试医生',
        clinicName: '测试诊所',
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
        notes: '这是一份测试发票',
      };
      
      const pdfBuffer = await this.pdfService.generateInvoicePdf(testData);
      
      console.log('[POST /api/pdf/test] 测试成功');
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test-invoice.pdf"',
        'Content-Length': pdfBuffer.length,
      });
      
      res.send(pdfBuffer);
    } catch (error) {
      this.logger.error('Failed to test PDF generation', error);
      console.log('[POST /api/pdf/test] 错误:', error.message);
      throw new BadRequestException('Failed to test PDF generation');
    }
  }
} 