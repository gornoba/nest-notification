import { Body, Controller, Get, Post, Render } from '@nestjs/common';
import { SendNotifyBodyDto } from './api.dto';
import { ApiService } from './api.service';

@Controller()
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get()
  @Render('index')
  root() {
    return;
  }

  @Post('send-notify')
  async sendNotify(@Body() sendNotifyBodyDto: SendNotifyBodyDto) {
    return this.apiService.sendNotify(sendNotifyBodyDto);
  }
}
