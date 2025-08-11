import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { DentistInfo } from '../entities/dentist-info.entity';
import { Clinic, ClinicStatus, ClinicType } from '../entities/clinic.entity';

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
    @InjectRepository(Clinic)
    private clinicRepository: Repository<Clinic>,
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

  async approvePartnerById(id: number) {
    // 查找申请记录
    const dentist = await this.dentistInfoRepository.findOne({ where: { id } });
    if (!dentist) {
      throw new Error('申請記錄不存在');
    }

    // 创建診所資料（若已存在同名且未刪除可直接返回）
    const clinic = this.clinicRepository.create({
      clinic_name: dentist.clinic_name || `${dentist.full_name || '未命名'}診所`,
      address: dentist.address || null,
      city: dentist.city || null,
      phone: dentist.phone || null,
      email: dentist.email || null,
      owner_name: dentist.full_name || null,
      owner_phone: dentist.phone || null,
      clinic_type: ((): ClinicType | null => {
        const t = (dentist as any).clinic_type as string | undefined;
        if (!t) return null;
        const map: Record<string, ClinicType> = {
          private: ClinicType.GENERAL,
          public: ClinicType.GENERAL,
          corporate: ClinicType.GENERAL,
          other: ClinicType.OTHER,
          orthodontic: ClinicType.ORTHODONTIC,
          cosmetic: ClinicType.COSMETIC,
          pediatric: ClinicType.PEDIATRIC,
          specialized: ClinicType.SPECIALIZED,
          general: ClinicType.GENERAL,
        };
        return map[t] ?? ClinicType.GENERAL;
      })(),
      status: ClinicStatus.ACTIVE,
      clinic_code: dentist.uuid || undefined,
      is_deleted: 0 as any,
    } as Partial<Clinic> as Clinic);
    const savedClinic = await this.clinicRepository.save(clinic);

    // 更新申请状态
    dentist.status = 'active' as any;
    await this.dentistInfoRepository.save(dentist);

    return { clinic: savedClinic, partner: dentist };
  }

  async rejectPartnerById(id: number) {
    const dentist = await this.dentistInfoRepository.findOne({ where: { id } });
    if (!dentist) {
      throw new Error('申請記錄不存在');
    }
    dentist.status = 'inactive' as any; // 標記為拒絕/未啟用
    await this.dentistInfoRepository.save(dentist);
    return { partner: dentist };
  }
} 