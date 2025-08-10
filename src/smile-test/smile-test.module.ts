import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmileTestController } from './smile-test.controller';
import { SmileTestService } from './smile-test.service';
import { SmileTest } from '../entities/smile-test.entity';
import { Patient } from '../entities/patient.entity';
import { AdminUser } from '../entities/admin-user.entity';
import { Clinic } from '../entities/clinic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SmileTest, Patient, AdminUser, Clinic])],
  controllers: [SmileTestController],
  providers: [SmileTestService],
  exports: [SmileTestService],
})
export class SmileTestModule {} 