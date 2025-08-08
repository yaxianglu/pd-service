import { Controller, Get, Post, Put, Delete, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { SmileTestService, SmileTestData } from './smile-test.service';

@Controller('api/smile-test')
export class SmileTestController {
  constructor(private readonly smileTestService: SmileTestService) {}

  @Get('uuid/:uuid')
  async getSmileTestByUuid(@Param('uuid') uuid: string) {
    try {
      const result = await this.smileTestService.findByUuid(uuid);
      if (!result) {
        return {
          success: true,
          data: null,
          message: 'No data found for this UUID'
        };
      }
      return {
        success: true,
        data: result,
        message: 'Data retrieved successfully'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve data',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('test-id/:testId')
  async getSmileTestByTestId(@Param('testId') testId: string) {
    try {
      const result = await this.smileTestService.findByTestId(testId);
      if (!result) {
        return {
          success: true,
          data: null,
          message: 'No data found for this Test ID'
        };
      }
      return {
        success: true,
        data: result,
        message: 'Data retrieved successfully'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve data',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post()
  async createSmileTest(@Body() data: SmileTestData) {
    try {
      const result = await this.smileTestService.create(data);
      return {
        success: true,
        data: result,
        message: 'Data created successfully'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create data',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put('uuid/:uuid')
  async updateSmileTestByUuid(@Param('uuid') uuid: string, @Body() data: SmileTestData) {
    try {
      const result = await this.smileTestService.saveOrUpdateByUuid(uuid, data);
      return {
        success: true,
        data: result,
        message: 'Data updated successfully'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to update data',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put('test-id/:testId')
  async updateSmileTestByTestId(@Param('testId') testId: string, @Body() data: SmileTestData) {
    try {
      const result = await this.smileTestService.updateByTestId(testId, data);
      if (!result) {
        throw new HttpException(
          {
            success: false,
            message: 'No data found to update'
          },
          HttpStatus.NOT_FOUND
        );
      }
      return {
        success: true,
        data: result,
        message: 'Data updated successfully'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to update data',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete('uuid/:uuid')
  async deleteSmileTestByUuid(@Param('uuid') uuid: string) {
    try {
      const result = await this.smileTestService.deleteByUuid(uuid);
      return {
        success: true,
        data: { deleted: result },
        message: result ? 'Data deleted successfully' : 'No data found to delete'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to delete data',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete('test-id/:testId')
  async deleteSmileTestByTestId(@Param('testId') testId: string) {
    try {
      const result = await this.smileTestService.deleteByTestId(testId);
      return {
        success: true,
        data: { deleted: result },
        message: result ? 'Data deleted successfully' : 'No data found to delete'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to delete data',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 