import { Injectable, MessageEvent } from '@nestjs/common';
import { BehaviorSubject } from 'rxjs';
import { NotifyRepository } from './notify.repository';

@Injectable()
export class NotifyService {
  private notificationSubject = new BehaviorSubject<MessageEvent[]>([]);

  constructor(private readonly notifyRepository: NotifyRepository) {}

  // rxjs subject에 notify 데이터 추가
  nextNotification(data: any, del: boolean) {
    const currentNotifications = this.notificationSubject.getValue();

    const difference = currentNotifications.filter((a) => a.id !== data.id);

    let nextArr = [];

    if (del) {
      nextArr = [...difference];
    } else {
      nextArr = [...difference, { ...data }];
    }

    this.notificationSubject.next(nextArr);
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

  delete(id: number) {
    const currentNotifications = this.notificationSubject.getValue();
    const updatedNotifications = currentNotifications.filter(
      (a) => a.data['id'] !== id,
    );
    this.notificationSubject.next(updatedNotifications);
  }

  // 10분이 지났는지 확인
  timeDiff(created_at: string) {
    const createdAt: Date = new Date(created_at);
    const now: Date = new Date();

    const differenceInMilliseconds = now.getTime() - createdAt.getTime();
    const differenceInMinutes = differenceInMilliseconds / 1000;

    return differenceInMinutes > 1;
  }
}
