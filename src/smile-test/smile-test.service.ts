import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SmileTest } from '../entities/smile-test.entity';

export interface SmileTestData {
  uuid?: string;
  full_name?: string;
  birth_date?: string;
  phone?: string;
  email?: string;
  line_id?: string;
  city?: string;
  teeth_type?: string;
  considerations?: string;
  improvement_points?: string;
  teeth_image_1?: string;
  teeth_image_2?: string;
  teeth_image_3?: string;
  teeth_image_4?: string;
  age?: number;
  gender?: string;
  occupation?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  dental_history?: string;
  current_issues?: string;
  allergies?: string;
  medications?: string;
  test_score?: number;
  confidence_level?: string;
  recommended_treatment?: string;
  estimated_cost?: number;
  test_status?: string;
  appointment_date?: Date;
  follow_up_date?: Date;
}

@Injectable()
export class SmileTestService {
  constructor(
    @InjectRepository(SmileTest)
    private smileTestRepository: Repository<SmileTest>,
  ) {}

  async findByUuid(uuid: string): Promise<SmileTest | null> {
    return await this.smileTestRepository.findOne({ 
      where: { uuid, is_deleted: false } 
    });
  }

  async findByTestId(testId: string): Promise<SmileTest | null> {
    return await this.smileTestRepository.findOne({ 
      where: { test_id: testId, is_deleted: false } 
    });
  }

  async create(data: SmileTestData): Promise<SmileTest> {
    const smileTest = this.smileTestRepository.create({
      ...data,
      test_status: data.test_status || 'pending',
      is_deleted: false
    });
    return await this.smileTestRepository.save(smileTest);
  }

  async updateByUuid(uuid: string, data: Partial<SmileTestData>): Promise<SmileTest | null> {
    const existing = await this.findByUuid(uuid);
    if (!existing) {
      return null;
    }

    Object.assign(existing, data);
    return await this.smileTestRepository.save(existing);
  }

  async updateByTestId(testId: string, data: Partial<SmileTestData>): Promise<SmileTest | null> {
    const existing = await this.findByTestId(testId);
    if (!existing) {
      return null;
    }

    Object.assign(existing, data);
    return await this.smileTestRepository.save(existing);
  }

  async saveOrUpdateByUuid(uuid: string, data: SmileTestData): Promise<SmileTest> {
    const existing = await this.findByUuid(uuid);
    if (existing) {
      Object.assign(existing, data);
      return await this.smileTestRepository.save(existing);
    } else {
      return await this.create({
        ...data,
        uuid: uuid
      });
    }
  }

  async deleteByUuid(uuid: string): Promise<boolean> {
    const existing = await this.findByUuid(uuid);
    if (!existing) {
      return false;
    }

    existing.is_deleted = true;
    existing.deleted_at = new Date();
    await this.smileTestRepository.save(existing);
    return true;
  }

  async deleteByTestId(testId: string): Promise<boolean> {
    const existing = await this.findByTestId(testId);
    if (!existing) {
      return false;
    }

    existing.is_deleted = true;
    existing.deleted_at = new Date();
    await this.smileTestRepository.save(existing);
    return true;
  }
} 