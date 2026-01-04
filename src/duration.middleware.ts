import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { MiddlewareStore } from './connectrpc';

@Injectable()
export class DurationMiddleware implements NestMiddleware {
  private logger = new Logger(DurationMiddleware.name);

  constructor() {
    MiddlewareStore.registerInstance(this);
  }

  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    this.logger.log('triggered');
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      this.logger.log(`Request to ${req.url} took ${duration}ms`);
    });
    next();
  }
}
