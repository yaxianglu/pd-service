import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { DentistInfo } from '../entities/dentist-info.entity';

export interface GetPartnersOptions {
  page: number;
  limit: number;
  status?: string;
  search?: string;
}

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(DentistInfo)
    private dentistInfoRepository: Repository<DentistInfo>,
  ) {}

  async getPartners(options: GetPartnersOptions) {
    const { page, limit, status, search } = options;
    const skip = (page - 1) * limit;

    // 构建查询条件
    let whereConditions: any = {};

    if (status && status !== 'all') {
      whereConditions.status = status;
    }

    // 构建搜索条件
    let searchConditions: Array<{ [key: string]: any }> = [];
    if (search) {
      searchConditions = [
        { full_name: Like(`%${search}%`) },
        { clinic_name: Like(`%${search}%`) },
        { phone: Like(`%${search}%`) },
        { email: Like(`%${search}%`) },
      ];
    }

    // 执行查询
    let query = this.dentistInfoRepository.createQueryBuilder('dentist');

    // 添加状态筛选
    if (status && status !== 'all') {
      query = query.where('dentist.status = :status', { status });
    }

    // 添加搜索条件
    if (search && searchConditions.length > 0) {
      const searchWhere = searchConditions.map((condition, index) => {
        const key = Object.keys(condition)[0];
        const value = Object.values(condition)[0];
        return `dentist.${key} LIKE :search${index}`;
      }).join(' OR ');

      if (status && status !== 'all') {
        query = query.andWhere(`(${searchWhere})`);
      } else {
        query = query.where(`(${searchWhere})`);
      }

      // 添加搜索参数
      searchConditions.forEach((condition, index) => {
        const value = Object.values(condition)[0];
        query = query.setParameter(`search${index}`, value);
      });
    }

    // 添加排序和分页
    query = query
      .orderBy('dentist.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }
} 