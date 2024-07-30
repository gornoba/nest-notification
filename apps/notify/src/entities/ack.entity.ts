import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NotifyEntity } from './notify.entity';

@Entity({
  name: 'ack',
})
export class AckEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ack: boolean;

  @Column()
  userId: number;

  @ManyToOne(() => NotifyEntity, (notify) => notify.acks)
  @JoinColumn({ name: 'notify_id', referencedColumnName: 'id' })
  notify: NotifyEntity;
}
