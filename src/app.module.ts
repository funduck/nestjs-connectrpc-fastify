import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Logger } from '@nestjs/common';
import { ConnectrpcController } from './connectrpc.controller';
import { ConnectrpcModule, middleware } from './connectrpc';
import { LoggerMiddleware } from './logger.middleware';
import { AuthMiddleware } from './auth.middleware';
import { ElizaService } from '../gen/connectrpc/eliza/v1/eliza_pb';
import { DurationMiddleware } from './duration.middleware';

@Module({
  imports: [
    ConnectrpcModule.forRoot({
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
  controllers: [AppController],
  providers: [AppService, Logger, ConnectrpcController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // This middleware only applies to regular HTTP routes, not ConnectRPC
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
