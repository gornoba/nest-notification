import { DataSource } from 'typeorm';
import { NotifyEntity } from './entities/notify.entity';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AckEntity } from './entities/ack.entity';
import { InjectDataSource } from '@nestjs/typeorm';

export class NotifyRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async ack(userId: number, notifyId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const notify = await queryRunner.manager.findOne(NotifyEntity, {
        where: { id: notifyId },
      });

      if (!notify) {
        throw new BadRequestException('Notify not found');
      }

      const ackEntity = new AckEntity();
      ackEntity.ack = true;
      ackEntity.userId = userId;
      ackEntity.notify = notify;

      await queryRunner.manager.save(ackEntity);
      await queryRunner.commitTransaction();
      return true;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(e);
    } finally {
      await queryRunner.release();
    }
  }

  async getAll(userId = 1) {
    const result = await this.dataSource.getTreeRepository(AckEntity).find({
      relations: {
        notify: true,
      },
      select: {
        id: true,
        notify: {
          id: true,
        },
      },
      where: {
        userId,
        ack: true,
      },
    });

    return result.flatMap((a) => a.notify.id);
  }
}
