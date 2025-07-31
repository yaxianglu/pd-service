import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 启用CORS，允许前端调用
  app.enableCors({
    origin: '*', // React默认端口
    credentials: true,
  });
  
  await app.listen(process.env.APP_PORT ?? 3001); // 使用环境变量中的APP_PORT
}
bootstrap();
