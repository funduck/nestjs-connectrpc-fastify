import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class DurationMiddleware implements NestMiddleware {
  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    console.log('=== DurationMiddleware triggered ===');
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`Request to ${req.url} took ${duration}ms`);
      console.log('=================================');
    });
    next();
  }
}
