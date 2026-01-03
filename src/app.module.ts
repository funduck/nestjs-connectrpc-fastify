import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Logger } from '@nestjs/common';
import { ConnectrpcController } from './connectrpc.controller';
import { ConnectrpcModule } from './connectrpc/connectrpc.module';
import { LoggerMiddleware } from './logger.middleware';
import { AuthMiddleware } from './auth.middleware';
import { ElizaService } from '../gen/connectrpc/eliza/v1/eliza_pb';
import { DurationMiddleware } from './duration.middleware';

@Module({
  imports: [
    ConnectrpcModule.forRoot({
      middleware: [
        // Example 1: Apply to all services and all methods
        {
          use: LoggerMiddleware,
        },
        // Example 2: Apply to specific service only
        {
          use: AuthMiddleware,
          on: ElizaService,
        },
        // Example 3: Apply to specific methods of a service
        {
          use: DurationMiddleware,
          on: ElizaService,
          methods: ['SayMany'],
        },
      ],
      // Optional: Configure protocol options
      connect: true,
      grpc: false,
      grpcWeb: false,
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
