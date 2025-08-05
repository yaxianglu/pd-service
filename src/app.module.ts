import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { DentistInfo } from './entities/dentist-info.entity';
import { PaymentRecord } from './entities/payment-record.entity';
import { AdminUser } from './entities/admin-user.entity';
import { PaypalModule } from './paypal/paypal.module';
import { EmailModule } from './email/email.module';
import { PdfModule } from './pdf/pdf.module';
import { PartnersModule } from './partners/partners.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([DentistInfo, PaymentRecord, AdminUser]),
    PaypalModule,
    EmailModule,
    PdfModule,
    PartnersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
