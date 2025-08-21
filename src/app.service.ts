import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DentistInfo } from './entities/dentist-info.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(DentistInfo)
    private dentistInfoRepository: Repository<DentistInfo>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  getFaqData() {
    return {
      success: true,
      data: [
        {
          id: 1,
          question: '隱形牙套療程流程是什麼？',
          answer: '線上預約與自拍微笑照測試(免費服務)...'
        },
        {
          id: 2,
          question: '隱形牙套需要配戴多久時間？',
          answer: '一般建議每天配戴20-22小時...'
        }
      ],
      timestamp: new Date().toISOString()
    };
  }

  processUserInfo(userData: any) {
    return {
      success: true,
      message: 'User data received successfully',
      data: {
        ...userData,
        processedAt: new Date().toISOString(),
        userId: Math.random().toString(36).substr(2, 9)
      }
    };
  }

  // 新增牙医信息到数据库
  async createDentistInfo(dentistData: any) {
    try {
      const dentistInfo = new DentistInfo();
      dentistInfo.uuid = uuidv4();
      Object.assign(dentistInfo, dentistData);
      
      const result = await this.dentistInfoRepository.save(dentistInfo);
      console.log('牙医信息保存成功:', result);
      
      return {
        success: true,
        message: '牙医信息保存成功',
        data: result
      };
    } catch (error) {
      console.error('保存牙医信息失败:', error);
      return {
        success: false,
        message: '保存失败',
        error: error.message
      };
    }
  }

  // 获取所有牙医信息
  async getAllDentistInfo() {
    try {
      const result = await this.dentistInfoRepository.find({
        order: { created_at: 'DESC' } // 按创建日期降序排序，最新的在最上面
      });
      console.log('获取牙医信息成功，共', result.length, '条记录');
      
      return {
        success: true,
        message: '获取牙医信息成功',
        data: result,
        count: result.length
      };
    } catch (error) {
      console.error('获取牙医信息失败:', error);
      return {
        success: false,
        message: '获取失败',
        error: error.message
      };
    }
  }
}
