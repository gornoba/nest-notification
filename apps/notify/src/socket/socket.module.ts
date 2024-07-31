import { forwardRef, Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
import { NotifyModule } from '../notify.module';

@Module({
  imports: [forwardRef(() => NotifyModule)],
  providers: [SocketGateway, SocketService],
})
export class SocketModule {}
