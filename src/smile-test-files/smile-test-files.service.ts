import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SmileTestFiles } from '../entities/smile-test-files.entity';
import { SmileTest } from '../entities/smile-test.entity';

export interface SmileTestFileData {
  uuid?: string;
  smile_test_uuid: string;
  file_name?: string;
  file_type?: string;
  file_data?: string;
  upload_type: 'smile_test' | 'oral_scan';
  status?: 'normal' | 'deleted';
  created_by?: string;
  updated_by?: string;
}

@Injectable()
export class SmileTestFilesService {
  constructor(
    @InjectRepository(SmileTestFiles)
    private smileTestFilesRepo: Repository<SmileTestFiles>,
    @InjectRepository(SmileTest)
    private smileTestRepo: Repository<SmileTest>,
  ) {}

  /**
   * 创建文件记录
   */
  async create(data: SmileTestFileData): Promise<SmileTestFiles> {
    // 验证微笑测试是否存在
    const smileTest = await this.smileTestRepo.findOne({ 
      where: { uuid: data.smile_test_uuid } 
    });
    
    if (!smileTest) {
      throw new Error('SmileTest not found');
    }

    const fileRecord = this.smileTestFilesRepo.create(data);
    return await this.smileTestFilesRepo.save(fileRecord);
  }

  /**
   * 根据UUID查找文件（包括旧API的文件）
   */
  async findByUuid(uuid: string): Promise<SmileTestFiles | null> {
    // 先尝试从新表查找
    const newFile = await this.smileTestFilesRepo.findOne({ 
      where: { uuid, status: 'normal' } 
    });
    
    if (newFile) {
      return newFile;
    }

    // 如果是旧API的文件UUID，从旧表查找
    if (uuid.startsWith('legacy_')) {
      const parts = uuid.split('_');
      if (parts.length >= 3) {
        const smileTestUuid = parts[1];
        const fieldName = parts[2];
        
        const smileTest = await this.smileTestRepo.findOne({
          where: { uuid: smileTestUuid }
        });

        if (smileTest) {
          if (fieldName === 'allergies' && smileTest.allergies) {
            try {
              const allergiesData = JSON.parse(smileTest.allergies);
              if (allergiesData && allergiesData.name && allergiesData.data) {
                const virtualFile = new SmileTestFiles();
                virtualFile.uuid = uuid;
                virtualFile.smile_test_uuid = smileTestUuid;
                virtualFile.file_name = allergiesData.name;
                virtualFile.file_type = allergiesData.type || 'application/octet-stream';
                virtualFile.file_data = allergiesData.data;
                virtualFile.upload_type = 'oral_scan';
                virtualFile.upload_time = smileTest.updated_at || smileTest.created_at;
                virtualFile.status = 'normal';
                virtualFile.created_at = smileTest.created_at;
                virtualFile.updated_at = smileTest.updated_at;
                
                return virtualFile;
              }
            } catch (error) {
              console.error('解析allergies数据失败:', error);
            }
          } else if (fieldName.startsWith('teeth_image_') && smileTest[fieldName]) {
            const index = fieldName.split('_')[2];
            const virtualFile = new SmileTestFiles();
            virtualFile.uuid = uuid;
            virtualFile.smile_test_uuid = smileTestUuid;
            virtualFile.file_name = `teeth_image_${index}.jpg`;
            virtualFile.file_type = 'image/jpeg';
            virtualFile.file_data = smileTest[fieldName];
            virtualFile.upload_type = 'smile_test';
            virtualFile.upload_time = smileTest.updated_at || smileTest.created_at;
            virtualFile.status = 'normal';
            virtualFile.created_at = smileTest.created_at;
            virtualFile.updated_at = smileTest.updated_at;
            
            return virtualFile;
          }
        }
      }
    }

    return null;
  }

