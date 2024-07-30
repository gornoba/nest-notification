import { Inject, Injectable, MessageEvent } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BehaviorSubject } from 'rxjs';
import { NOTIFY } from './notify.constant';
import { NotifyRepository } from './notify.repository';

@Injectable()
export class NotifyService {
  private notificationSubject = new BehaviorSubject<MessageEvent[]>([]);

  constructor(
    @Inject(NOTIFY) private readonly notifyClient: ClientProxy,
    private readonly notifyRepository: NotifyRepository,
  ) {}

  // rxjs subject에 notify 데이터 추가
  nextNotification(data: any) {
    const currentNotifications = this.notificationSubject.getValue();
    const updatedNotifications = [...currentNotifications, { ...data }];
    this.notificationSubject.next(updatedNotifications);
  }

  // rxjs subject observable 반환
  getNotificationObservable() {
    return this.notificationSubject.asObservable();
  }

  // repository ack
  async ack(userId: number, notifyId: number) {
    return this.notifyRepository.ack(userId, notifyId);
  }

  // repository getAll
  async getAll() {
    return this.notifyRepository.getAll();
  }

  // scheduler로 10초마다 ack check
  check() {
    this.notifyClient.emit('notify', { type: 'check' });
  }

  // 10분이 지났는지 확인
  timeDiff(created_at: string) {
    const createdAt: Date = new Date(created_at);
    const now: Date = new Date();

    const differenceInMilliseconds = now.getTime() - createdAt.getTime();
    const differenceInMinutes = differenceInMilliseconds / (1000 * 60);

    return differenceInMinutes > 10;
  }
}
