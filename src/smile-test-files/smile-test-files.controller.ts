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
import { SmileTestService } from '../smile-test/smile-test.service';

@Controller('api/smile-test-files')
export class SmileTestFilesController {
  constructor(
    private readonly smileTestFilesService: SmileTestFilesService,
    private readonly smileTestService: SmileTestService,
  ) {}

  /**
   * 测试端点
   */
  @Get('test')
  async test() {
    return {
      success: true,
      message: 'API工作正常',
      timestamp: new Date().toISOString()
    };
  }

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
        smile_test_uuid: file.smile_test_uuid,
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
      console.log(`尝试下载文件: ${uuid}`);
      const file = await this.smileTestFilesService.findByUuid(uuid);
      
      if (!file) {
        console.log(`文件不存在: ${uuid}`);
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: '文件不存在'
        });
      }
      
      console.log(`找到文件: ${file.file_name}, 类型: ${file.file_type}`);

      if (!file.file_data) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: '文件数据不存在'
        });
      }

      // 特殊处理微笑测试图片组
      if (file.file_name === '微笑测试图片组' && file.upload_type === 'smile_test') {
        console.log('🔍 开始处理微笑测试图片组下载...');
        try {
          const imageGroup = JSON.parse(file.file_data);
          console.log(`📊 图片组包含 ${imageGroup.images?.length || 0} 张图片`);
          
          if (imageGroup.images && imageGroup.images.length > 0) {
            // 创建ZIP文件
            const JSZip = require('jszip');
            const zip = new JSZip();
            
            // 添加每张图片到ZIP
            imageGroup.images.forEach((img, index) => {
              if (img.data) {
                console.log(`📸 添加图片 ${img.index} 到ZIP`);
                // 移除data URL前缀，只保留base64数据
                const base64Data = img.data.replace(/^data:image\/[a-z]+;base64,/, '');
                zip.file(`teeth_image_${img.index}.jpg`, base64Data, {base64: true});
              }
            });
            
            // 生成ZIP文件
            console.log('📦 生成ZIP文件...');
            const zipBuffer = await zip.generateAsync({type: 'nodebuffer'});
            console.log(`✅ ZIP文件生成成功，大小: ${zipBuffer.length} bytes`);
            
            // 生成带日期的文件名
            const uploadDate = file.upload_time || file.created_at || new Date();
            const dateStr = uploadDate.toISOString().split('T')[0]; // 格式: YYYY-MM-DD
            const fileName = `微笑测试_${dateStr}.zip`;
            
            console.log('📅 文件名生成信息:', {
              upload_time: file.upload_time,
              created_at: file.created_at,
              uploadDate: uploadDate,
              dateStr: dateStr,
              fileName: fileName
            });
            
            // 设置响应头
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader(
              'Content-Disposition',
              `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
            );
            
            console.log('📤 发送ZIP文件...');
            // 发送ZIP文件
            res.send(zipBuffer);
            return;
          } else {
            console.log('⚠️  图片组中没有找到图片数据');
          }
        } catch (error) {
          console.error('❌ 处理微笑测试图片组失败:', error);
          // 如果ZIP创建失败，回退到普通下载
        }
      }

      // 普通文件下载（包括口扫文件）
      // 检查是否为 data URL 格式（base64 编码）
      let fileBuffer: Buffer;
      if (file.file_data.startsWith('data:')) {
        // 提取 base64 数据部分
        const base64Match = file.file_data.match(/^data:[^;]+;base64,(.+)$/);
        if (base64Match && base64Match[1]) {
          console.log('📦 检测到 data URL 格式，解码为二进制数据');
          fileBuffer = Buffer.from(base64Match[1], 'base64');
          console.log(`✅ Base64 解码成功，二进制大小: ${fileBuffer.length} bytes`);
        } else {
          // 如果没有匹配到 base64，尝试直接提取逗号后的部分
          const commaIndex = file.file_data.indexOf(',');
          if (commaIndex >= 0) {
            const base64Data = file.file_data.substring(commaIndex + 1);
            fileBuffer = Buffer.from(base64Data, 'base64');
            console.log(`✅ 提取 base64 数据并解码，二进制大小: ${fileBuffer.length} bytes`);
          } else {
            // 如果不是 data URL 格式，直接当作字符串处理
            console.log('⚠️  无法解析 data URL，使用原始字符串');
            fileBuffer = Buffer.from(file.file_data, 'utf8');
          }
        }
      } else {
        // 不是 data URL 格式，直接使用原始数据
        console.log('📄 非 data URL 格式，直接使用原始数据');
        fileBuffer = Buffer.from(file.file_data, 'utf8');
      }

      // 设置响应头
      res.setHeader('Content-Type', file.file_type || 'application/octet-stream');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename*=UTF-8''${encodeURIComponent(file.file_name || 'file')}`,
      );

      // 检查文件大小，对大文件进行特殊处理
      const fileSize = fileBuffer.length;
      console.log(`📊 文件大小: ${fileSize} bytes`);
      
      if (fileSize > 10 * 1024 * 1024) { // 大于10MB
        console.log('⚠️  大文件检测，使用流式下载');
        
        // 对于大文件，分块发送
        const chunkSize = 1024 * 1024; // 1MB chunks
        const chunks = Math.ceil(fileSize / chunkSize);
        
        for (let i = 0; i < chunks; i++) {
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, fileSize);
          const chunk = fileBuffer.slice(start, end);
          
          if (i === 0) {
            // 第一个块
            res.write(chunk);
          } else {
            // 后续块
            res.write(chunk);
          }
          
          // 添加小延迟避免阻塞
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        res.end();
      } else {
        // 小文件直接发送二进制数据
        console.log('✅ 小文件，直接发送二进制数据');
        res.send(fileBuffer);
      }
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
      await this.smileTestService.ensureUuidWritable(uuid);

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
      if (error instanceof HttpException) {
        throw error;
      }
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
   * 上传微笑测试图片组
   */
  @Post('smile-test/:uuid/image-group')
  async uploadSmileTestImageGroup(
    @Param('uuid') uuid: string,
    @Body() data: { image_group: any }
  ) {
    try {
      await this.smileTestService.ensureUuidWritable(uuid);

      if (!data.image_group || !data.image_group.images) {
        throw new Error('图片组数据不能为空');
      }

      const fileRecord = await this.smileTestFilesService.saveSmileTestImageGroup(
        uuid,
        data.image_group
      );

      return {
        success: true,
        data: {
          uuid: fileRecord.uuid,
          smile_test_uuid: fileRecord.smile_test_uuid,
          file_name: fileRecord.file_name,
          upload_type: fileRecord.upload_type,
          upload_time: fileRecord.upload_time
        },
        message: '图片组上传成功'
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: '图片组上传失败',
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
      await this.smileTestService.ensureUuidWritable(uuid);

      if (!data.file_data) {
        throw new Error('文件数据不能为空');
      }

      if (!data.file_name) {
        throw new Error('文件名不能为空');
      }

      // 检查文件大小（base64编码会增加33%大小）
      const base64Data = data.file_data.replace(/^data:.*,/, '');
      const fileSizeInBytes = (base64Data.length * 3) / 4;
      const maxSize = 200 * 1024 * 1024; // 200MB

      if (fileSizeInBytes > maxSize) {
        throw new Error(`文件大小超过限制。当前大小: ${Math.round(fileSizeInBytes / 1024 / 1024)}MB，最大允许: ${maxSize / 1024 / 1024}MB`);
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
          upload_time: fileRecord.upload_time,
          file_size: fileSizeInBytes
        },
        message: '口扫文件上传成功'
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
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
      console.log(`🗑️ 删除文件请求: ${uuid}`);
      
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
      console.error('删除文件时发生错误:', error);
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
   * 获取微笑测试的特定图片
   */
  @Get('smile-test/:uuid/image/:index')
  async getSmileTestImage(@Param('uuid') uuid: string, @Param('index') index: string) {
    try {
      const imageIndex = parseInt(index);
      if (isNaN(imageIndex) || imageIndex < 1 || imageIndex > 4) {
        throw new Error('图片索引必须在1-4之间');
      }

      const image = await this.smileTestFilesService.getSmileTestImage(uuid, imageIndex);
      
      if (!image) {
        return {
          success: false,
          message: '没有找到指定图片'
        };
      }

      // 返回图片数据
      return {
        success: true,
        data: {
          uuid: image.uuid,
          file_name: image.file_name,
          file_type: image.file_type,
          file_data: image.file_data,
          upload_time: image.upload_time,
          created_at: image.created_at
        },
        message: '获取图片成功'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '获取图片失败',
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
