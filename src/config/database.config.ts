import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// 开发环境配置 - 如果需要重置数据库，将 synchronize 设为 true，dropSchema 设为 true
const isDevelopment = process.env.NODE_ENV !== 'production';
const resetDatabase = process.env.RESET_DATABASE === 'true';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'Shein@123',
  database: 'pd',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: isDevelopment && resetDatabase, // 仅在开发环境且需要重置时启用
  dropSchema: isDevelopment && resetDatabase, // 仅在开发环境且需要重置时启用
  logging: true,
  charset: 'utf8mb4',
}; 