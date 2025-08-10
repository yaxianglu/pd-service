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
  @Index('IDX_admin_users_user_id')
  user_id: string | null;

  @Column({ type: 'char', length: 36, nullable: true, unique: true })
  @Index('IDX_admin_users_uuid')
  uuid: string | null;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index('IDX_admin_users_username')
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index('IDX_admin_users_email')
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
  @Index('IDX_admin_users_last_login_at')
  last_login_at: Date | null;

  @Column({ type: 'int', nullable: true, default: 0 })
  login_attempts: number | null;

  @Column({ type: 'timestamp', nullable: true })
  locked_until: Date | null;

  @Column({ 
    type: 'enum', 
    enum: AdminUserRole, 
    nullable: true, 
    default: AdminUserRole.OPERATOR 
  })
  @Index('IDX_admin_users_role')
  role: AdminUserRole;

  @Column({ type: 'text', nullable: true })
  permissions: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index('IDX_admin_users_department')
  department: string | null; // 对于医生角色，此字段存储关联的诊所UUID

  @Column({ type: 'varchar', length: 100, nullable: true })
  position: string | null;

  @Column({ 
    type: 'enum', 
    enum: AdminUserStatus, 
    nullable: true, 
    default: AdminUserStatus.ACTIVE 
  })
  @Index('IDX_admin_users_status')
  status: AdminUserStatus;

  @Column({ type: 'boolean', nullable: true, default: false })
  is_verified: boolean | null;

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
  @Index('IDX_admin_users_created_at')
  created_at: Date | null;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  created_by: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updated_by: string | null;

  @Column({ type: 'boolean', nullable: true, default: false })
  @Index('IDX_admin_users_is_deleted')
  is_deleted: boolean | null;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;
} 