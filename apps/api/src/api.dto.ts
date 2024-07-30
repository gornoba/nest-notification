import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendNotifyBodyDto {
  @ApiProperty({
    name: 'message',
    description: 'The message to send',
    type: String,
    required: true,
    example: 'Hello, World!',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
