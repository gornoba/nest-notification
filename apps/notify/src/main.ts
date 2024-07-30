import { NestFactory } from '@nestjs/core';
import { NotifyModule } from './notify.module';
import { ConfigService } from '@nestjs/config';
import { RmqService } from '@app/common';
import { NOTIFY } from './notify.constant';
import { MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(NotifyModule);
  app.enableCors({
    origin: '*',
  });
  const configService = app.get(ConfigService);
  const rmqService = app.get(RmqService);
  app.connectMicroservice<MicroserviceOptions>(rmqService.getOptions(NOTIFY));
  await app.startAllMicroservices();
  await app.listen(configService.get('PORT'));
}
bootstrap();
