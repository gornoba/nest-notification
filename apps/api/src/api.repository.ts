import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SendNotifyBodyDto } from './api.dto';
import { NotifyEntity } from './entities/notify.entity';

@Injectable()
export class ApiRepository {
  constructor(private readonly dataSource: DataSource) {}

  async sendNotify(sendNotifyBodyDto: SendNotifyBodyDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();
      const respository = queryRunner.manager.getRepository(NotifyEntity);
      const notify = new NotifyEntity();
      notify.type = 'notify';
      notify.message = sendNotifyBodyDto.message;
      notify.created_at = new Date();

      await queryRunner.commitTransaction();
      return await respository.save(notify);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err);
    } finally {
      await queryRunner.release();
    }
  }
}
