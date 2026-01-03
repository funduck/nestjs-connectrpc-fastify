import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    console.log('=== AuthMiddleware triggered ===');
    console.log('Checking authorization...');
    // Example: check for auth header
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      console.log('Warning: No authorization header found');
    } else {
      console.log('Authorization header present');
    }
    console.log('=================================');
    next();
  }
}
