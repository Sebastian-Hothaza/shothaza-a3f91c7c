/*

Controller: routing + HTTP concerns. 
Handles routes, reads parameters, body, query, headers, etc.
Returns responses, status codes, etc.
Should NOT contain business logic. That should be in the service layer.

*/


import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('hello') // This specifies the route
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.hello();
  }
}
