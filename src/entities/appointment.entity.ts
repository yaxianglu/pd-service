import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'char', length: 36, nullable: true, unique: true })
  @Index('IDX_appointments_uuid')
  uuid: string;

  @Column({ type: 'char', length: 36, nullable: true })
  @Index('IDX_appointments_patient_uuid')
  patient_uuid: string | null;

  @Column({ type: 'char', length: 36, nullable: true })
  @Index('IDX_appointments_doctor_uuid')
  doctor_uuid: string | null;

  @Column({ type: 'date' })
  @Index('IDX_appointments_date')
  date: string; // YYYY-MM-DD

  @Column({ type: 'time' })
  start_time: string; // HH:MM:SS

  @Column({ type: 'time' })
  end_time: string; // HH:MM:SS

  @Column({ type: 'varchar', length: 2000, nullable: true })
  note: string | null;

  @Column({
    type: 'enum',
    enum: ['scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled'],
    default: 'scheduled'
  })
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';

  @Column({ type: 'enum', enum: ['low', 'normal', 'high'], default: 'normal', nullable: true })
  priority: 'low' | 'normal' | 'high';

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;
}


