import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { MiddlewareStore } from './connectrpc';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger(LoggerMiddleware.name);

  constructor() {
    MiddlewareStore.registerInstance(this, {
      allowMultipleInstances: true,
    });
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
