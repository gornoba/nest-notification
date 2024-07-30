import { Controller, Param, Post, Sse } from '@nestjs/common';
import { NotifyService } from './notify.service';
import { RmqService } from '../../../libs/common/src/rmq/rmq.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { interval, map, startWith, switchMap } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';

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
    // emit된 데이터가 check인지 확인
    if (data.type === 'check') {
      // 바로 ack
      this.rmqService.ack(context);

      // 10분이 지난 데이터인지 확인
      const timeIs = this.notifyService.timeDiff(data.created_at);

      if (timeIs) {
        // 10분이 지났다면 ack
        this.rmqService.ack(context);
      }
    } else {
      // notify 데이터라면 notifyService에 데이터 전달
      this.notifyService.nextNotification(data);
    }
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async cron() {
    this.notifyService.check();
  }
}
