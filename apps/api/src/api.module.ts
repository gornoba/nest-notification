import { Module } from '@nestjs/common';
import { RmqModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import * as Joi from 'joi';
import { NOTIFY } from './api.constant';
import { DatabaseModule } from '@app/common/databse/database.module';
import { NotifyEntity } from './entities/notify.entity';
import { ApiRepository } from './api.repository';

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
      envFilePath: './apps/api/.env',
    }),
    RmqModule.register({ name: NOTIFY }),
    DatabaseModule.forRootAsync([NotifyEntity]),
  ],
  controllers: [ApiController],
  providers: [ApiService, ApiRepository],
})
export class ApiModule {}
