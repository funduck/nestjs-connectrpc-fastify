import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Logger } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule { }
