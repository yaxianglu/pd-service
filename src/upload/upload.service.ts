import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileUpload, UploadSession } from '../entities/file-upload.entity';
import { UploadConfigService } from './upload-config.service';
import * as fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

export interface InitializeUploadDto {
  uploadId: string;
  fileName: string;
  fileSize: number;
  totalChunks: number;
  contentType: string;
  smileTestUuid?: string | null;
  uploadType: string;
  metadata?: any;
}

export interface UploadChunkDto {
  uploadId: string;
  chunkIndex: number;
  totalChunks: number;
  chunk: Buffer;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    @InjectRepository(FileUpload)
    private readonly fileUploadRepo: Repository<FileUpload>,
    @InjectRepository(UploadSession)
    private readonly uploadSessionRepo: Repository<UploadSession>,
    private readonly configService: UploadConfigService,
  ) {
    // Start cleanup task
    this.startCleanupTask();
  }

  /**
   * 初始化分块上传
   */
  async initializeUpload(dto: InitializeUploadDto): Promise<UploadSession> {
    const { uploadId, fileName, fileSize, totalChunks, contentType, smileTestUuid, uploadType, metadata } = dto;

    // 验证参数
    if (!uploadId || !fileName || !fileSize || !contentType) {
      throw new BadRequestException('缺少必要参数');
    }

    // 验证文件类型和大小
    if (!this.configService.isAllowedType(contentType)) {
      throw new BadRequestException(`不支持的文件类型: ${contentType}`);
    }

    if (!this.configService.isValidSize(fileSize)) {
      throw new BadRequestException('文件大小超出限制');
    }

    // 检查是否已存在相同的上传会话
    const existing = await this.uploadSessionRepo.findOne({ where: { uploadId } });
    if (existing) {
      throw new BadRequestException('上传会话已存在');
    }

    // 创建临时目录
    const tempDir = this.configService.getTempDir(uploadId);
    await fs.ensureDir(tempDir);

    // 创建上传会话
    const session = this.uploadSessionRepo.create({
      uploadId,
      fileName,
      fileSize,
      contentType,
      totalChunks,
      uploadedChunks: 0,
      uploadedChunkIndexes: '[]',
      smileTestUuid: smileTestUuid || null,
      uploadType,
      metadata: metadata ? JSON.stringify(metadata) : null,
      status: 'initialized',
      tempDir,
      expiresAt: new Date(Date.now() + this.configService.config.sessionExpiry),
    });

    const savedSession = await this.uploadSessionRepo.save(session);
    return savedSession;
  }

  /**
   * 上传分块
   */
  async uploadChunk(dto: UploadChunkDto): Promise<{ success: boolean; chunkIndex: number }> {
    const { uploadId, chunkIndex, totalChunks, chunk } = dto;

    // 获取上传会话
    const session = await this.uploadSessionRepo.findOne({ where: { uploadId } });
    if (!session) {
      throw new BadRequestException('上传会话不存在');
    }

    if (session.status === 'expired' || (session.expiresAt && session.expiresAt < new Date())) {
      throw new BadRequestException('上传会话已过期');
    }

    if (session.totalChunks !== totalChunks) {
      throw new BadRequestException('分块总数不匹配');
    }

    // 保存分块文件
    const chunkPath = this.configService.getChunkPath(uploadId, chunkIndex);
    await fs.writeFile(chunkPath, chunk);

    // 更新上传会话
    const uploadedIndexes = JSON.parse(session.uploadedChunkIndexes) as number[];
    if (!uploadedIndexes.includes(chunkIndex)) {
      uploadedIndexes.push(chunkIndex);
      uploadedIndexes.sort((a, b) => a - b);

      session.uploadedChunkIndexes = JSON.stringify(uploadedIndexes);
      session.uploadedChunks = uploadedIndexes.length;
      session.status = 'uploading';
      
      await this.uploadSessionRepo.save(session);
    }

    this.logger.debug(`Chunk ${chunkIndex} uploaded for session ${uploadId}`);

    return { success: true, chunkIndex };
  }

  /**
   * 完成分块上传
   */
  async finalizeUpload(uploadId: string): Promise<FileUpload> {
    const session = await this.uploadSessionRepo.findOne({ where: { uploadId } });
    if (!session) {
      throw new BadRequestException('上传会话不存在');
    }

    if (session.status === 'expired' || (session.expiresAt && session.expiresAt < new Date())) {
      throw new BadRequestException('上传会话已过期');
    }

    const uploadedIndexes = JSON.parse(session.uploadedChunkIndexes) as number[];
    if (uploadedIndexes.length !== session.totalChunks) {
      throw new BadRequestException(`缺少分块，已上传: ${uploadedIndexes.length}/${session.totalChunks}`);
    }

    // 验证所有分块都已上传
    for (let i = 0; i < session.totalChunks; i++) {
      if (!uploadedIndexes.includes(i)) {
        throw new BadRequestException(`缺少分块 ${i}`);
      }
    }

    try {
      // 合并分块文件并获取二进制数据
      const { fileData, safeFilename } = await this.mergeChunks(session);

      // 创建文件记录并存储二进制数据到数据库
      const fileUpload = this.fileUploadRepo.create({
        uuid: uuidv4(),
        originalName: session.fileName,
        filename: safeFilename,
        filepath: null, // 不再使用文件路径
        data: fileData, // 直接存储二进制数据
        mimetype: session.contentType,
        size: session.fileSize,
        smileTestUuid: session.smileTestUuid || null,
        uploadType: session.uploadType,
        status: 'completed',
        metadata: session.metadata || null,
      });

      const savedFile = await this.fileUploadRepo.save(fileUpload);

      // 更新会话状态
      session.status = 'completed';
      session.finalPath = null; // 不再需要文件路径
      await this.uploadSessionRepo.save(session);

      // 清理临时文件
      await this.cleanupSession(session);

      this.logger.log(`File upload completed to database: ${session.fileName}`);

      return savedFile;
    } catch (error) {
      session.status = 'failed';
      await this.uploadSessionRepo.save(session);
      
      this.logger.error(`Failed to finalize upload ${uploadId}:`, error);
      throw new InternalServerErrorException('文件合并失败');
    }
  }

  /**
   * 二进制直接上传
   */
  async uploadBinaryFile(
    file: Buffer,
    originalName: string,
    mimetype: string,
    options: {
      smileTestUuid?: string | null;
      uploadType: string;
      metadata?: any;
    }
  ): Promise<FileUpload> {
    const { smileTestUuid, uploadType, metadata } = options;

    // 验证文件类型和大小
    if (!this.configService.isAllowedType(mimetype)) {
      throw new BadRequestException(`不支持的文件类型: ${mimetype}`);
    }

    if (!this.configService.isValidSize(file.length)) {
      throw new BadRequestException('文件大小超出限制');
    }

    try {
      // 生成安全的文件名
      const safeFilename = this.configService.generateSafeFilename(originalName, mimetype);

      // 创建文件记录并存储二进制数据到数据库
      const fileUpload = this.fileUploadRepo.create({
        uuid: uuidv4(),
        originalName,
        filename: safeFilename,
        filepath: null, // 不再使用文件路径
        data: file, // 直接存储二进制数据
        mimetype,
        size: file.length,
        smileTestUuid: smileTestUuid || null,
        uploadType,
        status: 'completed',
        metadata: metadata ? JSON.stringify(metadata) : null,
      });

      const savedFile = await this.fileUploadRepo.save(fileUpload);

      this.logger.log(`Binary file uploaded to database: ${originalName}`);

      return savedFile;
    } catch (error) {
      this.logger.error('Failed to upload binary file:', error);
      throw new InternalServerErrorException('文件上传失败');
    }
  }

  /**
   * 合并分块文件
   */
  private async mergeChunks(session: UploadSession): Promise<{ fileData: Buffer; safeFilename: string }> {
    const safeFilename = this.configService.generateSafeFilename(session.fileName, session.contentType);

    try {
      // 收集所有分块数据
      const chunks: Buffer[] = [];
      let totalSize = 0;

      // 按顺序合并分块
      for (let i = 0; i < session.totalChunks; i++) {
        const chunkPath = this.configService.getChunkPath(session.uploadId, i);
        const chunkBuffer = await fs.readFile(chunkPath);
        chunks.push(chunkBuffer);
        totalSize += chunkBuffer.length;
      }

      // 合并所有分块
      const fileData = Buffer.concat(chunks);

      // 验证文件大小
      if (fileData.length !== session.fileSize) {
        throw new Error(`文件大小不匹配，期望: ${session.fileSize}, 实际: ${fileData.length}`);
      }

      return { fileData, safeFilename };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 清理上传会话临时文件
   */
  private async cleanupSession(session: UploadSession): Promise<void> {
    if (session.tempDir && await fs.pathExists(session.tempDir)) {
      try {
        await fs.remove(session.tempDir);
        this.logger.debug(`Cleaned up temp directory: ${session.tempDir}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup temp directory ${session.tempDir}:`, error);
      }
    }
  }

  /**
   * 启动清理任务
   */
  private startCleanupTask(): void {
    setInterval(async () => {
      try {
        await this.cleanupExpiredSessions();
      } catch (error) {
        this.logger.error('Cleanup task failed:', error);
      }
    }, this.configService.config.cleanupInterval);

    this.logger.log('Upload cleanup task started');
  }

  /**
   * 清理过期的上传会话
   */
  private async cleanupExpiredSessions(): Promise<void> {
    const expiredSessions = await this.uploadSessionRepo
      .createQueryBuilder('session')
      .where('session.expiresAt < :now', { now: new Date() })
      .orWhere('session.status = :status', { status: 'failed' })
      .orWhere('session.createdAt < :oldDate', { 
        oldDate: new Date(Date.now() - this.configService.config.sessionExpiry * 2) 
      })
      .getMany();

    for (const session of expiredSessions) {
      await this.cleanupSession(session);
      
      // 更新状态为过期
      if (session.status !== 'completed' && session.status !== 'failed') {
        session.status = 'expired';
        await this.uploadSessionRepo.save(session);
      }
    }

    if (expiredSessions.length > 0) {
      this.logger.log(`Cleaned up ${expiredSessions.length} expired upload sessions`);
    }
  }

  /**
   * 获取文件信息
   */
  async getFileById(id: number): Promise<FileUpload | null> {
    return this.fileUploadRepo.findOne({ where: { id } });
  }

  /**
   * 获取文件信息 by UUID
   */
  async getFileByUuid(uuid: string): Promise<FileUpload | null> {
    return this.fileUploadRepo.findOne({ where: { uuid } });
  }

  /**
   * 根据 smile test UUID 获取文件列表
   */
  async getFilesBySmileTestUuid(smileTestUuid: string): Promise<FileUpload[]> {
    return this.fileUploadRepo.find({ 
      where: { smileTestUuid, status: 'completed' },
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * 删除文件
   */
  async deleteFile(uuid: string): Promise<boolean> {
    const file = await this.getFileByUuid(uuid);
    if (!file) {
      return false;
    }

    try {
      // 删除数据库记录（文件数据也会被删除）
      await this.fileUploadRepo.remove(file);

      this.logger.log(`File deleted from database: ${file.originalName}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete file ${uuid}:`, error);
      return false;
    }
  }
}