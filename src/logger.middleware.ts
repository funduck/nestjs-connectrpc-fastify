import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { ConnectRPC } from './connectrpc-fastify';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger(LoggerMiddleware.name);

  constructor() {
    ConnectRPC.registerMiddleware(this, {
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
