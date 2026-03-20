import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { ConsoleLogResponse } from './decorators/console-log-response.decorator';

@Controller('xd')
export class AppController {
  texto = '________hola desde AppController_______';

  constructor(private readonly appService: AppService) {}

  @Get('hello')
  @ConsoleLogResponse()
  getHello(
    @Query('parametro1') parametro1: string,
    @Query('parametro2') parametro2: string,
  ): string {
    const message: string =
      'En este momento se está ingresando dentro del método getHello y sus parámetros son: ' +
      parametro1 +
      ' y el parámetro 2: ' +
      parametro2;

    console.log(message);

    return this.appService.getHello();
  }
}
