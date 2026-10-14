import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// 开发环境配置 - 如果需要重置数据库，将 synchronize 设为 true，dropSchema 设为 true
const isDevelopment = process.env.NODE_ENV !== 'production';
const resetDatabase = process.env.RESET_DATABASE === 'true';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_DATABASE || 'pd',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: isDevelopment && resetDatabase, // 仅在开发环境且需要重置时启用
  dropSchema: isDevelopment && resetDatabase, // 仅在开发环境且需要重置时启用
  logging: isDevelopment && process.env.DB_LOGGING === 'true',
  charset: 'utf8mb4',
};
