import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { EmailConfigService } from './email-config.service';

@Module({
  controllers: [EmailController],
  providers: [EmailService, EmailConfigService],
  exports: [EmailService],
})
export class EmailModule {} 