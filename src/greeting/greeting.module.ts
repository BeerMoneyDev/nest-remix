import { Global, Module } from '@nestjs/common';
import { GreetingService } from './services';

@Global()
@Module({
  providers: [GreetingService],
  exports: [GreetingService],
})
export class GreetingModule {}
