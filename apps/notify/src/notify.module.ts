import { Module } from '@nestjs/common';
import { NotifyController } from './notify.controller';
import { NotifyService } from './notify.service';
import { RmqModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseModule } from '@app/common/databse/database.module';
import { AckEntity } from './entities/ack.entity';
import { NotifyEntity } from './entities/notify.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { NOTIFY } from './notify.constant';
import { NotifyRepository } from './notify.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_NOTIFY_QUEUE: Joi.string().required(),
        DATABASE: Joi.string().required(),
      }),
      envFilePath: './apps/notify/.env',
    }),
    RmqModule.register({ name: NOTIFY }),
    DatabaseModule.forRootAsync([AckEntity, NotifyEntity]),
    ScheduleModule.forRoot(),
  ],
  controllers: [NotifyController],
  providers: [NotifyService, NotifyRepository],
})
export class NotifyModule {}
