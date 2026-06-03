import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
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

interface DoctorIdentifier {
  uuid?: string;
  email?: string;
  username?: string;
}

export interface SmileTestListFilters {
  status?: string;
  date_from?: string;
  date_to?: string;
  account_keyword?: string;
  patient_name?: string;
  bound_state?: 'bound' | 'unbound';
  sort_by?: 'created_at' | 'updated_at' | 'image_upload_time';
  page?: number;
  page_size?: number;
}

export type SmileTestListItem = SmileTest & {
  latest_image_upload_time?: string | null;
};

export interface SmileTestListResult {
  data: SmileTestListItem[];
  total: number;
}

export const SMILE_TEST_UUID_EXPIRATION_DAYS = 7;
export const SMILE_TEST_UUID_EXPIRATION_MS =
  SMILE_TEST_UUID_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;
export const SMILE_TEST_UUID_EXPIRED_ERROR_CODE = 'uuid_expired';
export const SMILE_TEST_UUID_NOT_FOUND_ERROR_CODE = 'uuid_not_found';
export const SMILE_TEST_UUID_EXPIRED_MESSAGE = `此微笑测试链接已超过 ${SMILE_TEST_UUID_EXPIRATION_DAYS} 天，请重新开始新的微笑测试`;

export interface SmileTestUuidStatus {
  uuid: string;
  exists: boolean;
  expired: boolean;
  can_write: boolean;
  code: typeof SMILE_TEST_UUID_EXPIRED_ERROR_CODE | typeof SMILE_TEST_UUID_NOT_FOUND_ERROR_CODE | 'uuid_valid';
  created_at: Date | null;
  expires_at: Date | null;
  expiration_days: number;
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

  private sanitizeSystemManagedFields(data: Partial<SmileTestData> & Record<string, any>): Partial<SmileTestData> {
    const {
      created_at,
      updated_at,
      id,
      test_id,
      created_by,
      updated_by,
      is_deleted,
      deleted_at,
      ...safeData
    } = data || {};

    return safeData;
  }

  private buildUuidStatus(
    uuid: string,
    smileTest: Pick<SmileTest, 'created_at'> | null,
    now: Date = new Date(),
  ): SmileTestUuidStatus {
    const createdAt = smileTest?.created_at ? new Date(smileTest.created_at) : null;
    const hasValidCreatedAt = createdAt && !Number.isNaN(createdAt.getTime());
    // Temporarily disable smile test expiration gating. Keep the old calculation
    // commented here so we can restore the time limit quickly if needed later.
    // const expiresAt = hasValidCreatedAt
    //   ? new Date(createdAt.getTime() + SMILE_TEST_UUID_EXPIRATION_MS)
    //   : null;
    const expiresAt = null;
    // const expired = Boolean(expiresAt && now.getTime() > expiresAt.getTime());
    const expired = false;

    return {
      uuid,
      exists: Boolean(smileTest),
      expired,
      can_write: Boolean(smileTest) ? !expired : true,
      code: !smileTest
        ? SMILE_TEST_UUID_NOT_FOUND_ERROR_CODE
        : expired
          ? SMILE_TEST_UUID_EXPIRED_ERROR_CODE
          : 'uuid_valid',
      created_at: hasValidCreatedAt ? createdAt : null,
      expires_at: expiresAt,
      expiration_days: SMILE_TEST_UUID_EXPIRATION_DAYS,
    };
  }

  private assertSmileTestWritable(
    smileTest: Pick<SmileTest, 'uuid' | 'created_at'>,
    now: Date = new Date(),
  ): SmileTestUuidStatus {
    const status = this.buildUuidStatus(smileTest.uuid, smileTest, now);
    // Temporarily disable write blocking by smile test age.
    // if (status.expired) {
    //   throw new GoneException({
    //     success: false,
    //     message: SMILE_TEST_UUID_EXPIRED_MESSAGE,
    //     error_code: SMILE_TEST_UUID_EXPIRED_ERROR_CODE,
    //     data: status,
    //   });
    // }
    return status;
  }

  async getUuidStatus(uuid: string, now: Date = new Date()): Promise<SmileTestUuidStatus> {
    const smileTest = await this.findByUuid(uuid);
    return this.buildUuidStatus(uuid, smileTest, now);
  }

