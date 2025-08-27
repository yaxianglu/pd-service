import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  Res, 
  HttpException, 
  HttpStatus 
} from '@nestjs/common';
import { Response } from 'express';
import { SmileTestFilesService } from './smile-test-files.service';

@Controller('api/smile-test-files')
export class SmileTestFilesController {
  constructor(private readonly smileTestFilesService: SmileTestFilesService) {}

  /**
   * 根据微笑测试UUID获取文件列表
   */
  @Get('smile-test/:uuid')
  async getFilesBySmileTestUuid(@Param('uuid') uuid: string) {
    try {
      const files = await this.smileTestFilesService.findBySmileTestUuid(uuid);
      
      // 过滤掉文件数据，只返回元数据
      const fileList = files.map(file => ({
        uuid: file.uuid,
        file_name: file.file_name,
        file_type: file.file_type,
        upload_type: file.upload_type,
        upload_time: file.upload_time,
        status: file.status,
        created_at: file.created_at
      }));

      return {
        success: true,
        data: fileList,
        message: '获取文件列表成功'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '获取文件列表失败',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 根据文件UUID下载文件
   */
  @Get('download/:uuid')
  async downloadFile(@Param('uuid') uuid: string, @Res() res: Response) {
    try {
      const file = await this.smileTestFilesService.findByUuid(uuid);
      
      if (!file) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: '文件不存在'
        });
      }

      if (!file.file_data) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: '文件数据不存在'
        });
      }

      // 设置响应头
      res.setHeader('Content-Type', file.file_type || 'application/octet-stream');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(file.file_name || 'file')}"`,
      );

      // 发送文件数据
      res.send(file.file_data);
    } catch (error) {
      if (!res.headersSent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: '下载失败',
          error: error.message
        });
      }
    }
  }

  /**
   * 上传微笑测试图片
   */
  @Post('smile-test/:uuid/image/:index')
  async uploadSmileTestImage(
    @Param('uuid') uuid: string,
    @Param('index') index: string,
    @Body() data: { image_data: string; file_name?: string }
  ) {
    try {
      const imageIndex = parseInt(index);
      if (isNaN(imageIndex) || imageIndex < 1 || imageIndex > 4) {
        throw new Error('图片索引必须在1-4之间');
      }

      if (!data.image_data) {
        throw new Error('图片数据不能为空');
      }

      const fileRecord = await this.smileTestFilesService.saveSmileTestImage(
        uuid,
        imageIndex,
        data.image_data,
        data.file_name
      );

      return {
        success: true,
        data: {
          uuid: fileRecord.uuid,
          file_name: fileRecord.file_name,
          upload_type: fileRecord.upload_type,
          upload_time: fileRecord.upload_time
        },
        message: '图片上传成功'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '图片上传失败',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 上传口扫文件
   */
  @Post('smile-test/:uuid/oral-scan')
  async uploadOralScanFile(
    @Param('uuid') uuid: string,
    @Body() data: { 
      file_data: string; 
      file_name: string; 
      file_type: string;
    }
  ) {
    try {
      if (!data.file_data) {
        throw new Error('文件数据不能为空');
      }

      if (!data.file_name) {
        throw new Error('文件名不能为空');
      }

      const fileRecord = await this.smileTestFilesService.saveOralScanFile(
        uuid,
        data.file_data,
        data.file_name,
        data.file_type
      );

      return {
        success: true,
        data: {
          uuid: fileRecord.uuid,
          file_name: fileRecord.file_name,
          upload_type: fileRecord.upload_type,
          upload_time: fileRecord.upload_time
        },
        message: '口扫文件上传成功'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '口扫文件上传失败',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 删除文件
   */
  @Delete(':uuid')
  async deleteFile(@Param('uuid') uuid: string) {
    try {
      const success = await this.smileTestFilesService.deleteByUuid(uuid);
      
      if (!success) {
        return {
          success: false,
          message: '文件不存在或已删除'
        };
      }

      return {
        success: true,
        message: '文件删除成功'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '文件删除失败',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 获取微笑测试的所有图片
   */
  @Get('smile-test/:uuid/images')
  async getSmileTestImages(@Param('uuid') uuid: string) {
    try {
      const images = await this.smileTestFilesService.getSmileTestImages(uuid);
      
      // 只返回图片的元数据，不返回文件数据
      const imageList = images.map(image => ({
        uuid: image.uuid,
        file_name: image.file_name,
        file_type: image.file_type,
        upload_time: image.upload_time,
        created_at: image.created_at
      }));

      return {
        success: true,
        data: imageList,
        message: '获取图片列表成功'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '获取图片列表失败',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 获取口扫文件信息
   */
  @Get('smile-test/:uuid/oral-scan')
  async getOralScanFile(@Param('uuid') uuid: string) {
    try {
      const file = await this.smileTestFilesService.getOralScanFile(uuid);
      
      if (!file) {
        return {
          success: false,
          message: '没有找到口扫文件'
        };
      }

      // 只返回文件元数据，不返回文件数据
      return {
        success: true,
        data: {
          uuid: file.uuid,
          file_name: file.file_name,
          file_type: file.file_type,
          upload_time: file.upload_time,
          created_at: file.created_at
        },
        message: '获取口扫文件信息成功'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '获取口扫文件信息失败',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
