import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PdfController } from './pdf.controller';
import { PdfConfigService } from './pdf-config.service';

@Module({
  controllers: [PdfController],
  providers: [PdfService, PdfConfigService],
  exports: [PdfService],
})
export class PdfModule {} 