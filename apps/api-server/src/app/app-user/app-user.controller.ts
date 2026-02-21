import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AppUserService } from './app-user.service';
import {
  AnonymousLoginDto,
  GoogleLoginDto,
  EmailRegisterDto,
  EmailLoginDto,
  EmailCodeLoginDto,
  SendEmailCodeDto,
  ResetPasswordDto,
  UpdateAppUserProfileDto,
  UpgradeAnonymousDto,
} from './dto/app-auth.dto';
import { Public } from '../../auth/decorators/public.decorator';
import { AppJwtAuthGuard } from './guards/app-jwt-auth.guard';
import { CurrentAppUser } from './decorators/current-app-user.decorator';

@ApiTags('App 用户认证')
@Controller('app/auth')
export class AppUserController {
  constructor(private readonly appUserService: AppUserService) {}

  // ==================== 公开接口（无需认证） ====================

  /**
   * 匿名登录
   * 根据设备 ID 创建或获取匿名用户，返回 JWT Token
   */
  @Public()
  @Post('anonymous')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '匿名登录' })
  async anonymousLogin(@Body() dto: AnonymousLoginDto) {
    return this.appUserService.anonymousLogin(dto.deviceId);
  }

  /**
   * Google 授权登录
   * 客户端传入 Google ID Token，服务端验证后创建或获取用户
   */
  @Public()
  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Google 授权登录' })
  async googleLogin(@Body() dto: GoogleLoginDto) {
    return this.appUserService.googleLogin(dto.idToken);
  }

  /**
   * 邮箱密码注册
   */
  @Public()
  @Post('email/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '邮箱注册' })
  async emailRegister(@Body() dto: EmailRegisterDto) {
    return this.appUserService.emailRegister(
      dto.email,
      dto.password,
      dto.nickname,
    );
  }

  /**
   * 邮箱密码登录
   */
  @Public()
  @Post('email/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '邮箱密码登录' })
  async emailLogin(@Body() dto: EmailLoginDto) {
    return this.appUserService.emailLogin(dto.email, dto.password);
  }

  /**
   * 邮箱验证码登录（预留，后续补充发邮件服务）
   */
  @Public()
  @Post('email/code-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '邮箱验证码登录' })
  async emailCodeLogin(@Body() dto: EmailCodeLoginDto) {
    return this.appUserService.emailCodeLogin(dto.email, dto.code);
  }

  /**
   * 发送邮箱验证码（预留，后续补充发邮件服务）
   */
  @Public()
  @Post('email/send-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '发送邮箱验证码' })
  async sendEmailCode(@Body() dto: SendEmailCodeDto) {
    return this.appUserService.generateEmailCode(dto.email, dto.type);
  }

  /**
   * 重置密码
   */
  @Public()
  @Post('email/reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '重置密码' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.appUserService.resetPassword(
      dto.email,
      dto.code,
      dto.newPassword,
    );
  }

  // ==================== 需要认证的接口 ====================

  /**
   * 获取当前用户信息
   */
  @Get('profile')
  @UseGuards(AppJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  async getProfile(@CurrentAppUser() user: any) {
    return this.appUserService.getUserInfo(user.id);
  }

  /**
   * 更新用户资料
   */
  @Put('profile')
  @UseGuards(AppJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新用户资料' })
  async updateProfile(
    @CurrentAppUser() user: any,
    @Body() dto: UpdateAppUserProfileDto,
  ) {
    return this.appUserService.updateProfile(user.id, dto);
  }

  /**
   * 匿名用户升级（绑定邮箱+密码）
   */
  @Post('upgrade')
  @UseGuards(AppJwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '匿名用户升级（绑定邮箱）' })
  async upgradeAnonymous(
    @CurrentAppUser() user: any,
    @Body() dto: UpgradeAnonymousDto,
  ) {
    return this.appUserService.upgradeAnonymous(
      user.id,
      dto.email,
      dto.password,
    );
  }

  /**
   * 刷新 Token
   */
  @Post('refresh')
  @UseGuards(AppJwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新 Token' })
  async refreshToken(@CurrentAppUser() user: any) {
    return this.appUserService.refreshToken(user.id);
  }

  /**
   * 退出登录
   */
  @Post('logout')
  @UseGuards(AppJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: '退出登录' })
  logout() {
    return { message: '退出成功' };
  }
}