  async ensureUuidWritable(uuid: string, now: Date = new Date()): Promise<SmileTestUuidStatus> {
    const smileTest = await this.findByUuid(uuid);
    if (!smileTest) {
      return this.buildUuidStatus(uuid, null, now);
    }

    return this.assertSmileTestWritable(smileTest, now);
  }

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

  async findAll(filters: SmileTestListFilters = {}): Promise<SmileTestListResult> {
    const query = this.smileTestRepository
      .createQueryBuilder('st')
      .select([
        'st.id',
        'st.test_id',
        'st.uuid',
        'st.full_name',
        'st.birth_date',
        'st.phone',
        'st.email',
        'st.line_id',
        'st.city',
        'st.teeth_type',
        'st.considerations',
        'st.improvement_points',
        'st.age',
        'st.gender',
        'st.occupation',
        'st.emergency_contact',
        'st.emergency_phone',
        'st.current_issues',
        'st.test_score',
        'st.confidence_level',
        'st.recommended_treatment',
        'st.estimated_cost',
        'st.test_status',
        'st.appointment_date',
        'st.follow_up_date',
        'st.patient_uuid',
        'st.created_at',
        'st.updated_at',
      ])
      .addSelect((subQuery) => {
        return subQuery
          .select('MAX(COALESCE(sf.upload_time, sf.created_at))')
          .from('smile_test_files', 'sf')
          .where('sf.smile_test_uuid = st.uuid')
          .andWhere('sf.status = :fileStatus')
          .andWhere('sf.upload_type = :uploadType');
      }, 'latest_image_upload_time')
      .where('st.is_deleted = :isDeleted', { isDeleted: 0 })
      .andWhere(new Brackets((qb) => {
        qb.where(`
          EXISTS (
            SELECT 1
            FROM smile_test_files sf
            WHERE sf.smile_test_uuid = st.uuid
              AND sf.status = :fileStatus
              AND sf.upload_type = :uploadType
          )
        `, {
          fileStatus: 'normal',
          uploadType: 'smile_test',
        })
          .orWhere(`NULLIF(st.teeth_image_1, '') IS NOT NULL`)
          .orWhere(`NULLIF(st.teeth_image_2, '') IS NOT NULL`)
          .orWhere(`NULLIF(st.teeth_image_3, '') IS NOT NULL`)
          .orWhere(`NULLIF(st.teeth_image_4, '') IS NOT NULL`);
      }));

    if (filters.status) {
      query.andWhere('st.test_status = :status', { status: filters.status });
    }

    if (filters.date_from) {
      query.andWhere('st.created_at >= :dateFrom', { dateFrom: `${filters.date_from} 00:00:00` });
    }

    if (filters.date_to) {
      query.andWhere('st.created_at <= :dateTo', { dateTo: `${filters.date_to} 23:59:59` });
    }

    if (filters.account_keyword) {
      const keyword = `%${filters.account_keyword.trim()}%`;
      query.andWhere(new Brackets((qb) => {
        qb.where('st.phone LIKE :keyword', { keyword })
          .orWhere('st.email LIKE :keyword', { keyword })
          .orWhere('st.line_id LIKE :keyword', { keyword });
      }));
    }

    if (filters.patient_name) {
      query.andWhere('st.full_name LIKE :patientNameKeyword', {
        patientNameKeyword: `%${filters.patient_name.trim()}%`,
      });
    }

    if (filters.bound_state === 'bound') {
      query.andWhere(`NULLIF(st.patient_uuid, '') IS NOT NULL`);
    }

    if (filters.bound_state === 'unbound') {
      query.andWhere(new Brackets((qb) => {
        qb.where('st.patient_uuid IS NULL').orWhere(`NULLIF(st.patient_uuid, '') IS NULL`);
      }));
    }

    if (filters.sort_by === 'image_upload_time') {
      query.orderBy('latest_image_upload_time', 'DESC').addOrderBy('st.created_at', 'DESC');
    } else if (filters.sort_by === 'updated_at') {
      query.orderBy('st.updated_at', 'DESC').addOrderBy('st.created_at', 'DESC');
    } else {
      query.orderBy('st.created_at', 'DESC');
    }

    const total = await query.clone().getCount();

    if (filters.page && filters.page_size) {
      const page = Math.max(1, Number(filters.page));
      const pageSize = Math.max(1, Number(filters.page_size));
      query.skip((page - 1) * pageSize).take(pageSize);
    }

    const { entities, raw } = await query.getRawAndEntities();
    const data = entities.map((item, index) => ({
      ...item,
      latest_image_upload_time: raw[index]?.latest_image_upload_time ?? null,
    }));

    return {
      data,
      total,
    };
  }

