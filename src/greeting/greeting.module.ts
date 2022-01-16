import { Global, Module } from '@nestjs/common';
import { GreetingService } from './services/greeting.service';

@Global()
@Module({
  providers: [GreetingService],
  exports: [GreetingService],
})
export class GreetingModule {}
