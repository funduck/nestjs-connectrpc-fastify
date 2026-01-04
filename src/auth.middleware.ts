import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { ConnectRPC } from './connectrpc-fastify';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private logger = new Logger(AuthMiddleware.name);

  constructor() {
    ConnectRPC.registerMiddleware(this);
  }

  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    this.logger.log('triggered');
    next();
  }
}
