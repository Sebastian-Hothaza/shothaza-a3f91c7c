/*

Service: business logic, database access, etc.
Should be re-usable and testable without HTTP concerns.

*/


import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  hello() {
    return { message: 'Hello API' };
  }
}
