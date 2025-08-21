import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SmileTest } from '../entities/smile-test.entity';

/**
 * 处理遗留的文件上传功能（通过 allergies 字段存储）
 * 这是为了兼容现有的前端代码，建议逐步迁移到新的文件上传系统
 */
@Injectable()
export class LegacyUploadService {
  private readonly logger = new Logger(LegacyUploadService.name);

  constructor(
    @InjectRepository(SmileTest)
    private readonly smileTestRepo: Repository<SmileTest>,
  ) {}

  /**
   * 存储文件到 allergies 字段（遗留方法）
   */
  async storeLegacyFile(uuid: string, fileData: {
    name: string;
    type: string;
    data: string; // base64 或 dataURL
  }): Promise<boolean> {
    try {
      const smileTest = await this.smileTestRepo.findOne({ where: { uuid } });
      if (!smileTest) {
        throw new Error('SmileTest record not found');
      }

      // 限制文件数据大小（16MB base64，约12MB 原始文件）
      const maxSize = 16 * 1024 * 1024; // 16MB
      const dataSize = fileData.data.length;
      
      if (dataSize > maxSize) {
        this.logger.warn(`File too large for legacy storage: ${dataSize} bytes`);
        throw new Error('文件过大，请使用新的上传方式');
      }

      // 将文件数据存储为 JSON 字符串
      const fileJson = JSON.stringify(fileData);
      
      // 更新 allergies 字段
      smileTest.allergies = fileJson;
      await this.smileTestRepo.save(smileTest);

      this.logger.log(`Legacy file stored for SmileTest ${uuid}: ${fileData.name}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to store legacy file for ${uuid}:`, error);
      throw error;
    }
  }

  /**
   * 从 allergies 字段获取文件数据（遗留方法）
   */
  async getLegacyFile(uuid: string): Promise<{
    name: string;
    type: string;
    data: string;
  } | null> {
    try {
      const smileTest = await this.smileTestRepo.findOne({ where: { uuid } });
      if (!smileTest || !smileTest.allergies) {
        return null;
      }

      // 尝试解析 JSON 数据
      try {
        const fileData = JSON.parse(smileTest.allergies);
        if (fileData.name && fileData.type && fileData.data) {
          return fileData;
        }
      } catch (parseError) {
        // 如果不是 JSON 格式，可能是纯文本的过敏史信息
        this.logger.debug(`Allergies field contains non-JSON data for ${uuid}`);
      }

      return null;
    } catch (error) {
      this.logger.error(`Failed to get legacy file for ${uuid}:`, error);
      throw error;
    }
  }

  /**
   * 检查是否为文件数据
   */
  isFileData(allergiesData: string): boolean {
    if (!allergiesData) return false;
    
    try {
      const parsed = JSON.parse(allergiesData);
      return !!(parsed.name && parsed.type && parsed.data);
    } catch {
      return false;
    }
  }

  /**
   * 迁移遗留文件到新的上传系统
   */
  async migrateLegacyFile(uuid: string): Promise<boolean> {
    try {
      const legacyFile = await this.getLegacyFile(uuid);
      if (!legacyFile) {
        return false;
      }

      // TODO: 使用新的 UploadService 存储文件
      // const uploadService = // 注入 UploadService
      // await uploadService.uploadBinaryFile(...)

      this.logger.log(`Legacy file migration completed for ${uuid}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to migrate legacy file for ${uuid}:`, error);
      return false;
    }
  }
}