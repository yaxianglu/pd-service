import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('payment_records')
export class PaymentRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'char', length: 36, nullable: true, unique: true })
  @Index('IDX_payment_records_uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index('IDX_payment_records_paypal_order_id')
  paypal_order_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index('IDX_payment_records_paypal_payment_id')
  paypal_payment_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index('IDX_payment_records_paypal_capture_id')
  paypal_capture_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Index('IDX_payment_records_status')
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  currency: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index('IDX_payment_records_custom_id')
  custom_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index('IDX_payment_records_dentist_id')
  dentist_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index('IDX_payment_records_patient_id')
  patient_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index('IDX_payment_records_treatment_id')
  treatment_id: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  return_url: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  cancel_url: string;

  @Column({ type: 'text', nullable: true })
  paypal_response: string;

  @Column({ type: 'text', nullable: true })
  webhook_data: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index('IDX_payment_records_refund_id')
  refund_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  refund_amount: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  refund_reason: string;

  @Column({ type: 'timestamp', nullable: true })
  refund_time: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index('IDX_payment_records_created_by')
  created_by: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updated_by: string;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  @Index('IDX_payment_records_created_at')
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;
} 