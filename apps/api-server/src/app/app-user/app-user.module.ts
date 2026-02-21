import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppUser } from '../../entities/app-user.entity';
import { AppUserService } from './app-user.service';
import { AppUserController } from './app-user.controller';
import { AppJwtStrategy } from './strategies/app-jwt.strategy';
import { AppJwtAuthGuard } from './guards/app-jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppUser]),
    PassportModule.register({ defaultStrategy: 'app-jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      signOptions: {
        expiresIn: '30d', // App 用户 token 有效期更长
      },
    }),
  ],
  providers: [AppUserService, AppJwtStrategy, AppJwtAuthGuard],
  controllers: [AppUserController],
  exports: [AppUserService, AppJwtAuthGuard],
})
export class AppUserModule {}
