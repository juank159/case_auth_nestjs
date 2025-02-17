import { Injectable, Logger } from '@nestjs/common';

// src/logger/logger.service.ts
@Injectable()
export class LoggerService implements LoggerService {
  private logger = new Logger();

  log(message: string) {
    this.logger.log(message);
  }

  error(message: string, trace: string) {
    this.logger.error(message, trace);
  }
}
