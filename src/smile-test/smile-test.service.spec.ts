import { Brackets } from 'typeorm';
import { SmileTestService } from './smile-test.service';

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
    const getManyAndCount = jest.fn().mockResolvedValue([[], 107]);
    const qb = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount,
    };
    smileTestRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await (service as any).findAll({
      status: 'completed',
      account_keyword: 'line-user',
      bound_state: 'unbound',
      date_from: '2026-05-01',
      date_to: '2026-05-31',
      page: 1,
      page_size: 20,
    });

    expect(smileTestRepo.createQueryBuilder).toHaveBeenCalledWith('st');
    expect(qb.orderBy).toHaveBeenCalledWith('st.created_at', 'DESC');
    expect(qb.andWhere).toHaveBeenCalledWith(expect.any(Brackets));
    expect(qb.andWhere).toHaveBeenCalledWith('st.test_status = :status', { status: 'completed' });
    expect(qb.skip).toHaveBeenCalledWith(0);
    expect(qb.take).toHaveBeenCalledWith(20);
    expect(getManyAndCount).toHaveBeenCalled();
    expect(result).toEqual({
      data: [],
      total: 107,
    });
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
});
