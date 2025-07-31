import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PaypalConfigService } from './paypal-config.service';
import axios from 'axios';

export interface CreatePaymentRequest {
  amount: number;
  currency: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  customId?: string;
}

export interface PaymentResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface PaymentDetails {
  id: string;
  status: string;
  amount: {
    total: string;
    currency: string;
  };
  description: string;
  custom_id?: string;
  create_time: string;
  update_time: string;
}

export interface RefundRequest {
  paymentId: string;
  amount?: number;
  reason?: string;
}

export interface RefundResponse {
  id: string;
  status: string;
  amount: {
    total: string;
    currency: string;
  };
  create_time: string;
}

@Injectable()
export class PaypalService {
  private readonly logger = new Logger(PaypalService.name);
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(private readonly configService: PaypalConfigService) {}

  /**
   * 获取PayPal访问令牌
   */
  private async getAccessToken(): Promise<string> {
    const now = Date.now();
    
    // 如果令牌还有效，直接返回
    if (this.accessToken && now < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `${this.configService.getBaseUrl()}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(
              `${this.configService.getClientId()}:${this.configService.getClientSecret()}`
            ).toString('base64')}`,
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = now + (response.data.expires_in * 1000) - 60000; // 提前1分钟过期

      this.logger.log('PayPal access token refreshed');
      return this.accessToken!;
    } catch (error) {
      this.logger.error('Failed to get PayPal access token', error);
      throw new BadRequestException('Failed to authenticate with PayPal');
    }
  }

  /**
   * 创建支付订单
   */
  async createPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    try {
      const accessToken = await this.getAccessToken();
      
      const paymentData = {
        intent: 'CAPTURE',
        application_context: {
          return_url: request.returnUrl,
          cancel_url: request.cancelUrl,
          brand_name: 'PD Dental Services',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          shipping_preference: 'NO_SHIPPING',
        },
        purchase_units: [
          {
            amount: {
              currency_code: request.currency,
              value: request.amount.toFixed(2),
            },
            description: request.description,
            custom_id: request.customId,
          },
        ],
      };

      const response = await axios.post(
        `${this.configService.getBaseUrl()}/v2/checkout/orders`,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      this.logger.log(`Payment created: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create payment', error);
      throw new BadRequestException('Failed to create payment');
    }
  }

  /**
   * 捕获支付
   */
  async capturePayment(orderId: string): Promise<PaymentDetails> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.post(
        `${this.configService.getBaseUrl()}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      this.logger.log(`Payment captured: ${orderId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to capture payment: ${orderId}`, error);
      throw new BadRequestException('Failed to capture payment');
    }
  }

  /**
   * 获取支付详情
   */
  async getPaymentDetails(orderId: string): Promise<PaymentDetails> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.get(
        `${this.configService.getBaseUrl()}/v2/checkout/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get payment details: ${orderId}`, error);
      throw new BadRequestException('Failed to get payment details');
    }
  }

  /**
   * 退款
   */
  async refundPayment(request: RefundRequest): Promise<RefundResponse> {
    try {
      const accessToken = await this.getAccessToken();

      const refundData: any = {};
      if (request.amount) {
        refundData.amount = {
          value: request.amount.toFixed(2),
          currency_code: 'USD',
        };
      }
      if (request.reason) {
        refundData.reason = request.reason;
      }

      const response = await axios.post(
        `${this.configService.getBaseUrl()}/v2/payments/captures/${request.paymentId}/refund`,
        refundData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      this.logger.log(`Payment refunded: ${request.paymentId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to refund payment: ${request.paymentId}`, error);
      throw new BadRequestException('Failed to refund payment');
    }
  }

  /**
   * 验证Webhook签名
   */
  async verifyWebhookSignature(
    headers: any,
    body: string,
    webhookId?: string
  ): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      const webhookIdToUse = webhookId || this.configService.getWebhookId();

      const verificationData = {
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookIdToUse,
        webhook_event: JSON.parse(body),
      };

      const response = await axios.post(
        `${this.configService.getWebhookUrl()}/verify-webhook-signature`,
        verificationData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.verification_status === 'SUCCESS';
    } catch (error) {
      this.logger.error('Failed to verify webhook signature', error);
      return false;
    }
  }

  /**
   * 获取支付历史
   */
  async getPaymentHistory(
    page: number = 1,
    pageSize: number = 20,
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      
      let url = `${this.configService.getBaseUrl()}/v2/checkout/orders?page=${page}&page_size=${pageSize}`;
      
      if (startDate) {
        url += `&start_time=${startDate}`;
      }
      if (endDate) {
        url += `&end_time=${endDate}`;
      }

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error('Failed to get payment history', error);
      throw new BadRequestException('Failed to get payment history');
    }
  }

  /**
   * 取消支付订单
   */
  async cancelPayment(orderId: string, reason?: string): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();

      const cancelData: any = {};
      if (reason) {
        cancelData.reason = reason;
      }

      await axios.post(
        `${this.configService.getBaseUrl()}/v2/checkout/orders/${orderId}/cancel`,
        cancelData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      this.logger.log(`Payment cancelled: ${orderId}`);
    } catch (error) {
      this.logger.error(`Failed to cancel payment: ${orderId}`, error);
      throw new BadRequestException('Failed to cancel payment');
    }
  }
} 