import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AckEntity } from './ack.entity';

@Entity({
  name: 'notify',
})
export class NotifyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  message: string;

  @Column()
  created_at: Date;

  @OneToMany(() => AckEntity, (ack) => ack.notify)
  acks: AckEntity[];
}
