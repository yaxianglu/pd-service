import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum ClinicType {
  GENERAL = 'general',
  SPECIALIZED = 'specialized',
  COSMETIC = 'cosmetic',
  ORTHODONTIC = 'orthodontic',
  PEDIATRIC = 'pediatric',
  OTHER = 'other'
}

export enum ClinicStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  CLOSED = 'closed'
}

export enum FacilityLevel {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  LUXURY = 'luxury'
}

@Entity('clinics')
export class Clinic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
  @Index('IDX_clinics_clinic_id')
  clinic_id: string | null;

  @Column({ type: 'char', length: 36, nullable: true, unique: true })
  @Index('IDX_clinics_uuid')
  uuid: string | null;

  @Column({ type: 'varchar', length: 200 })
  @Index('IDX_clinics_clinic_name')
  clinic_name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Index('IDX_clinics_clinic_code')
  clinic_code: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  business_license: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tax_id: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index('IDX_clinics_city')
  city: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index('IDX_clinics_district')
  district: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postal_code: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index('IDX_clinics_province')
  province: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, default: '台湾' })
  country: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  fax: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  website: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  line_id: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  wechat_id: string | null;

  @Column({ type: 'text', nullable: true })
  business_hours: string | null;

  @Column({ type: 'date', nullable: true })
  opening_date: Date | null;

  @Column({ 
    type: 'enum', 
    enum: ClinicType, 
    nullable: true 
  })
  @Index('IDX_clinics_clinic_type')
  clinic_type: ClinicType | null;

  @Column({ type: 'text', nullable: true })
  specialties: string | null;

  @Column({ type: 'text', nullable: true })
  insurance_accepted: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  owner_name: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  owner_phone: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  owner_email: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  chief_doctor: string | null;

  @Column({ type: 'int', nullable: true })
  doctor_count: number | null;

  @Column({ type: 'int', nullable: true })
  staff_count: number | null;

  @Column({ 
    type: 'enum', 
    enum: FacilityLevel, 
    nullable: true 
  })
  facility_level: FacilityLevel | null;

  @Column({ type: 'text', nullable: true })
  equipment_list: string | null;

  @Column({ type: 'boolean', nullable: true })
  parking_available: boolean | null;

  @Column({ type: 'boolean', nullable: true })
  wheelchair_accessible: boolean | null;

  @Column({ type: 'boolean', nullable: true })
  wifi_available: boolean | null;

  @Column({ type: 'text', nullable: true })
  services_offered: string | null;

  @Column({ type: 'text', nullable: true })
  languages_spoken: string | null;

  @Column({ type: 'boolean', nullable: true, default: true })
  appointment_required: boolean | null;

  @Column({ type: 'boolean', nullable: true })
  emergency_service: boolean | null;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  @Index('IDX_clinics_rating')
  rating: number | null;

  @Column({ type: 'int', nullable: true, default: 0 })
  review_count: number | null;

  @Column({ type: 'int', nullable: true, default: 0 })
  patient_count: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  satisfaction_rate: number | null;

  @Column({ 
    type: 'enum', 
    enum: ClinicStatus, 
    nullable: true, 
    default: ClinicStatus.ACTIVE 
  })
  @Index('IDX_clinics_status')
  status: ClinicStatus;

  @Column({ type: 'boolean', nullable: true, default: false })
  is_verified: boolean | null;

  @Column({ type: 'timestamp', nullable: true })
  verified_at: Date | null;

  @Column({ type: 'boolean', nullable: true, default: false })
  @Index('IDX_clinics_is_featured')
  is_featured: boolean | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo_url: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  banner_url: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  highlights: string | null;

  @Column({ type: 'text', nullable: true })
  awards: string | null;

  @Column({ type: 'text', nullable: true })
  certifications: string | null;

  @Column({ type: 'text', nullable: true })
  social_media: string | null;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  @Index('IDX_clinics_created_at')
  created_at: Date | null;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  created_by: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updated_by: string | null;

  @Column({ type: 'boolean', nullable: true, default: false })
  @Index('IDX_clinics_is_deleted')
  is_deleted: boolean | null;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;
}
