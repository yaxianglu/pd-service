import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Req,
  Res,
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { UploadService, InitializeUploadDto } from './upload.service';
import { UploadConfigService } from './upload-config.service';

// 定义文件类型
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

@Controller('api/smile-test/uuid/:uuid/upload-file')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(
    private readonly uploadService: UploadService,
    private readonly configService: UploadConfigService,
  ) {}

  /**
   * 初始化分块上传
   */
  @Post('initialize')
  async initializeUpload(
    @Param('uuid') smileTestUuid: string,
    @Body() body: InitializeUploadDto,
  ) {
    try {
      // 添加 smileTestUuid 到请求体
      const dto: InitializeUploadDto = {
        ...body,
        smileTestUuid,
      };

      const session = await this.uploadService.initializeUpload(dto);

      return {
        success: true,
        message: '上传初始化成功',
        data: {
          uploadId: session.uploadId,
          chunkSize: this.configService.config.chunkSize,
          totalChunks: session.totalChunks,
        },
      };
    } catch (error) {
      this.logger.error(`Initialize upload failed for ${smileTestUuid}:`, error);
      throw new HttpException(
        {
          success: false,
          message: error.message || '初始化失败',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * 上传分块
   */
  @Post('chunk')
  @UseInterceptors(FileInterceptor('chunk'))
  async uploadChunk(
    @Param('uuid') smileTestUuid: string,
    @Body() body: { uploadId: string; chunkIndex: string; totalChunks: string },
    @UploadedFile() file: MulterFile,
  ) {
    try {
      if (!file || !body.uploadId || body.chunkIndex === undefined) {
        throw new Error('缺少必要参数');
      }

      const dto = {
        uploadId: body.uploadId,
        chunkIndex: parseInt(body.chunkIndex),
        totalChunks: parseInt(body.totalChunks),
        chunk: file.buffer,
      };

      const result = await this.uploadService.uploadChunk(dto);

      return {
        success: true,
        message: '分块上传成功',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Chunk upload failed for ${smileTestUuid}:`, error);
      throw new HttpException(
        {
          success: false,
          message: error.message || '分块上传失败',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * 完成分块上传
   */
  @Post('finalize')
  async finalizeUpload(
    @Param('uuid') smileTestUuid: string,
    @Body() body: { uploadId: string },
  ) {
    try {
      if (!body.uploadId) {
        throw new Error('缺少 uploadId');
      }

      const fileUpload = await this.uploadService.finalizeUpload(body.uploadId);

      return {
        success: true,
        message: '文件上传完成',
        data: {
          fileId: fileUpload.uuid,
          filename: fileUpload.originalName,
          size: fileUpload.size,
          contentType: fileUpload.mimetype,
          uploadedAt: fileUpload.createdAt,
        },
      };
    } catch (error) {
      this.logger.error(`Finalize upload failed for ${smileTestUuid}:`, error);
      throw new HttpException(
        {
          success: false,
          message: error.message || '完成上传失败',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 二进制直接上传
   */
  @Post()
  async uploadBinaryFile(
    @Param('uuid') smileTestUuid: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      // 从请求头获取文件信息
      const fileName = req.headers['x-file-name'] as string;
      const fileSize = parseInt(req.headers['x-file-size'] as string);
      const fileType = req.headers['x-file-type'] as string;

      if (!fileName || !fileSize || !fileType) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: '缺少文件信息头',
        });
      }

      // 解码文件名
      const decodedFileName = decodeURIComponent(fileName);

      // 获取元数据
      const metadata: any = {};
      Object.keys(req.headers).forEach((key) => {
        if (key.startsWith('x-metadata-')) {
          const metaKey = key.substring(11); // Remove 'x-metadata-'
          metadata[metaKey] = decodeURIComponent(req.headers[key] as string);
        }
      });

      // 读取请求体（文件二进制数据）
      const chunks: Buffer[] = [];
      let totalSize = 0;

      req.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
        totalSize += chunk.length;

        // 防止过大的文件
        if (totalSize > this.configService.config.maxFileSize) {
          req.destroy();
          return res.status(HttpStatus.PAYLOAD_TOO_LARGE).json({
            success: false,
            message: '文件过大',
          });
        }
      });

      req.on('end', async () => {
        try {
          const fileBuffer = Buffer.concat(chunks);

          // 验证文件大小
          if (fileBuffer.length !== fileSize) {
            return res.status(HttpStatus.BAD_REQUEST).json({
              success: false,
              message: '文件大小不匹配',
            });
          }

          const fileUpload = await this.uploadService.uploadBinaryFile(
            fileBuffer,
            decodedFileName,
            fileType,
            {
              smileTestUuid,
              uploadType: metadata.uploadType || 'staff_file',
              metadata,
            },
          );

          return res.json({
            success: true,
            message: '文件上传成功',
            data: {
              fileId: fileUpload.uuid,
              filename: fileUpload.originalName,
              size: fileUpload.size,
              contentType: fileUpload.mimetype,
              uploadedAt: fileUpload.createdAt,
            },
          });
        } catch (error) {
          this.logger.error(`Binary upload failed for ${smileTestUuid}:`, error);
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || '文件上传失败',
            error: error.message,
          });
        }
      });

      req.on('error', (error) => {
        this.logger.error(`Request error for ${smileTestUuid}:`, error);
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: '请求错误',
          error: error.message,
        });
      });
    } catch (error) {
      this.logger.error(`Binary upload setup failed for ${smileTestUuid}:`, error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '上传失败',
        error: error.message,
      });
    }
  }

  /**
   * 获取文件列表
   */
  @Get('list')
  async getFileList(@Param('uuid') smileTestUuid: string) {
    try {
      const files = await this.uploadService.getFilesBySmileTestUuid(smileTestUuid);

      return {
        success: true,
        data: files.map((file) => ({
          id: file.uuid,
          filename: file.originalName,
          size: file.size,
          contentType: file.mimetype,
          uploadType: file.uploadType,
          uploadedAt: file.createdAt,
        })),
      };
    } catch (error) {
      this.logger.error(`Get file list failed for ${smileTestUuid}:`, error);
      throw new HttpException(
        {
          success: false,
          message: '获取文件列表失败',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 下载文件
   */
  @Get('download/:fileId')
  async downloadFile(
    @Param('uuid') smileTestUuid: string,
    @Param('fileId') fileId: string,
    @Res() res: Response,
  ) {
    try {
      const file = await this.uploadService.getFileByUuid(fileId);
      if (!file || file.smileTestUuid !== smileTestUuid) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: '文件不存在',
        });
      }

      // 检查文件数据是否存在
      if (!file.data) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: '文件数据不存在',
        });
      }

      // 设置响应头
      res.setHeader('Content-Type', file.mimetype);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(file.originalName)}"`,
      );
      res.setHeader('Content-Length', file.size);

      // 直接发送文件数据
      res.send(file.data);
    } catch (error) {
      this.logger.error(`Download failed for ${fileId}:`, error);
      if (!res.headersSent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: '下载失败',
          error: error.message,
        });
      }
    }
  }

  /**
   * 删除文件
   */
  @Delete(':fileId')
  async deleteFile(
    @Param('uuid') smileTestUuid: string,
    @Param('fileId') fileId: string,
  ) {
    try {
      const file = await this.uploadService.getFileByUuid(fileId);
      if (!file || file.smileTestUuid !== smileTestUuid) {
        throw new HttpException(
          {
            success: false,
            message: '文件不存在',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const deleted = await this.uploadService.deleteFile(fileId);
      if (!deleted) {
        throw new HttpException(
          {
            success: false,
            message: '删除失败',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        success: true,
        message: '文件已删除',
      };
    } catch (error) {
      this.logger.error(`Delete failed for ${fileId}:`, error);
      throw new HttpException(
        {
          success: false,
          message: error.message || '删除失败',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}