import { Test, TestingModule } from '@nestjs/testing';
import { GreetingService } from '../greeting/services';

describe('GreetingService', () => {
  let service: GreetingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GreetingService],
    }).compile();

    service = module.get<GreetingService>(GreetingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should be return message when call the getHello function', () => {
    expect(service.getHello()).toBe('¡Hello from the new package!');
  });
});
