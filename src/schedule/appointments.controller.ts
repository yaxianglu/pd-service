import { Body, Controller, Get, Post, Put, Param, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';

@Controller('api/appointments')
export class AppointmentsController {
  constructor(private readonly service: AppointmentsService) {}

  @Post()
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Get('by-month')
  listByMonth(
    @Query('year') year: string, 
    @Query('month') month: string,
    @Query('patient_uuid') patientUuid?: string,
    @Query('doctor_uuid') doctorUuid?: string
  ) {
    return this.service.findByMonth(Number(year), Number(month), patientUuid, doctorUuid);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.service.update(id, dto);
  }
}


