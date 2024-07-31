import { Controller, Param, Post, Sse } from '@nestjs/common';
import { NotifyService } from './notify.service';
import { RmqService } from '../../../libs/common/src/rmq/rmq.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { interval, map, startWith, switchMap } from 'rxjs';

@Controller()
export class NotifyController {
  constructor(
    private readonly notifyService: NotifyService,
    private readonly rmqService: RmqService,
  ) {}

  // ack 하는데 db에서만 update
  @Post('ack/:userId/:notifyId')
  async ack(
    @Param('userId') userId: number,
    @Param('notifyId') notifyId: number,
  ) {
    return await this.notifyService.ack(userId, notifyId);
  }

  // sse로 notify 보내기
  @Sse('sse-notify')
  async notifySse() {
    // 최초 접속 1회만 ack한 데이터 가져오기
    const isAck = await this.notifyService.getAll();

    return this.notifyService.getNotificationObservable().pipe(
      switchMap((data) => {
        // 10초마다 notify 데이터 가져오기
        return interval(10 * 1000).pipe(
          // 0초부터 시작
          startWith(0),
          map(() => {
            // notify 데이터 중 ack한 데이터는 제외
            return {
              data: data.filter(
                (a) => a.type === 'notify' && !isAck.includes(Number(a.id)),
              ),
            };
          }),
        );
      }),
    );
  }

  @EventPattern('notify')
  async notify(@Payload() data: any, @Ctx() context: RmqContext) {
    setTimeout(() => {
      // 10분이 지나면 ack
      this.rmqService.ack(context);
      this.notifyService.nextNotification(data, true);
    }, 1000 * 60 * 10);

    // notify 데이터라면 notifyService에 데이터 전달
    this.notifyService.nextNotification(data, false);
  }
}
