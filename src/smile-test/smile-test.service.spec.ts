import { Brackets } from 'typeorm';
import {
  SMILE_TEST_UUID_EXPIRATION_DAYS,
  SmileTestService,
} from './smile-test.service';

const createRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('SmileTestService', () => {
  let smileTestRepo: ReturnType<typeof createRepo>;
  let patientRepo: ReturnType<typeof createRepo>;
  let adminUserRepo: ReturnType<typeof createRepo>;
  let clinicRepo: ReturnType<typeof createRepo>;
  let service: SmileTestService;

  beforeEach(() => {
    smileTestRepo = createRepo();
    patientRepo = createRepo();
    adminUserRepo = createRepo();
    clinicRepo = createRepo();

    service = new SmileTestService(
      smileTestRepo as any,
      patientRepo as any,
      adminUserRepo as any,
      clinicRepo as any,
    );
  });

  it('uses query builder filters and only returns valid smile test list records', async () => {
    const getCount = jest.fn().mockResolvedValue(107);
    const getRawAndEntities = jest.fn().mockResolvedValue({
      entities: [{
        uuid: 'smile-1',
        created_at: new Date('2026-05-10T09:00:00Z'),
      }],
      raw: [{
        latest_image_upload_time: '2026-05-11T10:00:00.000Z',
      }],
    });
    const qb = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      clone: jest.fn().mockReturnValue({
        getCount,
      }),
      getRawAndEntities,
    };
    smileTestRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await (service as any).findAll({
      status: 'completed',
      account_keyword: 'line-user',
      patient_name: '劉子渝',
      bound_state: 'unbound',
      date_from: '2026-05-01',
      date_to: '2026-05-31',
      page: 1,
      page_size: 20,
    });

    expect(smileTestRepo.createQueryBuilder).toHaveBeenCalledWith('st');
    expect(qb.orderBy).toHaveBeenCalledWith('st.created_at', 'DESC');
    expect(qb.andWhere).toHaveBeenCalledWith(expect.any(Brackets));
    expect(qb.andWhere).toHaveBeenCalledTimes(7);
    expect(qb.andWhere).toHaveBeenCalledWith('st.test_status = :status', { status: 'completed' });
    expect(qb.skip).toHaveBeenCalledWith(0);
    expect(qb.take).toHaveBeenCalledWith(20);
    expect(qb.clone).toHaveBeenCalled();
    expect(getCount).toHaveBeenCalled();
    expect(getRawAndEntities).toHaveBeenCalled();
    expect(result).toEqual({
      data: [{
        uuid: 'smile-1',
        created_at: new Date('2026-05-10T09:00:00Z'),
        latest_image_upload_time: '2026-05-11T10:00:00.000Z',
      }],
      total: 107,
    });
  });

  it('sorts smile test list by latest image upload time when requested', async () => {
    const getCount = jest.fn().mockResolvedValue(12);
    const getRawAndEntities = jest.fn().mockResolvedValue({
      entities: [],
      raw: [],
    });
    const qb = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      clone: jest.fn().mockReturnValue({
        getCount,
      }),
      getRawAndEntities,
    };
    smileTestRepo.createQueryBuilder.mockReturnValue(qb);

    await (service as any).findAll({
      sort_by: 'image_upload_time',
      page: 1,
      page_size: 50,
    });

    expect(qb.addSelect).toHaveBeenCalled();
    expect(qb.orderBy).toHaveBeenCalledWith('latest_image_upload_time', 'DESC');
    expect(qb.addOrderBy).toHaveBeenCalledWith('st.created_at', 'DESC');
  });

  it('sorts doctor patient results by smile test created_at instead of updated_at', async () => {
    const doctor = { uuid: 'doctor-1', department: null, is_deleted: 0, role: 'doctor' };
    const patientA = { uuid: 'patient-a', created_at: new Date('2026-05-10T09:00:00Z') };
    const patientB = { uuid: 'patient-b', created_at: new Date('2026-05-12T09:00:00Z') };
    const smileA = {
      uuid: 'smile-a',
      patient_uuid: 'patient-a',
      created_at: new Date('2026-05-10T09:00:00Z'),
      updated_at: new Date('2026-05-13T12:00:00Z'),
    };
    const smileB = {
      uuid: 'smile-b',
      patient_uuid: 'patient-b',
      created_at: new Date('2026-05-12T09:00:00Z'),
      updated_at: new Date('2026-05-12T09:30:00Z'),
    };

    adminUserRepo.findOne
      .mockResolvedValueOnce(doctor);
    patientRepo.find.mockResolvedValue([patientA, patientB]);
    smileTestRepo.findOne
      .mockResolvedValueOnce(smileA)
      .mockResolvedValueOnce(smileB);

    jest.spyOn(service, 'findByUuidWithRelations')
      .mockResolvedValueOnce({
        smileTest: smileA as any,
        patient: patientA as any,
        doctor: null,
        clinic: null,
      })
      .mockResolvedValueOnce({
        smileTest: smileB as any,
        patient: patientB as any,
        doctor: null,
        clinic: null,
      });

    const result = await service.findByDoctorWithPatients({ uuid: 'doctor-1' });

    expect(smileTestRepo.findOne).toHaveBeenNthCalledWith(1, expect.objectContaining({
      where: { patient_uuid: 'patient-a', is_deleted: 0 },
      order: { created_at: 'DESC' },
    }));
    expect(smileTestRepo.findOne).toHaveBeenNthCalledWith(2, expect.objectContaining({
      where: { patient_uuid: 'patient-b', is_deleted: 0 },
      order: { created_at: 'DESC' },
    }));
    expect(result.map((item) => item.smileTest.uuid)).toEqual(['smile-b', 'smile-a']);
  });

  it('does not allow clients to overwrite smile test created_at when updating by uuid', async () => {
    const originalCreatedAt = new Date(Date.now() - (24 * 60 * 60 * 1000));
    const forgedCreatedAt = new Date('2025-12-15T22:54:01Z');
    const existing = {
      uuid: 'smile-immutable-created-at',
      created_at: originalCreatedAt,
      updated_at: originalCreatedAt,
      full_name: '龔達鈞',
    };

    jest.spyOn(service, 'findByUuid').mockResolvedValue(existing as any);
    smileTestRepo.save.mockImplementation(async (entity) => entity);

    const result = await service.saveOrUpdateByUuid('smile-immutable-created-at', {
      full_name: '龔達鈞-更新後',
      created_at: forgedCreatedAt as any,
    } as any);

    expect(smileTestRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      uuid: 'smile-immutable-created-at',
      full_name: '龔達鈞-更新後',
      created_at: originalCreatedAt,
    }));
    expect(result).toEqual(expect.objectContaining({
      created_at: originalCreatedAt,
    }));
  });

  it('does not allow clients to preset smile test created_at when creating records', async () => {
    const forgedCreatedAt = new Date('2025-12-15T22:54:01Z');

    smileTestRepo.create.mockImplementation((payload) => payload);
    smileTestRepo.save.mockImplementation(async (entity) => entity);

    await service.create({
      uuid: 'new-smile-test',
      full_name: '新用戶',
      created_at: forgedCreatedAt as any,
    } as any);

    expect(smileTestRepo.create).toHaveBeenCalledWith(expect.not.objectContaining({
      created_at: forgedCreatedAt,
    }));
  });

  it('keeps smile test links writable when they are less than seven days old', async () => {
    const createdAt = new Date(Date.now() - (3 * 24 * 60 * 60 * 1000));
    jest.spyOn(service, 'findByUuid').mockResolvedValue({
      uuid: 'recent-smile',
      created_at: createdAt,
      full_name: '七天内用户',
    } as any);
    smileTestRepo.save.mockImplementation(async (entity) => entity);

    await expect(service.saveOrUpdateByUuid('recent-smile', {
      full_name: '七天内用户-更新',
    } as any)).resolves.toEqual(expect.objectContaining({
      uuid: 'recent-smile',
      full_name: '七天内用户-更新',
    }));
  });

  it('keeps uuid writable when the smile test was created more than seven days ago because the time limit is disabled', async () => {
    const createdAt = new Date('2026-05-01T09:00:00Z');
    jest.spyOn(service, 'findByUuid').mockResolvedValue({
      uuid: 'expired-smile',
      created_at: createdAt,
    } as any);

    const result = await service.getUuidStatus(
      'expired-smile',
      new Date(createdAt.getTime() + ((SMILE_TEST_UUID_EXPIRATION_DAYS + 1) * 24 * 60 * 60 * 1000)),
    );

    expect(result).toEqual(expect.objectContaining({
      uuid: 'expired-smile',
      exists: true,
      expired: false,
      can_write: true,
      code: 'uuid_valid',
      expiration_days: SMILE_TEST_UUID_EXPIRATION_DAYS,
    }));
  });

  it('allows updating an existing smile test even when it was created more than seven days ago', async () => {
    const createdAt = new Date(Date.now() - ((SMILE_TEST_UUID_EXPIRATION_DAYS + 1) * 24 * 60 * 60 * 1000));
    jest.spyOn(service, 'findByUuid').mockResolvedValue({
      uuid: 'expired-smile',
      created_at: createdAt,
      full_name: '旧链接用户',
    } as any);

    smileTestRepo.save.mockImplementation(async (entity) => entity);

    await expect(service.saveOrUpdateByUuid('expired-smile', {
      full_name: '新名字',
    } as any)).resolves.toEqual(expect.objectContaining({
      uuid: 'expired-smile',
      full_name: '新名字',
    }));
  });

  it('allows backend binding updates after the uuid has expired', async () => {
    const createdAt = new Date(Date.now() - ((SMILE_TEST_UUID_EXPIRATION_DAYS + 1) * 24 * 60 * 60 * 1000));
    const existing = {
      uuid: 'expired-smile-for-binding',
      created_at: createdAt,
      patient_uuid: null,
      full_name: '旧链接用户',
    };

    jest.spyOn(service, 'findByUuid').mockResolvedValue(existing as any);
    smileTestRepo.save.mockImplementation(async (entity) => entity);

    await expect(service.updateByUuidWithoutExpiryCheck('expired-smile-for-binding', {
      patient_uuid: 'patient-uuid-1',
    })).resolves.toEqual(expect.objectContaining({
      uuid: 'expired-smile-for-binding',
      patient_uuid: 'patient-uuid-1',
    }));
  });

  it('still creates a new smile test when uuid does not exist yet', async () => {
    jest.spyOn(service, 'findByUuid').mockResolvedValue(null);
    smileTestRepo.create.mockImplementation((payload) => payload);
    smileTestRepo.save.mockImplementation(async (entity) => entity);

    const result = await service.saveOrUpdateByUuid('brand-new-smile', {
      full_name: '新用户',
      test_status: 'in_progress',
    } as any);

    expect(smileTestRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      uuid: 'brand-new-smile',
      full_name: '新用户',
      test_status: 'in_progress',
    }));
    expect(result).toEqual(expect.objectContaining({
      uuid: 'brand-new-smile',
      full_name: '新用户',
    }));
  });
});
