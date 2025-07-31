import { Module } from '@nestjs/common';
import { PaypalController } from './paypal.controller';
import { PaypalService } from './paypal.service';
import { PaypalConfigService } from './paypal-config.service';

@Module({
  controllers: [PaypalController],
  providers: [PaypalService, PaypalConfigService],
  exports: [PaypalService],
})
export class PaypalModule {} 