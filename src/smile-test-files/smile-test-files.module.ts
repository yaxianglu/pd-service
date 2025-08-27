import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmileTestFilesController } from './smile-test-files.controller';
import { SmileTestFilesService } from './smile-test-files.service';
import { SmileTestFiles } from '../entities/smile-test-files.entity';
import { SmileTest } from '../entities/smile-test.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SmileTestFiles, SmileTest])],
  controllers: [SmileTestFilesController],
  providers: [SmileTestFilesService],
  exports: [SmileTestFilesService],
})
export class SmileTestFilesModule {}
