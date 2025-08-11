import { Controller, Get, Query, Post, Param, HttpException, HttpStatus } from '@nestjs/common';
import { PartnersService } from './partners.service';

@Controller('api/partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get()
  async getPartners(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    try {
      const result = await this.partnersService.getPartners({
        page: Number(page),
        limit: Number(limit),
        status,
        search,
      });

      return {
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit),
        },
      };
    } catch (error) {
      console.error('获取合作夥伴列表失败:', error);
      return {
        success: false,
        message: '获取合作夥伴列表失败',
        error: error.message,
      };
    }
  }

  // 审批通过某个合作伙伴申请：创建診所并将申请状态置为active
  @Post(':id/approve')
  async approve(@Param('id') id: string) {
    try {
      const result = await this.partnersService.approvePartnerById(Number(id));
      return { success: true, data: result };
    } catch (error) {
      throw new HttpException({ success: false, message: error.message || '操作失敗' }, HttpStatus.BAD_REQUEST);
    }
  }
} 