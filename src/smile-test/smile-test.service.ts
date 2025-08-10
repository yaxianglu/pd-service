import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SmileTest } from '../entities/smile-test.entity';
import { Patient } from '../entities/patient.entity';
import { AdminUser } from '../entities/admin-user.entity';
import { Clinic } from '../entities/clinic.entity';

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
  patient_uuid?: string;
}

export interface SmileTestWithRelations {
  smileTest: SmileTest;
  patient: Patient | null;
  doctor: AdminUser | null;
  clinic: Clinic | null;
}

@Injectable()
export class SmileTestService {
  constructor(
    @InjectRepository(SmileTest)
    private smileTestRepository: Repository<SmileTest>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    @InjectRepository(Clinic)
    private clinicRepository: Repository<Clinic>,
  ) {}

  async findByUuid(uuid: string): Promise<SmileTest | null> {
    return this.smileTestRepository.findOne({ 
      where: { uuid, is_deleted: 0 } 
    });
  }

  async findByUuidWithRelations(uuid: string): Promise<SmileTestWithRelations | null> {
    // 查询微笑测试
    const smileTest = await this.smileTestRepository.findOne({ 
      where: { uuid, is_deleted: 0 } 
    });

    if (!smileTest) {
      return null;
    }

    let patient: Patient | null = null;
    let doctor: AdminUser | null = null;
    let clinic: Clinic | null = null;

    try {
      // 尝试查询关联的患者信息
      // 注意：如果数据库表结构不完整，这些查询可能会失败
      if (smileTest.patient_uuid) {
        patient = await this.patientRepository.findOne({
          where: { uuid: smileTest.patient_uuid, is_deleted: 0 }
        });

        // 如果患者有关联的医生UUID，查询医生信息
        if (patient && (patient as any).assigned_doctor_uuid) {
          doctor = await this.adminUserRepository.findOne({
            where: { 
              uuid: (patient as any).assigned_doctor_uuid, 
              is_deleted: 0,
              role: 'doctor' // 直接使用字符串 'doctor'，因为 role 字段现在是 string 类型
            }
          });

          // 如果医生有关联的诊所UUID，查询诊所信息
          if (doctor && (doctor as any).department) {
            clinic = await this.clinicRepository.findOne({
              where: { 
                uuid: (doctor as any).department, 
                is_deleted: 0 
              }
            });
          }
        }
      }
    } catch (error) {
      console.warn('关联查询失败，可能是数据库表结构不完整:', error.message);
      // 继续执行，返回基本数据
    }

    return {
      smileTest,
      patient,
      doctor,
      clinic
    };
  }

  async findByTestId(testId: string): Promise<SmileTest | null> {
    return this.smileTestRepository.findOne({ 
      where: { test_id: testId, is_deleted: 0 } 
    });
  }

  async findAll(): Promise<SmileTest[]> {
    return this.smileTestRepository.find({ 
      where: { is_deleted: 0 } 
    });
  }

  async create(data: SmileTestData): Promise<SmileTest> {
    const smileTest = this.smileTestRepository.create({
      ...data,
      test_status: data.test_status || 'pending',
      is_deleted: 0
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

    existing.is_deleted = 1;
    existing.deleted_at = new Date();
    await this.smileTestRepository.save(existing);
    return true;
  }

  async deleteByTestId(testId: string): Promise<boolean> {
    const existing = await this.findByTestId(testId);
    if (!existing) {
      return false;
    }

    existing.is_deleted = 1;
    existing.deleted_at = new Date();
    await this.smileTestRepository.save(existing);
    return true;
  }
} 