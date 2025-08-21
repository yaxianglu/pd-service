import { Injectable } from '@nestjs/common';
import * as path from 'path';

@Injectable()
export class UploadConfigService {
  // 文件上传配置
  readonly config = {
    // 最大文件大小 (200MB)
    maxFileSize: 200 * 1024 * 1024,
    
    // 分块大小 (5MB)
    chunkSize: 5 * 1024 * 1024,
    
    // 允许的文件类型
    allowedTypes: [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ],
    
    // 临时存储目录（仅用于分块上传临时文件）
    tempDir: process.env.UPLOAD_TEMP_DIR || path.join(process.cwd(), 'temp', 'uploads'),
    
    // 清理间隔 (1小时)
    cleanupInterval: 60 * 60 * 1000,
    
    // 上传超时 (30分钟)
    uploadTimeout: 30 * 60 * 1000,
    
    // 会话过期时间 (2小时)
    sessionExpiry: 2 * 60 * 60 * 1000
  };

  /**
   * 验证文件类型
   */
  isAllowedType(mimetype: string): boolean {
    return this.config.allowedTypes.includes(mimetype);
  }

  /**
   * 验证文件大小
   */
  isValidSize(size: number): boolean {
    return size <= this.config.maxFileSize && size > 0;
  }

  /**
   * 获取文件扩展名
   */
  getFileExtension(mimetype: string, originalName?: string): string {
    // 优先从原始文件名获取扩展名
    if (originalName && originalName.includes('.')) {
      const ext = originalName.split('.').pop()?.toLowerCase();
      if (ext) return `.${ext}`;
    }

    // 从 MIME 类型推断扩展名
    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'application/pdf': '.pdf',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
      'application/vnd.ms-excel': '.xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
      'text/plain': '.txt',
      'text/csv': '.csv'
    };

    return mimeToExt[mimetype] || '.bin';
  }

  /**
   * 生成安全的文件名
   */
  generateSafeFilename(originalName: string, mimetype: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = this.getFileExtension(mimetype, originalName);
    
    // 清理原始文件名，保留安全字符
    const safeName = originalName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 50); // 限制长度

    return `${timestamp}_${random}_${safeName}${ext}`;
  }

  /**
   * 获取临时目录路径
   */
  getTempDir(uploadId: string): string {
    return path.join(this.config.tempDir, uploadId);
  }


  /**
   * 获取分块文件路径
   */
  getChunkPath(uploadId: string, chunkIndex: number): string {
    return path.join(this.getTempDir(uploadId), `chunk_${chunkIndex}`);
  }
}