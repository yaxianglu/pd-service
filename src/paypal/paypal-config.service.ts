import { Injectable } from '@nestjs/common';

@Injectable()
export class PaypalConfigService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly environment: string;
  private readonly webhookId: string;

  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID || '';
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
    this.environment = process.env.PAYPAL_ENVIRONMENT || 'sandbox';
    this.webhookId = process.env.PAYPAL_WEBHOOK_ID || '';
  }

  getClientId(): string {
    return this.clientId;
  }

  getClientSecret(): string {
    return this.clientSecret;
  }

  getEnvironment(): string {
    return this.environment;
  }

  getWebhookId(): string {
    return this.webhookId;
  }

  isProduction(): boolean {
    return this.environment === 'live';
  }

  getBaseUrl(): string {
    return this.isProduction() 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';
  }

  getWebhookUrl(): string {
    return this.isProduction()
      ? 'https://api-m.paypal.com/v1/notifications/webhooks'
      : 'https://api-m.sandbox.paypal.com/v1/notifications/webhooks';
  }
} 