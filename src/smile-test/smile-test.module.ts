import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmileTestController } from './smile-test.controller';
import { SmileTestService } from './smile-test.service';
import { SmileTest } from '../entities/smile-test.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SmileTest])],
  controllers: [SmileTestController],
  providers: [SmileTestService],
  exports: [SmileTestService],
})
export class SmileTestModule {} 