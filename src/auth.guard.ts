import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { ConnectRPC } from './connectrpc-fastify';

const SKIP_AUTH_GUARD = Symbol('SKIP_AUTH_GUARD');

export function SkipAuthGuard() {
  return function (target: Object, key?: string | symbol, descriptor?: any) {
    if (descriptor) {
      Reflect.defineMetadata(SKIP_AUTH_GUARD, true, descriptor.value);
      return descriptor;
    }
    Reflect.defineMetadata(SKIP_AUTH_GUARD, true, target);
    return target;
  };
}

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger(AuthGuard.name);

  constructor() {
    ConnectRPC.registerGuard(this);
  }

  canActivate(context: ExecutionContext): boolean {
    this.logger.log('triggered');

    const handler = context.getHandler();
    if (Reflect.getMetadata(SKIP_AUTH_GUARD, handler)) {
      this.logger.log(
        'Skipping auth guard due to SkipAuthGuard decorator on method',
      );
      return true;
    }

    const controller = context.getClass();
    if (Reflect.getMetadata(SKIP_AUTH_GUARD, controller)) {
      this.logger.log(
        'Skipping auth guard due to SkipAuthGuard decorator on controller',
      );
      return true;
    }

    const request: FastifyRequest['raw'] = context.switchToHttp().getRequest();
    const res =
      request.headers['authorization'] != null &&
      request.headers['authorization'].match(/^Bearer\s.+/) != null;
    if (!res) {
      this.logger.warn(`Unauthorized request to ${request.url}`);
    }

    this.logger.log(`Authorized request to ${request.url}`);

    return res;
  }
}
