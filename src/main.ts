import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger } from '@nestjs/common';
import { fastifyConnectPlugin } from '@connectrpc/connect-fastify';
import { connectRpcRoutes } from './connectrpc.routes';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const logger = app.get(Logger);

  const server = app.getHttpAdapter().getInstance();

  await server.register(fastifyConnectPlugin, {
    grpc: false, // disable grpc
    grpcWeb: false, // disable grpc-web
    connect: true, // we only use connect
    // interceptors: [createValidateInterceptor()], // skip validation for performance
    acceptCompression: [], // skip compression for performance
    routes: connectRpcRoutes,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
