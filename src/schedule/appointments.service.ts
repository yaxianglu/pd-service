import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    return this.repo
      .createQueryBuilder('a')
      .where('DATE_FORMAT(a.date, "%Y-%m") = :ym', { ym: `${year}-${mm}` })
      .getMany();
  }
}

function cryptoRandom() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}


