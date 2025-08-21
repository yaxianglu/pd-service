import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser } from '../entities/admin-user.entity';
import { SmileTest } from '../entities/smile-test.entity';
import { Appointment } from '../entities/appointment.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment) private readonly repo: Repository<Appointment>,
  ) {}

  async create(dto: Partial<Appointment>) {
    const entity = this.repo.create(dto);
    if (!entity.uuid) {
      entity.uuid = cryptoRandom();
    }
    return this.repo.save(entity);
  }

  async findByMonth(year: number, month: number) {
    // month: 1-12
    const mm = String(month).padStart(2, '0');
    const rows = await this.repo
      .createQueryBuilder('a')
      .leftJoin(SmileTest, 'p', 'p.uuid = a.patient_uuid')
      .leftJoin(AdminUser, 'd', 'd.uuid = a.doctor_uuid')
      .select([
        'a.id as id',
        'a.uuid as uuid',
        'a.date as date',
        'a.start_time as start_time',
        'a.end_time as end_time',
        'a.note as note',
        'a.status as status',
        'a.priority as priority',
        // use joined tables as the source of uuid/name to avoid nulls when columns on a.* are empty
        'p.uuid as patient_uuid',
        'd.uuid as doctor_uuid',
        'p.full_name as patient_name',
        'd.username as doctor_name'
      ])
      .where('DATE_FORMAT(a.date, "%Y-%m") = :ym', { ym: `${year}-${mm}` })
      .orderBy('a.created_at', 'DESC') // 按创建日期降序排序，最新的在最上面
      .getRawMany();
    return rows;
  }

  async update(idOrUuid: string | number, dto: Partial<Appointment>) {
    // 支持用數字 id 或 uuid 更新
    const where: any = String(idOrUuid).length > 8 && isNaN(Number(idOrUuid))
      ? { uuid: String(idOrUuid) }
      : { id: Number(idOrUuid) };
    const existing = await this.repo.findOne({ where });
    if (!existing) return { success: false, message: 'Appointment not found' } as any;
    const merged = this.repo.merge(existing, dto);
    const saved = await this.repo.save(merged);
    return saved;
  }
}

function cryptoRandom() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}


