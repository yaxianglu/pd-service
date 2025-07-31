import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Headers,
  Req,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PaypalService, CreatePaymentRequest, RefundRequest } from './paypal.service';
import { Request } from 'express';

@Controller('api/paypal')
export class PaypalController {
  private readonly logger = new Logger(PaypalController.name);

  constructor(private readonly paypalService: PaypalService) {}

  /**
   * 创建支付订单
   */
  @Post('create-payment')
  async createPayment(@Body() request: CreatePaymentRequest) {
    this.logger.log('Creating payment order', request);
    
    try {
      const result = await this.paypalService.createPayment(request);
      console.log('[POST /api/paypal/create-payment] 返回:', result);
      return {
        success: true,
        message: 'Payment order created successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to create payment', error);
      console.log('[POST /api/paypal/create-payment] 错误:', error.message);
      throw new BadRequestException('Failed to create payment order');
    }
  }

  /**
   * 捕获支付
   */
  @Post('capture-payment/:orderId')
  async capturePayment(@Param('orderId') orderId: string) {
    this.logger.log(`Capturing payment for order: ${orderId}`);
    
    try {
      const result = await this.paypalService.capturePayment(orderId);
      console.log('[POST /api/paypal/capture-payment] 返回:', result);
      return {
        success: true,
        message: 'Payment captured successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Failed to capture payment: ${orderId}`, error);
      console.log('[POST /api/paypal/capture-payment] 错误:', error.message);
      throw new BadRequestException('Failed to capture payment');
    }
  }

  /**
   * 获取支付详情
   */
  @Get('payment/:orderId')
  async getPaymentDetails(@Param('orderId') orderId: string) {
    this.logger.log(`Getting payment details for order: ${orderId}`);
    
    try {
      const result = await this.paypalService.getPaymentDetails(orderId);
      console.log('[GET /api/paypal/payment] 返回:', result);
      return {
        success: true,
        message: 'Payment details retrieved successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Failed to get payment details: ${orderId}`, error);
      console.log('[GET /api/paypal/payment] 错误:', error.message);
      throw new BadRequestException('Failed to get payment details');
    }
  }

  /**
   * 退款
   */
  @Post('refund')
  async refundPayment(@Body() request: RefundRequest) {
    this.logger.log('Processing refund', request);
    
    try {
      const result = await this.paypalService.refundPayment(request);
      console.log('[POST /api/paypal/refund] 返回:', result);
      return {
        success: true,
        message: 'Refund processed successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to process refund', error);
      console.log('[POST /api/paypal/refund] 错误:', error.message);
      throw new BadRequestException('Failed to process refund');
    }
  }

  /**
   * 获取支付历史
   */
  @Get('history')
  async getPaymentHistory(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    this.logger.log('Getting payment history', { page, pageSize, startDate, endDate });
    
    try {
      const result = await this.paypalService.getPaymentHistory(
        parseInt(page),
        parseInt(pageSize),
        startDate,
        endDate,
      );
      console.log('[GET /api/paypal/history] 返回:', result);
      return {
        success: true,
        message: 'Payment history retrieved successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to get payment history', error);
      console.log('[GET /api/paypal/history] 错误:', error.message);
      throw new BadRequestException('Failed to get payment history');
    }
  }

  /**
   * 取消支付订单
   */
  @Post('cancel/:orderId')
  async cancelPayment(
    @Param('orderId') orderId: string,
    @Body() body: { reason?: string },
  ) {
    this.logger.log(`Cancelling payment order: ${orderId}`, body);
    
    try {
      await this.paypalService.cancelPayment(orderId, body.reason);
      console.log('[POST /api/paypal/cancel] 返回: Payment cancelled successfully');
      return {
        success: true,
        message: 'Payment order cancelled successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to cancel payment: ${orderId}`, error);
      console.log('[POST /api/paypal/cancel] 错误:', error.message);
      throw new BadRequestException('Failed to cancel payment order');
    }
  }

  /**
   * PayPal Webhook 处理
   */
  @Post('webhook')
  async handleWebhook(@Headers() headers: any, @Req() request: Request) {
    this.logger.log('Received PayPal webhook');
    
    try {
      // 验证Webhook签名
      const body = JSON.stringify(request.body);
      const isValid = await this.paypalService.verifyWebhookSignature(headers, body);
      
      if (!isValid) {
        this.logger.warn('Invalid webhook signature');
        throw new BadRequestException('Invalid webhook signature');
      }

      const event = request.body;
      console.log('[POST /api/paypal/webhook] 收到事件:', event);

      // 处理不同类型的Webhook事件
      switch (event.event_type) {
        case 'PAYMENT.CAPTURE.COMPLETED':
          await this.handlePaymentCompleted(event);
          break;
        case 'PAYMENT.CAPTURE.DENIED':
          await this.handlePaymentDenied(event);
          break;
        case 'PAYMENT.CAPTURE.REFUNDED':
          await this.handlePaymentRefunded(event);
          break;
        case 'CHECKOUT.ORDER.APPROVED':
          await this.handleOrderApproved(event);
          break;
        case 'CHECKOUT.ORDER.CANCELLED':
          await this.handleOrderCancelled(event);
          break;
        default:
          this.logger.log(`Unhandled webhook event type: ${event.event_type}`);
      }

      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      this.logger.error('Failed to process webhook', error);
      console.log('[POST /api/paypal/webhook] 错误:', error.message);
      throw new BadRequestException('Failed to process webhook');
    }
  }

  /**
   * 处理支付完成事件
   */
  private async handlePaymentCompleted(event: any) {
    this.logger.log('Payment completed', event);
    // 在这里添加业务逻辑，比如更新订单状态、发送确认邮件等
    const paymentId = event.resource.id;
    const amount = event.resource.amount.value;
    const currency = event.resource.amount.currency_code;
    
    console.log(`Payment ${paymentId} completed: ${amount} ${currency}`);
  }

  /**
   * 处理支付被拒绝事件
   */
  private async handlePaymentDenied(event: any) {
    this.logger.log('Payment denied', event);
    const paymentId = event.resource.id;
    console.log(`Payment ${paymentId} was denied`);
  }

  /**
   * 处理支付退款事件
   */
  private async handlePaymentRefunded(event: any) {
    this.logger.log('Payment refunded', event);
    const paymentId = event.resource.id;
    console.log(`Payment ${paymentId} was refunded`);
  }

  /**
   * 处理订单批准事件
   */
  private async handleOrderApproved(event: any) {
    this.logger.log('Order approved', event);
    const orderId = event.resource.id;
    console.log(`Order ${orderId} was approved`);
  }

  /**
   * 处理订单取消事件
   */
  private async handleOrderCancelled(event: any) {
    this.logger.log('Order cancelled', event);
    const orderId = event.resource.id;
    console.log(`Order ${orderId} was cancelled`);
  }

  /**
   * 获取PayPal配置信息（仅用于调试）
   */
  @Get('config')
  async getConfig() {
    return {
      success: true,
      message: 'PayPal configuration',
      data: {
        environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox',
        clientId: process.env.PAYPAL_CLIENT_ID ? '***' : 'Not configured',
        webhookId: process.env.PAYPAL_WEBHOOK_ID || 'Not configured',
      },
    };
  }
} 