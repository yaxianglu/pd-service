import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { SmileTestFiles } from './smile-test-files.entity';

@Entity('smile_test')
export class SmileTest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 50, nullable: true, unique: true })
  @Index()
  test_id: string;

  @Column({ type: 'varchar', length: 36, nullable: true, unique: true })
  @Index()
  uuid: string;

  @Column('varchar', { length: 100 })
  full_name: string;

  @Column('date', { nullable: true })
  birth_date: Date;

  @Column('varchar', { length: 20, nullable: true })
  @Index()
  phone: string;

  @Column('varchar', { length: 100, nullable: true })
  @Index()
  email: string;

  @Column('varchar', { length: 100, nullable: true })
  @Index()
  line_id: string;

  @Column('varchar', { length: 100, nullable: true })
  @Index()
  city: string;

  @Column('enum', { 
    enum: ['normal', 'crowded', 'spaced', 'overbite', 'underbite', 'crossbite', 'other'], 
    nullable: true 
  })
  @Index()
  teeth_type: string;

  @Column('longtext', { nullable: true })
  considerations: string;

  @Column('longtext', { nullable: true })
  improvement_points: string;

  @Column('longtext', { nullable: true })
  teeth_image_1: string;

  @Column('longtext', { nullable: true })
  teeth_image_2: string;

  @Column('longtext', { nullable: true })
  teeth_image_3: string;

  @Column('longtext', { nullable: true })
  teeth_image_4: string;

  @Column('int', { nullable: true })
  age: number;

  @Column('enum', { enum: ['male', 'female', 'other'], nullable: true })
  gender: string;

  @Column('varchar', { length: 100, nullable: true })
  occupation: string;

  @Column('longtext', { nullable: true })
  address: string;

  @Column('varchar', { length: 100, nullable: true })
  emergency_contact: string;

  @Column('varchar', { length: 20, nullable: true })
  emergency_phone: string;

  @Column('longtext', { nullable: true })
  dental_history: string;

  @Column('longtext', { nullable: true })
  current_issues: string;

  @Column('longtext', { nullable: true })
  allergies: string;

  @Column('longtext', { nullable: true })
  medications: string;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  test_score: number;

  @Column('enum', { enum: ['low', 'medium', 'high'], nullable: true })
  confidence_level: string;

  @Column('varchar', { length: 200, nullable: true })
  recommended_treatment: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  estimated_cost: number;

  @Column('enum', { 
    enum: ['pending', 'in_progress', 'completed', 'cancelled'], 
    default: 'pending',
    nullable: true 
  })
  @Index()
  test_status: string;

  @Column('datetime', { nullable: true })
  @Index()
  appointment_date: Date;

  @Column('datetime', { nullable: true })
  follow_up_date: Date;

  @Column({ type: 'varchar', length: 36, nullable: true })
  @Index()
  patient_uuid: string;

  @CreateDateColumn()
  @Index()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column('varchar', { length: 100, nullable: true })
  created_by: string;

  @Column('varchar', { length: 100, nullable: true })
  updated_by: string;

  @Column('tinyint', { default: 0 })
  @Index()
  is_deleted: number;

  @Column('timestamp', { nullable: true })
  deleted_at: Date;

  // 关联关系
  @OneToMany(() => SmileTestFiles, file => file.smileTest)
  files: SmileTestFiles[];
} 