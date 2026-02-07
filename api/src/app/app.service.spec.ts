// Does my business logic work as expected? No HTTP, no routing, PURE logic tests.

import { Test } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  describe('getHello', () => {
    it('should return "Hello API"', () => {
      expect(service.hello()).toEqual({ message: 'Hello API' });
    });
  });
});
