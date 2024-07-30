import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ApiModule } from './api.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(ApiModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useStaticAssets(join(__dirname, '..', '..', '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', '..', '..', 'views'));
  app.setViewEngine('hbs');
  const configService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .setTitle('notify api')
    .setDescription('The notify API description')
    .setVersion('1.0')
    .addTag('notify')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(configService.get('PORT'));
}
bootstrap();
