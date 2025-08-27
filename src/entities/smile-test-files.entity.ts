import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { SmileTest } from './smile-test.entity';

@Entity('smile_test_files')
export class SmileTestFiles {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  @Index()
  uuid: string;

  // 外键字段，不指定length属性
  @Column({ type: 'varchar', nullable: false })
  @Index()
  smile_test_uuid: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  file_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  file_type: string;

  @Column({ type: 'longtext', nullable: true })
  file_data: string;

  @Column({ 
    type: 'enum', 
    enum: ['smile_test', 'oral_scan'], 
    nullable: false 
  })
  @Index()
  upload_type: string;

  @Column({ type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  upload_time: Date;

  @Column({ 
    type: 'enum', 
    enum: ['normal', 'deleted'], 
    nullable: true, 
    default: 'normal' 
  })
  @Index()
  status: string;

  @CreateDateColumn()
  @Index()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  created_by: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updated_by: string;

  // 关联关系
  @ManyToOne(() => SmileTest, smileTest => smileTest.files)
  @JoinColumn({ name: 'smile_test_uuid' })
  smileTest: SmileTest;
}
