import { Test, TestingModule } from '@nestjs/testing';
import { TestService } from '../test.service';

describe('TestService', () => {
  let service: TestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestService],
    }).compile();

    service = module.get<TestService>(TestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should be return message when call the getHello function', () => {
    expect(service.getHello()).toBe('¡Hello from the new package!');
  });
});
