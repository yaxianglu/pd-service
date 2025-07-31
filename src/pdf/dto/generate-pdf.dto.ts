import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class MarginDto {
  @IsOptional()
  @IsString()
  top?: string;

  @IsOptional()
  @IsString()
  right?: string;

  @IsOptional()
  @IsString()
  bottom?: string;

  @IsOptional()
  @IsString()
  left?: string;
}

export class PdfOptionsDto {
  @IsOptional()
  @IsEnum(['A4', 'A3', 'Letter', 'Legal'])
  format?: 'A4' | 'A3' | 'Letter' | 'Legal';

  @IsOptional()
  @ValidateNested()
  @Type(() => MarginDto)
  margin?: MarginDto;

  @IsOptional()
  @IsString()
  headerTemplate?: string;

  @IsOptional()
  @IsString()
  footerTemplate?: string;

  @IsOptional()
  displayHeaderFooter?: boolean;

  @IsOptional()
  printBackground?: boolean;

  @IsOptional()
  preferCSSPageSize?: boolean;
}

export class InvoiceItemDto {
  @IsString()
  description: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  amount: number;
}

export class GenerateInvoiceDto {
  @IsString()
  invoiceNumber: string;

  @IsString()
  invoiceDate: string;

  @IsString()
  dueDate: string;

  @IsString()
  patientName: string;

  @IsString()
  patientEmail: string;

  @IsString()
  patientPhone: string;

  @IsString()
  patientAddress: string;

  @IsString()
  dentistName: string;

  @IsString()
  clinicName: string;

  @IsString()
  clinicAddress: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsNumber()
  subtotal: number;

  @IsNumber()
  tax: number;

  @IsNumber()
  total: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PdfOptionsDto)
  options?: PdfOptionsDto;
}

export class TreatmentDto {
  @IsString()
  treatmentType: string;

  @IsString()
  description: string;

  @IsNumber()
  estimatedCost: number;

  @IsString()
  duration: string;

  @IsEnum(['high', 'medium', 'low'])
  priority: 'high' | 'medium' | 'low';
}

export class GenerateTreatmentPlanDto {
  @IsString()
  patientName: string;

  @IsString()
  patientId: string;

  @IsString()
  patientEmail: string;

  @IsString()
  patientPhone: string;

  @IsString()
  patientAddress: string;

  @IsString()
  dentistName: string;

  @IsString()
  clinicName: string;

  @IsString()
  planDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TreatmentDto)
  treatments: TreatmentDto[];

  @IsNumber()
  totalEstimatedCost: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PdfOptionsDto)
  options?: PdfOptionsDto;
}

export class GenerateMedicalReportDto {
  @IsString()
  patientName: string;

  @IsString()
  patientId: string;

  @IsNumber()
  patientAge: number;

  @IsString()
  patientGender: string;

  @IsString()
  reportDate: string;

  @IsString()
  dentistName: string;

  @IsString()
  clinicName: string;

  @IsString()
  diagnosis: string;

  @IsString()
  treatment: string;

  @IsArray()
  @IsString({ each: true })
  recommendations: string[];

  @IsOptional()
  @IsString()
  followUpDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PdfOptionsDto)
  options?: PdfOptionsDto;
}

export class GenerateAppointmentDto {
  @IsString()
  appointmentId: string;

  @IsString()
  appointmentDate: string;

  @IsString()
  appointmentTime: string;

  @IsString()
  patientName: string;

  @IsString()
  patientEmail: string;

  @IsString()
  patientPhone: string;

  @IsString()
  dentistName: string;

  @IsString()
  clinicName: string;

  @IsString()
  clinicAddress: string;

  @IsString()
  treatmentType: string;

  @IsString()
  duration: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PdfOptionsDto)
  options?: PdfOptionsDto;
}

export class GenerateCustomPdfDto {
  @IsString()
  templateName: string;

  @IsOptional()
  data: Record<string, any>;

  @IsOptional()
  @ValidateNested()
  @Type(() => PdfOptionsDto)
  options?: PdfOptionsDto;
}

export class SavePdfDto {
  @IsEnum(['invoice', 'treatment-plan', 'medical-report', 'appointment', 'custom'])
  type: 'invoice' | 'treatment-plan' | 'medical-report' | 'appointment' | 'custom';

  @IsOptional()
  data: any;

  @IsString()
  filename: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PdfOptionsDto)
  options?: PdfOptionsDto;

  @IsOptional()
  @IsString()
  templateName?: string;
} 