import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './logger/logger.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { OkxModule } from './okx/okx.module';

@Module({
  imports: [ConfigModule, DatabaseModule, LoggerModule, OkxModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  exports: [ConfigModule, DatabaseModule, LoggerModule, OkxModule],
})
export class CoreModule {}
