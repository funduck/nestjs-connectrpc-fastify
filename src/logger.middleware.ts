import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    console.log('=== LoggerMiddleware triggered ===');
    console.log('Request type:', req.constructor.name);
    console.log('Response type:', res.constructor.name);
    console.log(
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
    console.log('=================================');
    next();
  }
}
