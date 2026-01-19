import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ConnectrpcController } from './connectrpc.controller';
import { middleware } from './connectrpc-fastify';
import { LoggerMiddleware } from './logger.middleware';
import { AuthMiddleware } from './auth.middleware';
import { ElizaService } from '../gen/connectrpc/eliza/v1/eliza_pb';
import { DurationMiddleware } from './duration.middleware';
import { ConnectRPCModule } from './nestjs-connectrpc-fastify';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    ConnectRPCModule.forRoot({
      logger: new Logger('ConnectRPC', { timestamp: true }),
      middlewares: [
        // Example 1: Apply to all services and all methods
        middleware(LoggerMiddleware),
        // Example 2: Apply to specific service only
        middleware(AuthMiddleware, ElizaService),
        // Example 3: Apply to specific methods of a service
        middleware(DurationMiddleware, ElizaService, ['sayMany']),
        middleware(DurationMiddleware, ElizaService, ['listenMany']),
      ],
      acceptCompression: [],
    }),
  ],
  providers: [
    Logger,
    // Registering a global guard the NestJS way
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },

    // Connectrpc controller is not "http" controller, so we don't put it in "controllers" array
    ConnectrpcController,

    // We have to provide middlewares here so that NestJS instantiates them before server is started
    // Otherwise we can't register them in ConnectRPC
    AuthMiddleware,
    DurationMiddleware,
    // But we have to avoid providing LoggerMiddleware here to prevent double instantiation!
    // LoggerMiddleware, // If you uncomment this line, you'll see an error thrown at runtime - which is good, double instantiation is dangerous
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Applying middlewares to REST HTTP routes the NestJS way
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
