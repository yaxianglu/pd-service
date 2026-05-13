import { SmileTestFilesService } from './smile-test-files.service';

const createRepo = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  query: jest.fn(),
});

describe('SmileTestFilesService', () => {
  let filesRepo: ReturnType<typeof createRepo>;
  let smileTestRepo: ReturnType<typeof createRepo>;
  let service: SmileTestFilesService;

  beforeEach(() => {
    filesRepo = createRepo();
    smileTestRepo = createRepo();
    service = new SmileTestFilesService(filesRepo as any, smileTestRepo as any);
  });

  it('creates a file record without mutating smile_test.updated_at for queue ordering', async () => {
    const smileTest = { uuid: 'smile-1', updated_at: new Date('2026-05-10T10:00:00Z') };
    const createdRecord = {
      smile_test_uuid: 'smile-1',
      file_name: '微笑测试图片组',
      file_type: 'application/json',
      file_data: '{}',
      upload_type: 'smile_test',
      status: 'normal',
    };
    const savedRecord = { ...createdRecord, uuid: 'file-1', upload_time: new Date('2026-05-13T10:00:00Z') };

    smileTestRepo.findOne.mockResolvedValue(smileTest);
    filesRepo.create.mockReturnValue(createdRecord);
    filesRepo.save.mockResolvedValue(savedRecord);

    const result = await service.create({
      smile_test_uuid: 'smile-1',
      file_name: '微笑测试图片组',
      file_type: 'application/json',
      file_data: '{}',
      upload_type: 'smile_test',
      status: 'normal',
    } as any);

    expect(result).toEqual(savedRecord);
    expect(filesRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      smile_test_uuid: 'smile-1',
      upload_type: 'smile_test',
    }));
    expect(smileTestRepo.save).not.toHaveBeenCalled();
  });
});
