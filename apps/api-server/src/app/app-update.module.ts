import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppVersion } from '../entities/app-version.entity';
import { AppUpdateController } from './app-update.controller';
import { AppVersionService } from '../admin/services/app-version.service';

@Module({
  imports: [TypeOrmModule.forFeature([AppVersion])],
  controllers: [AppUpdateController],
  providers: [AppVersionService],
  exports: [AppVersionService],
})
export class AppUpdateModule {}
