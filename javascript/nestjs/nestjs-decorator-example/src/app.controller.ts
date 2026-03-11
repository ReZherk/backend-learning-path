import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConsoleLogResponse } from './decorators/console-log-response.decorator';

@Controller('xd')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ConsoleLogResponse()
  getHello(): string {
    return this.appService.getHello();
  }
}