  async create(data: SmileTestData): Promise<SmileTest> {
    const safeData = this.sanitizeSystemManagedFields(data as any);
    const smileTest = this.smileTestRepository.create({
      ...safeData,
      test_status: safeData.test_status || 'pending',
      is_deleted: 0
    });
    return await this.smileTestRepository.save(smileTest);
  }

  async createPatient(data: {
    full_name: string;
    birth_date?: string | null;
    gender?: string | null;
    phone?: string | null;
    email?: string | null;
    line_id?: string | null;
    city?: string | null;
    assigned_doctor_uuid: string;
  }): Promise<Patient> {
    const entity = this.patientRepository.create({
      full_name: data.full_name,
      birth_date: (data.birth_date as any) || null,
      gender: (data.gender as any) || null,
      phone: data.phone || null,
      email: data.email || null,
      line_id: data.line_id || null,
      city: data.city || null,
      assigned_doctor_uuid: data.assigned_doctor_uuid,
      is_deleted: 0 as any,
    } as Partial<Patient> as Patient);
    const saved = await this.patientRepository.save(entity);
    const patient = (await this.patientRepository.findOne({ where: { id: saved.id } })) as Patient;
    return patient;
  }

  async updateByUuid(uuid: string, data: Partial<SmileTestData>): Promise<SmileTest | null> {
    const existing = await this.findByUuid(uuid);
    if (!existing) {
      return null;
    }

    this.assertSmileTestWritable(existing);
    return await this.saveUpdatedSmileTest(existing, data);
  }

  async updateByUuidWithoutExpiryCheck(
    uuid: string,
    data: Partial<SmileTestData>,
  ): Promise<SmileTest | null> {
    const existing = await this.findByUuid(uuid);
    if (!existing) {
      return null;
    }

    return await this.saveUpdatedSmileTest(existing, data);
  }

  async updateByTestId(testId: string, data: Partial<SmileTestData>): Promise<SmileTest | null> {
    const existing = await this.findByTestId(testId);
    if (!existing) {
      return null;
    }

    this.assertSmileTestWritable(existing);
    return await this.saveUpdatedSmileTest(existing, data);
  }

  async saveOrUpdateByUuid(uuid: string, data: SmileTestData): Promise<SmileTest> {
    const safeData = this.sanitizeSystemManagedFields(data as any);
    const existing = await this.findByUuid(uuid);
    if (existing) {
      this.assertSmileTestWritable(existing);
      Object.assign(existing, safeData);
      return await this.smileTestRepository.save(existing);
    } else {
      return await this.create({
        ...safeData,
        uuid: uuid
      });
    }
  }