  /**
   * 根据微笑测试UUID获取文件列表（包括旧API的文件）
   */
  async findBySmileTestUuid(smileTestUuid: string): Promise<SmileTestFiles[]> {
    // 从新表获取文件
    const newFiles = await this.smileTestFilesRepo.find({
      where: { 
        smile_test_uuid: smileTestUuid, 
        status: 'normal' 
      },
      order: { upload_time: 'DESC' }
    });

    // 从旧表获取文件（allergies字段和teeth_image字段）
    const smileTest = await this.smileTestRepo.findOne({
      where: { uuid: smileTestUuid }
    });

    const oldFiles: SmileTestFiles[] = [];
    
    if (smileTest) {
      // 处理allergies文件
      if (smileTest.allergies) {
        try {
          const allergiesData = JSON.parse(smileTest.allergies);
          if (allergiesData && allergiesData.name && allergiesData.data) {
            // 创建虚拟的SmileTestFiles对象
            const virtualFile = new SmileTestFiles();
            virtualFile.uuid = `legacy_${smileTestUuid}_allergies`;
            virtualFile.smile_test_uuid = smileTestUuid;
            virtualFile.file_name = allergiesData.name;
            virtualFile.file_type = allergiesData.type || 'application/octet-stream';
            virtualFile.file_data = allergiesData.data;
            virtualFile.upload_type = 'oral_scan';
            virtualFile.upload_time = smileTest.updated_at || smileTest.created_at;
            virtualFile.status = 'normal';
            virtualFile.created_at = smileTest.created_at;
            virtualFile.updated_at = smileTest.updated_at;
            
            oldFiles.push(virtualFile);
          }
        } catch (error) {
          console.error('解析allergies数据失败:', error);
        }
      }

      // 处理teeth_image_1-4图片
      const teethImageFields = ['teeth_image_1', 'teeth_image_2', 'teeth_image_3', 'teeth_image_4'];
      teethImageFields.forEach((field, index) => {
        const imageData = smileTest[field];
        if (imageData) {
          try {
            // 创建虚拟的SmileTestFiles对象
            const virtualFile = new SmileTestFiles();
            virtualFile.uuid = `legacy_${smileTestUuid}_${field}`;
            virtualFile.smile_test_uuid = smileTestUuid;
            virtualFile.file_name = `teeth_image_${index + 1}.jpg`;
            virtualFile.file_type = 'image/jpeg';
            virtualFile.file_data = imageData;
            virtualFile.upload_type = 'smile_test';
            virtualFile.upload_time = smileTest.updated_at || smileTest.created_at;
            virtualFile.status = 'normal';
            virtualFile.created_at = smileTest.created_at;
            virtualFile.updated_at = smileTest.updated_at;
            
            oldFiles.push(virtualFile);
          } catch (error) {
            console.error(`处理${field}数据失败:`, error);
          }
        }
      });
    }

    // 合并并排序
    const allFiles = [...newFiles, ...oldFiles];
    allFiles.sort((a, b) => {
      const dateA = new Date(a.upload_time || a.created_at);
      const dateB = new Date(b.upload_time || b.created_at);
      return dateB.getTime() - dateA.getTime();
    });

    return allFiles;
  }

  /**
   * 根据微笑测试UUID和上传类型获取文件列表
   */
  async findBySmileTestUuidAndType(
    smileTestUuid: string, 
    uploadType: 'smile_test' | 'oral_scan'
  ): Promise<SmileTestFiles[]> {
    return await this.smileTestFilesRepo.find({
      where: { 
        smile_test_uuid: smileTestUuid, 
        upload_type: uploadType,
        status: 'normal' 
      },
      order: { upload_time: 'DESC' }
    });
  }

  /**
   * 更新文件记录
   */
  async updateByUuid(uuid: string, data: Partial<SmileTestFileData>): Promise<SmileTestFiles | null> {
    const fileRecord = await this.findByUuid(uuid);
    if (!fileRecord) {
      return null;
    }

    Object.assign(fileRecord, data);
    return await this.smileTestFilesRepo.save(fileRecord);
  }

  /**
   * 删除文件（软删除）
   */
  async deleteByUuid(uuid: string): Promise<boolean> {
    const fileRecord = await this.findByUuid(uuid);
    if (!fileRecord) {
      return false;
    }

    fileRecord.status = 'deleted';
    await this.smileTestFilesRepo.save(fileRecord);
    return true;
  }

  /**
   * 保存微笑测试图片
   */
  async saveSmileTestImage(
    smileTestUuid: string, 
    imageIndex: number, 
    imageData: string,
    fileName?: string
  ): Promise<SmileTestFiles> {
    // 先删除同类型的旧文件
    await this.smileTestFilesRepo.update(
      { 
        smile_test_uuid: smileTestUuid, 
        upload_type: 'smile_test',
        status: 'normal' 
      },
      { status: 'deleted' }
    );

    // 创建新文件记录
    return await this.create({
      smile_test_uuid: smileTestUuid,
      file_name: fileName || `teeth_image_${imageIndex}.jpg`,
      file_type: 'image/jpeg',
      file_data: imageData,
      upload_type: 'smile_test',
      status: 'normal'
    });
  }

  /**
   * 保存口扫文件
   */
  async saveOralScanFile(
    smileTestUuid: string, 
    fileData: string,
    fileName: string,
    fileType: string
  ): Promise<SmileTestFiles> {
    // 先删除同类型的旧文件
    await this.smileTestFilesRepo.update(
      { 
        smile_test_uuid: smileTestUuid, 
        upload_type: 'oral_scan',
        status: 'normal' 
      },
      { status: 'deleted' }
    );

    // 创建新文件记录
    return await this.create({
      smile_test_uuid: smileTestUuid,
      file_name: fileName,
      file_type: fileType,
      file_data: fileData,
      upload_type: 'oral_scan',
      status: 'normal'
    });
  }

  /**
   * 获取微笑测试的所有图片
   */
  async getSmileTestImages(smileTestUuid: string): Promise<SmileTestFiles[]> {
    return await this.findBySmileTestUuidAndType(smileTestUuid, 'smile_test');
  }

  /**
   * 获取口扫文件
   */
  async getOralScanFile(smileTestUuid: string): Promise<SmileTestFiles | null> {
    const files = await this.findBySmileTestUuidAndType(smileTestUuid, 'oral_scan');
    return files.length > 0 ? files[0] : null;
  }
}
