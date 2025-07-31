import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('dentist_info')
export class DentistInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'char', length: 36, nullable: true, unique: true })
  @Index('IDX_dentist_info_uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  full_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index('IDX_dentist_info_phone')
  phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index('IDX_dentist_info_email')
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index('IDX_dentist_info_clinic_name')
  clinic_name: string;

  @Column({ type: 'int', nullable: true })
  years_experience: number;

  @Column({ type: 'int', nullable: true })
  treatment_count: number;

  @Column({ type: 'varchar', length: 2550, nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  special_notes: string;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  specialization: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  license_number: string;

  @Column({ type: 'text', nullable: true })
  education_background: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  state_province: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  postal_code: string;

  @Column({ type: 'varchar', length: 500, nullable: true, default: 'Taiwan' })
  country: string;

  @Column({ 
    type: 'enum', 
    enum: ['private', 'public', 'corporate', 'other'], 
    nullable: true 
  })
  clinic_type: string;

  @Column({ type: 'int', nullable: true })
  patient_capacity: number;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  working_hours: string;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  languages: string;

  @Column({ 
    type: 'enum', 
    enum: ['active', 'inactive', 'pending', 'suspended'], 
    nullable: true, 
    default: 'active' 
  })
  @Index('IDX_dentist_info_status')
  status: string;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  @Index('IDX_dentist_info_created_at')
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  created_by: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  updated_by: string;
} 