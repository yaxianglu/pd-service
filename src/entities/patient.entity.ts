import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum PatientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DISCHARGED = 'discharged'
}

export enum TreatmentStatus {
  INITIAL_CONSULTATION = 'initial_consultation',
  TREATMENT_PLANNING = 'treatment_planning',
  TREATMENT_IN_PROGRESS = 'treatment_in_progress',
  TREATMENT_COMPLETED = 'treatment_completed',
  FOLLOW_UP = 'follow_up',
  DISCHARGED = 'discharged'
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PARTIAL_PAID = 'partial_paid',
  PAID = 'paid',
  REFUNDED = 'refunded'
}

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
  @Index('IDX_patients_patient_id')
  patient_id: string | null;

  @Column({ type: 'char', length: 36, nullable: true, unique: true })
  @Index('IDX_patients_uuid')
  uuid: string | null;

  @Column({ type: 'varchar', length: 100 })
  @Index('IDX_patients_full_name')
  full_name: string;

  @Column({ type: 'date', nullable: true })
  birth_date: Date | null;

  @Column({ 
    type: 'enum', 
    enum: ['male', 'female', 'other'], 
    nullable: true 
  })
  gender: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @Index('IDX_patients_phone')
  phone: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index('IDX_patients_email')
  email: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  line_id: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  wechat_id: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index('IDX_patients_city')
  city: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  district: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postal_code: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  emergency_contact: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  emergency_phone: string | null;

  @Column({ 
    type: 'enum', 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], 
    nullable: true 
  })
  blood_type: string | null;

  @Column({ type: 'text', nullable: true })
  allergies: string | null;

  @Column({ type: 'text', nullable: true })
  medical_history: string | null;

  @Column({ type: 'text', nullable: true })
  current_medications: string | null;

  @Column({ type: 'text', nullable: true })
  dental_history: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  insurance_provider: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  insurance_number: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Index('IDX_patients_clinic_id')
  clinic_id: string | null;

  @Column({ type: 'char', length: 36, nullable: true })
  @Index('IDX_patients_assigned_doctor_uuid')
  assigned_doctor_uuid: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Index('IDX_patients_receptionist_id')
  receptionist_id: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  referral_source: string | null;

  @Column({ type: 'date', nullable: true })
  @Index('IDX_patients_first_visit_date')
  first_visit_date: Date | null;

  @Column({ type: 'date', nullable: true })
  last_visit_date: Date | null;

  @Column({ type: 'datetime', nullable: true })
  @Index('IDX_patients_next_appointment_date')
  next_appointment_date: Date | null;

  @Column({ 
    type: 'enum', 
    enum: TreatmentStatus, 
    nullable: true, 
    default: TreatmentStatus.INITIAL_CONSULTATION 
  })
  @Index('IDX_patients_treatment_status')
  treatment_status: TreatmentStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  treatment_phase: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  treatment_progress: number | null;

  @Column({ type: 'date', nullable: true })
  estimated_completion_date: Date | null;

  @Column({ type: 'date', nullable: true })
  actual_completion_date: Date | null;

  @Column({ type: 'text', nullable: true })
  selected_treatment_plan: string | null;

  @Column({ type: 'text', nullable: true })
  selected_products: string | null;

  @Column({ type: 'text', nullable: true })
  treatment_notes: string | null;

  @Column({ type: 'text', nullable: true })
  special_requirements: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total_cost: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: 0.00 })
  paid_amount: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  remaining_balance: number | null;

  @Column({ 
    type: 'enum', 
    enum: PaymentStatus, 
    nullable: true, 
    default: PaymentStatus.UNPAID 
  })
  @Index('IDX_patients_payment_status')
  payment_status: PaymentStatus;

  @Column({ 
    type: 'enum', 
    enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'insurance', 'installment'], 
    nullable: true 
  })
  payment_method: string | null;

  @Column({ type: 'text', nullable: true })
  installment_plan: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: 0.00 })
  discount_amount: number | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  discount_reason: string | null;

  @Column({ type: 'boolean', nullable: true, default: true })
  appointment_reminder: boolean | null;

  @Column({ 
    type: 'enum', 
    enum: ['sms', 'email', 'line', 'wechat', 'phone'], 
    nullable: true 
  })
  reminder_method: string | null;

  @Column({ type: 'int', nullable: true, default: 24 })
  reminder_time: number | null;

  @Column({ type: 'int', nullable: true, default: 0 })
  no_show_count: number | null;

  @Column({ type: 'int', nullable: true, default: 0 })
  cancellation_count: number | null;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  satisfaction_rating: number | null;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  service_rating: number | null;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  doctor_rating: number | null;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  facility_rating: number | null;

  @Column({ type: 'text', nullable: true })
  review_text: string | null;

  @Column({ type: 'timestamp', nullable: true })
  review_date: Date | null;

  @Column({ 
    type: 'enum', 
    enum: PatientStatus, 
    nullable: true, 
    default: PatientStatus.ACTIVE 
  })
  @Index('IDX_patients_status')
  status: PatientStatus;

  @Column({ type: 'boolean', nullable: true, default: false })
  is_verified: boolean | null;

  @Column({ type: 'timestamp', nullable: true })
  verified_at: Date | null;

  @Column({ type: 'boolean', nullable: true, default: false })
  is_vip: boolean | null;

  @Column({ 
    type: 'enum', 
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'], 
    nullable: true 
  })
  @Index('IDX_patients_vip_level')
  vip_level: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar_url: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  occupation: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  education_level: string | null;

  @Column({ 
    type: 'enum', 
    enum: ['single', 'married', 'divorced', 'widowed'], 
    nullable: true 
  })
  marital_status: string | null;

  @Column({ type: 'text', nullable: true })
  family_members: string | null;

  @Column({ type: 'text', nullable: true })
  hobbies: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true, default: 'zh-TW' })
  preferred_language: string | null;

  @Column({ 
    type: 'enum', 
    enum: ['phone', 'email', 'line', 'wechat', 'sms'], 
    nullable: true 
  })
  communication_preference: string | null;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  @Index('IDX_patients_created_at')
  created_at: Date | null;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  created_by: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updated_by: string | null;

  @Column({ type: 'tinyint', nullable: true, default: 0 })
  @Index('idx_patients_is_deleted')
  is_deleted: number | null;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;
}
