import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 使用Express中间件设置请求体大小限制
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  
  // 启用CORS，允许前端调用
  app.enableCors({
    origin: '*', // React默认端口
    credentials: true,
    exposedHeaders: ['Content-Disposition'], // 允许前端访问Content-Disposition头
  });
  
  await app.listen(process.env.APP_PORT ?? 3001); // 使用环境变量中的APP_PORT
}
bootstrap();
