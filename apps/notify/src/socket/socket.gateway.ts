import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { SocketService } from './socket.service';
import { Server, Socket } from 'socket.io';
import { NotifyService } from '../notify.service';
import { switchMap, from } from 'rxjs';

@WebSocketGateway({
  transports: ['websocket'],
  cors: { origin: '*' },
})
export class SocketGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly socketService: SocketService,
    private readonly notifyService: NotifyService,
  ) {}

  @SubscribeMessage('notify')
  async handleInit(@MessageBody() data: { [key: string]: any }) {
    if (data?.init) {
      // 최초 접속 1회만 ack한 데이터 가져오기
      const isAck = await this.notifyService.getAll();

      return this.notifyService.getNotificationObservable().pipe(
        switchMap((initData) => {
          const dataFilter = initData.filter(
            (a) => a.type === 'notify' && !isAck.includes(Number(a.id)),
          );

          return from([
            {
              data: dataFilter,
            },
          ]);
        }),
      );
    } else {
      return data;
    }
  }

  @SubscribeMessage('submit')
  handleEvent(@MessageBody() data: { [key: string]: any }) {
    this.server.emit('notify', data);
  }

  @SubscribeMessage('delete')
  handleDelete(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    client.broadcast.emit('delete', data);
  }
}
