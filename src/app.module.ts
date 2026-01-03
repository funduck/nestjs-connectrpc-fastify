import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Logger } from '@nestjs/common';
import { ConnectrpcController } from './connectrpc.controller';
import { ConnectrpcModule } from './connectrpc/connectrpc.module';

@Module({
  imports: [ConnectrpcModule],
  controllers: [AppController],
  providers: [AppService, Logger, ConnectrpcController],
})
export class AppModule {}
