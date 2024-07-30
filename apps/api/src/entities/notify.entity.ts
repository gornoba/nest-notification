import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
