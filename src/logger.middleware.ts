import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger(LoggerMiddleware.name);

  constructor() {
    this.logger.log('initialized');
  }

  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    this.logger.log(
      JSON.stringify(
        {
          method: req.method,
          url: req.url,
          headers: req.headers,
        },
        null,
        2,
      ),
    );
    next();
  }
}
