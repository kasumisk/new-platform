import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppVersion } from '../entities/app-version.entity';
import { AppVersionPackage } from '../entities/app-version-package.entity';
import { AppUpdateController } from './app-update.controller';
import { AppVersionService } from '../admin/services/app-version.service';

@Module({
  imports: [TypeOrmModule.forFeature([AppVersion, AppVersionPackage])],
  controllers: [AppUpdateController],
  providers: [AppVersionService],
  exports: [AppVersionService],
})
export class AppUpdateModule {}
