import { IsNumber, IsString, IsOptional, IsUrl, Min, MaxLength } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @MaxLength(10)
  currency: string = 'USD';

  @IsString()
  @MaxLength(500)
  description: string;

  @IsUrl()
  returnUrl: string;

  @IsUrl()
  cancelUrl: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  customId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  dentistId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  patientId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  treatmentId?: string;
} 