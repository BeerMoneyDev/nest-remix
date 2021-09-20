import { Injectable } from '@nestjs/common';

@Injectable()
export class TestService {
  getHello(): string {
    return '¡Hello from the new package!';
  }
}
