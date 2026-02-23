import { Module } from '@nestjs/common';
import { AppFileController } from './app-file.controller';
import { AppUserModule } from './app-user/app-user.module';

@Module({
  imports: [AppUserModule],
  controllers: [AppFileController],
})
export class AppFileModule {}
