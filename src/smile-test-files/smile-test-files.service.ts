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

    // 生成唯一的UUID
    const { v4: uuidv4 } = require('uuid');
    const uuid = uuidv4();
    
    console.log(`🆕 创建新文件记录，UUID: ${uuid}, 文件名: ${data.file_name}`);

    const fileRecord = this.smileTestFilesRepo.create({
      ...data,
      uuid: uuid,
      upload_time: new Date()
    });
    
    return await this.smileTestFilesRepo.save(fileRecord);
  }

  /**
   * 根据UUID查找文件（包括旧API的文件）
   */
  async findByUuid(uuid: string): Promise<SmileTestFiles | null> {
    console.log(`🔍 查找文件UUID: ${uuid}`);
    
    // 先尝试从新表查找
    const newFile = await this.smileTestFilesRepo.findOne({ 
      where: { uuid, status: 'normal' } 
    });
    
    if (newFile) {
      console.log(`✅ 在新表中找到文件: ${newFile.file_name}`);
      return newFile;
    } else {
      console.log(`❌ 在新表中未找到文件UUID: ${uuid}`);
    }

    // 如果是旧API的文件UUID，从旧表查找
    if (uuid.startsWith('legacy_')) {
      const parts = uuid.split('_');
      if (parts.length >= 3) {
        const smileTestUuid = parts[1];
        // 处理包含下划线的字段名，如 teeth_images_group
        const fieldName = parts.slice(2).join('_');
        
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
          } else if (fieldName === 'teeth_images_group') {
            console.log('处理微笑测试图片组');
            const teethImageFields = ['teeth_image_1', 'teeth_image_2', 'teeth_image_3', 'teeth_image_4'];
            const hasTeethImages = teethImageFields.some(field => smileTest[field]);
            
            if (hasTeethImages) {
              // 创建图片组的虚拟文件对象
              const virtualFile = new SmileTestFiles();
              virtualFile.uuid = uuid;
              virtualFile.smile_test_uuid = smileTestUuid;
              virtualFile.file_name = '微笑测试图片组';
              virtualFile.file_type = 'image/jpeg';
              // 将所有图片数据合并为一个JSON字符串
              const imageGroup = {
                images: teethImageFields.map((field, index) => ({
                  index: index + 1,
                  field: field,
                  data: smileTest[field] || null
                })).filter(img => img.data)
              };
              virtualFile.file_data = JSON.stringify(imageGroup);
              virtualFile.upload_type = 'smile_test';
              virtualFile.upload_time = smileTest.updated_at || smileTest.created_at;
              virtualFile.status = 'normal';
              virtualFile.created_at = smileTest.created_at;
              virtualFile.updated_at = smileTest.updated_at;
              
              return virtualFile;
            } else {
              console.log('没有找到微笑测试图片数据');
            }
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

    console.log(`📊 新表中找到 ${newFiles.length} 个文件`);
    newFiles.forEach(file => {
      console.log(`  - ${file.file_name} (${file.upload_type}) - ${file.uuid}`);
    });

    // 检查新表中是否有微笑测试文件
    const hasNewSmileTestFiles = newFiles.some(file => file.upload_type === 'smile_test');
    console.log(`🔍 新表中是否有微笑测试文件: ${hasNewSmileTestFiles}`);

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

      // 只有在新表中没有微笑测试文件时，才返回legacy的图片组
      if (!hasNewSmileTestFiles) {
        const teethImageFields = ['teeth_image_1', 'teeth_image_2', 'teeth_image_3', 'teeth_image_4'];
        const hasTeethImages = teethImageFields.some(field => smileTest[field]);
        
        if (hasTeethImages) {
          try {
            console.log('📦 新表中没有微笑测试文件，返回legacy图片组');
            // 创建一组微笑测试图片的虚拟文件对象
            const virtualFile = new SmileTestFiles();
            virtualFile.uuid = `legacy_${smileTestUuid}_teeth_images_group`;
            virtualFile.smile_test_uuid = smileTestUuid;
            virtualFile.file_name = '微笑测试图片组';
            virtualFile.file_type = 'image/jpeg';
            // 将所有图片数据合并为一个JSON字符串
            const imageGroup = {
              images: teethImageFields.map((field, index) => ({
                index: index + 1,
                field: field,
                data: smileTest[field] || null
              })).filter(img => img.data)
            };
            virtualFile.file_data = JSON.stringify(imageGroup);
            virtualFile.upload_type = 'smile_test';
            virtualFile.upload_time = smileTest.updated_at || smileTest.created_at;
            virtualFile.status = 'normal';
            virtualFile.created_at = smileTest.created_at;
            virtualFile.updated_at = smileTest.updated_at;
            
            oldFiles.push(virtualFile);
          } catch (error) {
            console.error('处理微笑测试图片组失败:', error);
          }
        }
      } else {
        console.log('✅ 新表中有微笑测试文件，跳过legacy图片组');
      }
    }

    // 合并并排序
    const allFiles = [...newFiles, ...oldFiles];
    allFiles.sort((a, b) => {
      const dateA = new Date(a.upload_time || a.created_at);
      const dateB = new Date(b.upload_time || b.created_at);
      return dateB.getTime() - dateA.getTime();
    });

    console.log(`📋 最终返回 ${allFiles.length} 个文件`);
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
    console.log(`🗑️ 尝试删除文件: ${uuid}`);
    
    const fileRecord = await this.findByUuid(uuid);
    if (!fileRecord) {
      console.log('❌ 文件不存在');
      return false;
    }

    console.log(`✅ 找到文件，执行软删除: ${fileRecord.file_name}`);
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
    console.log(`🆕 保存微笑测试图片，索引: ${imageIndex}`);
    
    // 先查找是否已有微笑测试图片组
    const existingGroup = await this.smileTestFilesRepo.findOne({
      where: { 
        smile_test_uuid: smileTestUuid, 
        upload_type: 'smile_test',
        status: 'normal'
      }
    });
    
    if (existingGroup) {
      console.log('📦 找到现有图片组，更新图片数据');
      
      // 解析现有的图片组数据
      let imageGroup;
      try {
        imageGroup = JSON.parse(existingGroup.file_data);
      } catch (error) {
        console.log('⚠️ 现有数据格式错误，创建新的图片组');
        imageGroup = { images: [] };
      }
      
      // 更新指定索引的图片
      const existingImageIndex = imageGroup.images.findIndex(img => img.index === imageIndex);
      if (existingImageIndex >= 0) {
        imageGroup.images[existingImageIndex].data = imageData;
      } else {
        imageGroup.images.push({
          index: imageIndex,
          field: `teeth_image_${imageIndex}`,
          data: imageData
        });
      }
      
      // 更新文件数据
      existingGroup.file_data = JSON.stringify(imageGroup);
      existingGroup.upload_time = new Date();
      
      return await this.smileTestFilesRepo.save(existingGroup);
    } else {
      console.log('🆕 创建新的微笑测试图片组');
      
      // 创建新的图片组
      const imageGroup = {
        images: [{
          index: imageIndex,
          field: `teeth_image_${imageIndex}`,
          data: imageData
        }]
      };
      
      return await this.create({
        smile_test_uuid: smileTestUuid,
        file_name: '微笑测试图片组',
        file_type: 'application/json',
        file_data: JSON.stringify(imageGroup),
        upload_type: 'smile_test',
        status: 'normal'
      });
    }
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
    // 每次上传都创建新的记录，不删除旧文件
    console.log(`🆕 创建新的口扫文件记录: ${fileName}`);
    
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
   * 获取微笑测试的特定图片
   */
  async getSmileTestImage(smileTestUuid: string, imageIndex: number): Promise<SmileTestFiles | null> {
    console.log(`🔍 查找微笑测试图片: ${smileTestUuid}, 索引: ${imageIndex}`);
    
    // 先查找新表中的图片组
    const files = await this.findBySmileTestUuidAndType(smileTestUuid, 'smile_test');
    const imageGroup = files.find(file => file.file_name === '微笑测试图片组');
    
    if (imageGroup && imageGroup.file_data) {
      console.log('📦 找到图片组，解析图片数据');
      try {
        const groupData = JSON.parse(imageGroup.file_data);
        const targetImage = groupData.images?.find(img => img.index === imageIndex);
        
        if (targetImage && targetImage.data) {
          console.log(`✅ 在图片组中找到索引 ${imageIndex} 的图片`);
          
          // 创建虚拟文件对象
          const virtualFile = new SmileTestFiles();
          virtualFile.uuid = `${imageGroup.uuid}_image_${imageIndex}`;
          virtualFile.smile_test_uuid = smileTestUuid;
          virtualFile.file_name = `teeth_image_${imageIndex}.jpg`;
          virtualFile.file_type = 'image/jpeg';
          virtualFile.file_data = targetImage.data;
          virtualFile.upload_type = 'smile_test';
          virtualFile.upload_time = imageGroup.upload_time;
          virtualFile.status = 'normal';
          virtualFile.created_at = imageGroup.created_at;
          virtualFile.updated_at = imageGroup.updated_at;
          
          return virtualFile;
        }
      } catch (error) {
        console.error('解析图片组数据失败:', error);
      }
    }
    
    // 如果新表中没有，查找legacy数据
    console.log('🔍 新表中没有找到，查找legacy数据...');
    const smileTest = await this.smileTestRepo.findOne({
      where: { uuid: smileTestUuid }
    });
    
    if (!smileTest) {
      console.log('❌ 没有找到微笑测试记录');
      return null;
    }
    
    const fieldName = `teeth_image_${imageIndex}`;
    const legacyData = smileTest[fieldName];
    
    if (!legacyData) {
      console.log(`❌ Legacy数据中没有找到 ${fieldName}`);
      return null;
    }
    
    console.log(`✅ 在legacy数据中找到图片: ${fieldName}`);
    
    // 创建虚拟文件对象
    const virtualFile = new SmileTestFiles();
    virtualFile.uuid = `legacy_${smileTestUuid}_${fieldName}`;
    virtualFile.smile_test_uuid = smileTestUuid;
    virtualFile.file_name = `teeth_image_${imageIndex}.jpg`;
    virtualFile.file_type = 'image/jpeg';
    virtualFile.file_data = legacyData;
    virtualFile.upload_type = 'smile_test';
    virtualFile.upload_time = smileTest.updated_at || smileTest.created_at;
    virtualFile.status = 'normal';
    virtualFile.created_at = smileTest.created_at;
    virtualFile.updated_at = smileTest.updated_at;
    
    return virtualFile;
  }

  /**
   * 获取口扫文件
   */
  async getOralScanFile(smileTestUuid: string): Promise<SmileTestFiles | null> {
    const files = await this.findBySmileTestUuidAndType(smileTestUuid, 'oral_scan');
    return files.length > 0 ? files[0] : null;
  }
}
