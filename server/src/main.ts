import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Constants } from './constants';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('/api');
  app.enableCors({
    origin: [
      'https://www.csgowon.com',
      Constants.frontend_url,
      Constants.admin_url,
    ],
    credentials: true,
    exposedHeaders: ['set-cookie'],
  });

  await app.listen(4000);
}
bootstrap();
