import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnersController } from './partners.controller';
import { PartnersService } from './partners.service';
import { DentistInfo } from '../entities/dentist-info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DentistInfo])],
  controllers: [PartnersController],
  providers: [PartnersService],
  exports: [PartnersService],
})
export class PartnersModule {} 