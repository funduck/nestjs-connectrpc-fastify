import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger } from '@nestjs/common';
import { ConnectRPCModule } from './nestjs-connectrpc-fastify/connectrpc.module';

export async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const logger = app.get(Logger);

  logger.log('App created');

  await app.get(ConnectRPCModule).registerPlugin();

  logger.log('Server is starting...');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
}
