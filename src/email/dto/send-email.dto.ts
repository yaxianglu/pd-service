import { IsEmail, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AttachmentDto {
  @IsString()
  filename: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  contentType?: string;
}

export class SendEmailDto {
  @IsEmail({}, { each: true })
  @IsArray()
  to: string[];

  @IsString()
  subject: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  html?: string;

  @IsOptional()
  @IsString()
  template?: string;

  @IsOptional()
  templateData?: Record<string, any>;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];

  @IsOptional()
  @IsEmail({}, { each: true })
  @IsArray()
  cc?: string[];

  @IsOptional()
  @IsEmail({}, { each: true })
  @IsArray()
  bcc?: string[];
} 