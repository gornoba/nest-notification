import { Inject, Injectable } from '@nestjs/common';
import { NOTIFY } from './api.constant';
import { ClientProxy } from '@nestjs/microservices';
import { SendNotifyBodyDto } from './api.dto';
import { ApiRepository } from './api.repository';

@Injectable()
export class ApiService {
  constructor(
    @Inject(NOTIFY) private readonly notifyClient: ClientProxy,
    private readonly apiRepository: ApiRepository,
  ) {}

  async sendNotify(sendNotifyBodyDto: SendNotifyBodyDto) {
    const result = await this.apiRepository.sendNotify(sendNotifyBodyDto);

    this.notifyClient.emit('notify', {
      type: 'notify',
      ...result,
    });

    return 'Notify sent';
  }
}
