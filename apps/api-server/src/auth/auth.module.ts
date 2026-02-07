import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '../entities/client.entity';
import { ApiKeyGuard } from './guards/api-key.guard';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Client])],
  providers: [AuthService, ApiKeyGuard],
  controllers: [AuthController],
  exports: [AuthService, ApiKeyGuard],
})
export class AuthModule {}
