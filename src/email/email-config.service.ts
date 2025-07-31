import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailConfigService {
  private readonly host: string;
  private readonly port: number;
  private readonly user: string;
  private readonly pass: string;
  private readonly secure: boolean;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor() {
    this.host = process.env.SMTP_HOST || 'smtp.gmail.com';
    this.port = parseInt(process.env.SMTP_PORT || '587');
    this.user = process.env.SMTP_USER || '';
    this.pass = process.env.SMTP_PASS || '';
    this.secure = process.env.SMTP_SECURE === 'true';
    this.fromEmail = process.env.FROM_EMAIL || this.user;
    this.fromName = process.env.FROM_NAME || 'PD Dental Services';
  }

  getHost(): string {
    return this.host;
  }

  getPort(): number {
    return this.port;
  }

  getUser(): string {
    return this.user;
  }

  getPass(): string {
    return this.pass;
  }

  isSecure(): boolean {
    return this.secure;
  }

  getFromEmail(): string {
    return this.fromEmail;
  }

  getFromName(): string {
    return this.fromName;
  }

  isConfigured(): boolean {
    return !!(this.user && this.pass);
  }

  getConfig() {
    return {
      host: this.host,
      port: this.port,
      secure: this.secure,
      user: this.user ? '***' : 'Not configured',
      fromEmail: this.fromEmail,
      fromName: this.fromName,
      configured: this.isConfigured(),
    };
  }
} 