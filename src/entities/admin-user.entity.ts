import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum AdminUserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATOR = 'operator',
  DOCTOR = 'doctor',
  MARKET = 'market',
  HOSPITAL = 'hospital'
}

export enum AdminUserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
  @Index('idx_user_id')
  user_id: string | null;

  @Column({ type: 'char', length: 36, nullable: true, unique: true })
  @Index('idx_uuid')
  uuid: string | null;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index('idx_username')
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index('idx_email')
  email: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  full_name: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  token: string | null;

  @Column({ type: 'timestamp', nullable: true })
  token_expires_at: Date | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  refresh_token: string | null;

  @Column({ type: 'timestamp', nullable: true })
  refresh_token_expires_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  @Index('idx_last_login_at')
  last_login_at: Date | null;

  @Column({ type: 'int', nullable: true, default: 0 })
  login_attempts: number | null;

  @Column({ type: 'timestamp', nullable: true })
  locked_until: Date | null;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true, 
    default: 'operator' 
  })
  @Index('idx_role')
  role: string; // 改为 string 类型，与 SQL 的 VARCHAR(255) 对齐

  @Column({ type: 'text', nullable: true })
  permissions: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index('idx_department')
  department: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  position: string | null;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    nullable: true, 
    default: 'active' 
  })
  @Index('idx_status')
  status: string; // 改为 string 类型，与 SQL 的 ENUM 对齐

  @Column({ type: 'tinyint', nullable: true, default: 0 })
  is_verified: number | null; // 改为 number 类型，与 SQL 的 TINYINT(1) 对齐

  @Column({ type: 'timestamp', nullable: true })
  verified_at: Date | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar: string | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  timezone: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true, default: 'zh-CN' })
  language: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true, default: 'light' })
  theme: string | null;

  @Column({ type: 'text', nullable: true })
  notification_settings: string | null;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  @Index('idx_created_at')
  created_at: Date | null;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  created_by: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updated_by: string | null;

  @Column({ type: 'tinyint', nullable: true, default: 0 })
  @Index('idx_is_deleted')
  is_deleted: number | null; // 改为 number 类型，与 SQL 的 TINYINT(1) 对齐

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;
} 