import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors({
    origin:
      configService.get<string>('FRONTEND_ORIGIN') ?? 'http://localhost:3000',
    credentials: true,
  });

  const port = Number(configService.get<string>('PORT') ?? 4000);
  await app.listen(port);
}
bootstrap();
