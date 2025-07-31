import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 启用CORS，允许前端调用
  app.enableCors({
    origin: 'http://localhost:3000', // React默认端口
    credentials: true,
  });
  
  await app.listen(process.env.PORT ?? 3001); // 使用3001端口避免与React冲突
}
bootstrap();