  private async saveUpdatedSmileTest(
    existing: SmileTest,
    data: Partial<SmileTestData>,
  ): Promise<SmileTest> {
    Object.assign(existing, this.sanitizeSystemManagedFields(data as any));
    return await this.smileTestRepository.save(existing);
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

  // 同时创建 Patient 与 SmileTest（原子操作）
  async createWithPatient(payload: {
    full_name: string;
    birth_date?: string | null;
    gender?: string | null;
    phone?: string | null;
    email?: string | null;
    line_id?: string | null;
    city?: string | null;
    assigned_doctor_uuid: string;
  }): Promise<SmileTestWithRelations> {
    const { assigned_doctor_uuid, ...data } = payload;

    return await this.smileTestRepository.manager.transaction(async (manager) => {
      const patientRepo = manager.getRepository(Patient);
      const smileRepo = manager.getRepository(SmileTest);
      const adminRepo = manager.getRepository(AdminUser);
      const clinicRepo = manager.getRepository(Clinic);

      // 创建患者
      const patientEntity = patientRepo.create({
        full_name: data.full_name,
        birth_date: (data.birth_date as any) || null,
        gender: (data.gender as any) || null,
        phone: data.phone || null,
        email: data.email || null,
        line_id: data.line_id || null,
        city: data.city || null,
        assigned_doctor_uuid: assigned_doctor_uuid,
        is_deleted: 0 as any,
      } as Partial<Patient> as Patient);
      const savedPatient = (await patientRepo.save(patientEntity)) as Patient;
      // 重新查询以获得触发器生成的 uuid（某些数据库驱动不会把触发器字段返回到实体）
      const patient = (await patientRepo.findOne({ where: { id: savedPatient.id } })) as Patient;
      if (!patient || !patient.uuid) {
        throw new Error('Failed to create patient or missing uuid');
      }

      // 创建微笑测试
      const smileEntity = smileRepo.create({
        full_name: data.full_name,
        birth_date: (data.birth_date as any) || null,
        gender: (data.gender as any) || null,
        phone: data.phone || null,
        email: data.email || null,
        line_id: data.line_id || null,
        city: data.city || null,
        patient_uuid: patient.uuid,
        is_deleted: 0 as any,
      } as Partial<SmileTest> as SmileTest);
      const smileTest = (await smileRepo.save(smileEntity)) as SmileTest;

      // 补充 doctor 与 clinic
      let doctor: AdminUser | null = null;
      let clinic: Clinic | null = null;
      try {
        doctor = await adminRepo.findOne({ where: { uuid: assigned_doctor_uuid, is_deleted: 0 } });
        if (doctor && (doctor as any).department) {
          clinic = await clinicRepo.findOne({ where: { uuid: (doctor as any).department, is_deleted: 0 } });
        }
      } catch {}

      return { smileTest, patient, doctor, clinic } as SmileTestWithRelations;
    });
  }

  // 通过医生信息查询该医生的所有患者及其最新微笑测试
  async findByDoctorWithPatients(identifier: DoctorIdentifier): Promise<SmileTestWithRelations[]> {
    // 定位医生
    let doctor: AdminUser | null = null;
    if (identifier.uuid) {
      doctor = await this.adminUserRepository.findOne({ where: { uuid: identifier.uuid, is_deleted: 0, role: 'doctor' } });
      // 若按角色未找到，放宽条件再查一次（兼容历史数据）
      if (!doctor) {
        doctor = await this.adminUserRepository.findOne({ where: { uuid: identifier.uuid, is_deleted: 0 } });
      }
    } else if (identifier.email) {
      doctor = await this.adminUserRepository.findOne({ where: { email: identifier.email, is_deleted: 0, role: 'doctor' } });
    } else if (identifier.username) {
      doctor = await this.adminUserRepository.findOne({ where: { username: identifier.username, is_deleted: 0, role: 'doctor' } });
    }

    // 该医生关联的诊所（可选）
    let clinic: Clinic | null = null;
    try {
      if (doctor && (doctor as any).department) {
        clinic = await this.clinicRepository.findOne({ where: { uuid: (doctor as any).department, is_deleted: 0 } });
      }
    } catch (e) {
      clinic = null;
    }

    // 查询所有关联患者
    let patients: Patient[] = [];
    const targetDoctorUuid = doctor?.uuid || identifier.uuid; // 若未找到医生也用传入 uuid 作为匹配
    if (targetDoctorUuid) {
      patients = await this.patientRepository.find({ 
        where: { assigned_doctor_uuid: targetDoctorUuid as string, is_deleted: 0 },
        order: { created_at: 'DESC' } // 按创建日期降序排序，最新的在最上面
      });
    }

    const results: SmileTestWithRelations[] = [];

    for (const patient of patients) {
      if (!patient.uuid) continue;
      // 找该患者最新的一条微笑测试，以创建时间定义“最新资料”
      const smileTest = await this.smileTestRepository.findOne({
        where: { patient_uuid: patient.uuid as string, is_deleted: 0 },
        order: { created_at: 'DESC' as any },
      });

      if (!smileTest || !smileTest.uuid) {
        continue; // 没有微笑测试则跳过
      }

      // 通过已有的方法，按 smile_test 的 uuid 获取完整关联信息
      const full = await this.findByUuidWithRelations(smileTest.uuid);
      if (full) {
        // 覆盖 doctor/clinic（以防 findByUuidWithRelations 无法取到）
        results.push({
          smileTest: full.smileTest,
          patient: full.patient,
          doctor: full.doctor || doctor || null,
          clinic: full.clinic || clinic || null,
        });
      }
    }

    // 后台主列表统一按微笑测试创建时间排序，避免旧资料因补件上浮
    results.sort((a, b) => {
      const dateA = new Date(a.smileTest.created_at).getTime();
      const dateB = new Date(b.smileTest.created_at).getTime();
      return dateB - dateA;
    });

    return results;
  }
} 
