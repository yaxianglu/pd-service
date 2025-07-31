import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    const result = this.appService.getHello();
    console.log('[GET /api] 返回:', result);
    return result;
  }

  @Get('health')
  getHealth() {
    const result = {
      status: 'ok',
      message: 'PD Service is running',
      timestamp: new Date().toISOString(),
    };
    console.log('[GET /api/health] 返回:', result);
    return result;
  }

  @Post('faq')
  getFaqData() {
    const result = this.appService.getFaqData();
    console.log('[POST /api/faq] 返回:', result);
    return result;
  }

  @Post('user-info')
  getUserInfo(@Body() userData: any) {
    console.log('[POST /api/user-info] 收到:', userData);
    const result = this.appService.processUserInfo(userData);
    console.log('[POST /api/user-info] 返回:', result);
    return result;
  }

  @Post('dentist-info')
  async createDentistInfo(@Body() dentistData: any) {
    console.log('[POST /api/dentist-info] 收到:', dentistData);
    const result = await this.appService.createDentistInfo(dentistData);
    console.log('[POST /api/dentist-info] 返回:', result);
    return result;
  }

  @Get('dentist-info')
  async getAllDentistInfo() {
    console.log('[GET /api/dentist-info] 请求获取所有牙医信息');
    const result = await this.appService.getAllDentistInfo();
    console.log('[GET /api/dentist-info] 返回:', result);
    return result;
  }
}
