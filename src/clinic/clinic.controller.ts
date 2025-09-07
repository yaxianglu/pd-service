import { Controller, Get, Post, Put, Body, Param, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clinic, ClinicStatus } from '../entities/clinic.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { v4 as uuidv4 } from 'uuid';

@Controller('api/clinics')
export class ClinicController {
  constructor(
    @InjectRepository(Clinic)
    private clinicRepository: Repository<Clinic>,
  ) {}

  // 获取诊所列表
  @Get()
  @UseGuards(JwtAuthGuard)
  async getClinics() {
    try {
      const clinics = await this.clinicRepository.find({ 
        where: { is_deleted: 0 } as any,
        order: { created_at: 'DESC' }
      });
      return { success: true, data: clinics };
    } catch (error) {
      console.error('获取诊所列表失败:', error);
      throw new HttpException({ 
        success: false, 
        message: '获取诊所列表失败' 
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 创建诊所
  @Post()
  @UseGuards(JwtAuthGuard)
  async createClinic(@Body() clinicData: any) {
    try {
      // 验证必填字段
      if (!clinicData.clinic_name) {
        throw new HttpException({ 
          success: false, 
          message: '診所名稱不能為空' 
        }, HttpStatus.BAD_REQUEST);
      }

      // 检查诊所名称是否已存在
      const existingClinic = await this.clinicRepository.findOne({
        where: { 
          clinic_name: clinicData.clinic_name,
          is_deleted: 0 
        } as any
      });

      if (existingClinic) {
        throw new HttpException({ 
          success: false, 
          message: '診所名稱已存在' 
        }, HttpStatus.BAD_REQUEST);
      }

      // 创建新诊所
      const newClinic = this.clinicRepository.create({
        uuid: uuidv4(),
        clinic_name: clinicData.clinic_name,
        address: clinicData.address || null,
        phone: clinicData.phone || null,
        city: clinicData.city || null,
        website: clinicData.website || null,
        status: ClinicStatus.ACTIVE,
        is_deleted: 0,
        created_at: new Date(),
        updated_at: new Date()
      });

      const savedClinic = await this.clinicRepository.save(newClinic);
      
      return { 
        success: true, 
        message: '診所創建成功',
        data: savedClinic 
      };
    } catch (error) {
      console.error('创建诊所失败:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ 
        success: false, 
        message: '創建診所失敗' 
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 更新诊所信息
  @Put(':uuid')
  @UseGuards(JwtAuthGuard)
  async updateClinic(@Param('uuid') uuid: string, @Body() updateData: any) {
    try {
      console.log('更新诊所信息:', { uuid, updateData });
      
      // 查找诊所
      const clinic = await this.clinicRepository.findOne({ 
        where: { uuid, is_deleted: 0 } as any 
      });
      
      if (!clinic) {
        throw new HttpException({ 
          success: false, 
          message: '診所不存在' 
        }, HttpStatus.NOT_FOUND);
      }

      // 更新诊所信息
      const updatedClinic = await this.clinicRepository.save({
        ...clinic,
        ...updateData,
        updated_at: new Date()
      });

      return { 
        success: true, 
        data: updatedClinic, 
        message: '診所信息更新成功' 
      };
    } catch (error) {
      console.error('更新诊所信息失败:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ 
        success: false, 
        message: '更新診所信息失敗' 
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
