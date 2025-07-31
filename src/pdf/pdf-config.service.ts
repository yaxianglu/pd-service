import { Injectable } from '@nestjs/common';

@Injectable()
export class PdfConfigService {
  private readonly outputPath: string;
  private readonly templatesPath: string;
  private readonly assetsPath: string;
  private readonly watermarkText: string;
  private readonly companyName: string;
  private readonly companyAddress: string;
  private readonly companyPhone: string;
  private readonly companyEmail: string;

  constructor() {
    this.outputPath = process.env.PDF_OUTPUT_PATH || './pdfs';
    this.templatesPath = process.env.PDF_TEMPLATES_PATH || './src/pdf/templates';
    this.assetsPath = process.env.PDF_ASSETS_PATH || './src/pdf/assets';
    this.watermarkText = process.env.PDF_WATERMARK_TEXT || 'PD Dental Services';
    this.companyName = process.env.COMPANY_NAME || 'PD Dental Services';
    this.companyAddress = process.env.COMPANY_ADDRESS || '台北市信义区信义路五段7号';
    this.companyPhone = process.env.COMPANY_PHONE || '+886 2 1234 5678';
    this.companyEmail = process.env.COMPANY_EMAIL || 'info@pd-dental.com';
  }

  getOutputPath(): string {
    return this.outputPath;
  }

  getTemplatesPath(): string {
    return this.templatesPath;
  }

  getAssetsPath(): string {
    return this.assetsPath;
  }

  getWatermarkText(): string {
    return this.watermarkText;
  }

  getCompanyName(): string {
    return this.companyName;
  }

  getCompanyAddress(): string {
    return this.companyAddress;
  }

  getCompanyPhone(): string {
    return this.companyPhone;
  }

  getCompanyEmail(): string {
    return this.companyEmail;
  }

  getConfig() {
    return {
      outputPath: this.outputPath,
      templatesPath: this.templatesPath,
      assetsPath: this.assetsPath,
      watermarkText: this.watermarkText,
      companyName: this.companyName,
      companyAddress: this.companyAddress,
      companyPhone: this.companyPhone,
      companyEmail: this.companyEmail,
    };
  }
} 