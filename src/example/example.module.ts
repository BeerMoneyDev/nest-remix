import { DynamicModule, Module } from '@nestjs/common';
import { ExampleService } from './example.service';

@Module({})
export class ExampleModule {
  static exampleService(): DynamicModule {
    return {
      global: true,
      module: ExampleModule,
      providers: [
        {
          provide: 'ExampleService',
          useFactory: async () => {
            return new ExampleService();
          },
        },
      ],
      exports: [ExampleService],
    };
  }
}
