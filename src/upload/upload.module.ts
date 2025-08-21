import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { UploadConfigService } from './upload-config.service';
import { FileUpload, UploadSession } from '../entities/file-upload.entity';
import * as multer from 'multer';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileUpload, UploadSession]),
    MulterModule.register({
      storage: multer.memoryStorage(), // 使用内存存储，由我们自己处理文件保存
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
        files: 1, // 一次只允许上传一个文件
      },
      fileFilter: (req, file, callback) => {
        // 基本的文件类型检查，具体验证在服务中处理
        const allowedMimes = [
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
          'text/csv',
          'application/octet-stream', // 允许二进制流
        ];
        
        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error(`不支持的文件类型: ${file.mimetype}`), false);
        }
      },
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService, UploadConfigService],
  exports: [UploadService, UploadConfigService],
})
export class UploadModule {}