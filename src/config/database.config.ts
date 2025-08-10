import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// 开发环境配置 - 如果需要重置数据库，将 synchronize 设为 true，dropSchema 设为 true
const isDevelopment = process.env.NODE_ENV !== 'production';
const resetDatabase = process.env.RESET_DATABASE === 'true';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'pd-db-new.cgbiaakssebs.us-east-1.rds.amazonaws.com',
  username: 'henrycao',
  password: 'Pearl#89$Hc!',
  // host: 'localhost',
  // username: 'root',
  // password: 'Shein@123',
  port: 3306,
  database: 'pd',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: isDevelopment && resetDatabase, // 仅在开发环境且需要重置时启用
  dropSchema: isDevelopment && resetDatabase, // 仅在开发环境且需要重置时启用
  logging: true,
  charset: 'utf8mb4',
  // 添加以下配置来确保字段映射正确
  entitySkipConstructor: false,
  // 强制重新加载实体
  autoLoadEntities: true,
  // 确保字段名称映射正确
  namingStrategy: {
    column: 'snake_case',
    table: 'snake_case'
  }
};
