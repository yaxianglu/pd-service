import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('file_uploads')
export class FileUpload {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 36, unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 255 })
  originalName: string;

  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  filepath: string | null;

  @Column({ type: 'longblob' })
  data: Buffer;

  @Column({ type: 'varchar', length: 100 })
  mimetype: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column({ type: 'varchar', length: 36, nullable: true })
  smileTestUuid: string | null;

  @Column({ type: 'varchar', length: 50 })
  uploadType: string; // 'staff_file', 'patient_image', etc.

  @Column({ type: 'enum', enum: ['uploading', 'completed', 'failed'], default: 'uploading' })
  status: 'uploading' | 'completed' | 'failed';

  @Column({ type: 'text', nullable: true })
  metadata: string | null; // JSON string for additional metadata

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('upload_sessions')
export class UploadSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  uploadId: string;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @Column({ type: 'bigint' })
  fileSize: number;

  @Column({ type: 'varchar', length: 100 })
  contentType: string;

  @Column({ type: 'int' })
  totalChunks: number;

  @Column({ type: 'int', default: 0 })
  uploadedChunks: number;

  @Column({ type: 'text' })
  uploadedChunkIndexes: string; // JSON array of uploaded chunk indexes

  @Column({ type: 'varchar', length: 36, nullable: true })
  smileTestUuid: string | null;

  @Column({ type: 'varchar', length: 50 })
  uploadType: string;

  @Column({ type: 'text', nullable: true })
  metadata: string | null;

  @Column({ type: 'enum', enum: ['initialized', 'uploading', 'completed', 'failed', 'expired'], default: 'initialized' })
  status: 'initialized' | 'uploading' | 'completed' | 'failed' | 'expired';

  @Column({ type: 'varchar', length: 500, nullable: true })
  tempDir: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  finalPath: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;
}