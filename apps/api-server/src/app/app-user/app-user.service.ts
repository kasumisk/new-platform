import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { HttpsProxyAgent } from 'https-proxy-agent';
import nodeFetch from 'node-fetch';
import {
  AppUser,
  AppUserAuthType,
  AppUserStatus,
} from '../../entities/app-user.entity';
import type {
  AppLoginResponseDto,
  AppUserResponseDto,
} from './dto/app-auth.dto';

@Injectable()
export class AppUserService {
  private readonly logger = new Logger(AppUserService.name);

  // 邮箱验证码存储（生产环境应使用 Redis）
  private emailCodes: Map<string, { code: string; expireAt: number }> =
    new Map();

  constructor(
    @InjectRepository(AppUser)
    private readonly appUserRepository: Repository<AppUser>,
    private readonly jwtService: JwtService,
  ) {}

  // ==================== 匿名登录 ====================

  /**
   * 匿名登录
   * 根据 deviceId 查找或创建匿名用户
   */
  async anonymousLogin(deviceId: string): Promise<AppLoginResponseDto> {
    let user = await this.appUserRepository.findOne({
      where: { deviceId, authType: AppUserAuthType.ANONYMOUS },
    });

    let isNewUser = false;

    if (!user) {
      // 创建匿名用户
      user = this.appUserRepository.create({
        authType: AppUserAuthType.ANONYMOUS,
        deviceId,
        nickname: `用户${crypto.randomBytes(3).toString('hex')}`,
        status: AppUserStatus.ACTIVE,
      });
      user = await this.appUserRepository.save(user);
      isNewUser = true;
      this.logger.log(`匿名用户创建成功: ${user.id}, deviceId: ${deviceId}`);
    }

    // 更新最后登录时间
    await this.appUserRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    const token = this.generateToken(user);
    return {
      token,
      user: this.toUserResponse(user),
      isNewUser,
    };
  }

  // ==================== Google 登录 ====================

  /**
   * Google 授权登录
   * 客户端获取 Google ID Token 后传给服务端验证
   */
  async googleLogin(idToken: string): Promise<AppLoginResponseDto> {
    // 验证 Google ID Token 并提取用户信息
    const googleUserInfo = await this.verifyGoogleToken(idToken);

    let user = await this.appUserRepository.findOne({
      where: { googleId: googleUserInfo.sub },
    });

    let isNewUser = false;

    if (!user) {
      // 检查是否已有相同邮箱的用户（可能是邮箱注册的用户）
      if (googleUserInfo.email) {
        const existingEmailUser = await this.appUserRepository.findOne({
          where: { email: googleUserInfo.email },
        });
        if (existingEmailUser) {
          // 绑定 Google ID 到现有邮箱用户
          existingEmailUser.googleId = googleUserInfo.sub;
          existingEmailUser.emailVerified = true;
          if (!existingEmailUser.avatar && googleUserInfo.picture) {
            existingEmailUser.avatar = googleUserInfo.picture;
          }
          if (!existingEmailUser.nickname && googleUserInfo.name) {
            existingEmailUser.nickname = googleUserInfo.name;
          }
          user = await this.appUserRepository.save(existingEmailUser);
          this.logger.log(`Google 账号绑定到已有邮箱用户: ${user.id}`);
        }
      }

      if (!user) {
        // 创建新的 Google 用户
        user = this.appUserRepository.create({
          authType: AppUserAuthType.GOOGLE,
          googleId: googleUserInfo.sub,
          email: googleUserInfo.email,
          nickname: googleUserInfo.name || `Google用户`,
          avatar: googleUserInfo.picture,
          emailVerified: !!googleUserInfo.email_verified,
          status: AppUserStatus.ACTIVE,
        });
        user = await this.appUserRepository.save(user);
        isNewUser = true;
        this.logger.log(`Google 用户创建成功: ${user.id}`);
      }
    }

    // 更新最后登录时间
    await this.appUserRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    const token = this.generateToken(user);
    return {
      token,
      user: this.toUserResponse(user),
      isNewUser,
    };
  }

  // ==================== 邮箱登录/注册 ====================

  /**
   * 邮箱密码注册
   */
  async emailRegister(
    email: string,
    password: string,
    nickname?: string,
  ): Promise<AppLoginResponseDto> {
    // 检查邮箱是否已注册
    const existing = await this.appUserRepository.findOne({
      where: { email },
    });

    if (existing) {
      throw new ConflictException('该邮箱已被注册');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.appUserRepository.create({
      authType: AppUserAuthType.EMAIL,
      email,
      password: hashedPassword,
      nickname: nickname || `用户${crypto.randomBytes(3).toString('hex')}`,
      emailVerified: false, // 需要后续验证邮箱
      status: AppUserStatus.ACTIVE,
    });

    const savedUser = await this.appUserRepository.save(user);
    this.logger.log(`邮箱用户注册成功: ${savedUser.id}, email: ${email}`);

    const token = this.generateToken(savedUser);
    return {
      token,
      user: this.toUserResponse(savedUser),
      isNewUser: true,
    };
  }

  /**
   * 邮箱密码登录
   */
  async emailLogin(
    email: string,
    password: string,
  ): Promise<AppLoginResponseDto> {
    const user = await this.appUserRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    if (!user.password) {
      throw new UnauthorizedException('该邮箱未设置密码，请使用其他方式登录');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    if (user.status !== AppUserStatus.ACTIVE) {
      throw new UnauthorizedException('账号已被禁用');
    }

    // 更新最后登录时间
    await this.appUserRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    const token = this.generateToken(user);
    return {
      token,
      user: this.toUserResponse(user),
      isNewUser: false,
    };
  }

  /**
   * 邮箱验证码登录（预留，验证码通过邮件发送）
   */
  async emailCodeLogin(
    email: string,
    code: string,
  ): Promise<AppLoginResponseDto> {
    // 验证验证码
    if (!this.verifyEmailCode(email, code)) {
      throw new UnauthorizedException('验证码错误或已过期');
    }

    let user = await this.appUserRepository.findOne({
      where: { email },
    });

    let isNewUser = false;

    if (!user) {
      // 自动注册
      user = this.appUserRepository.create({
        authType: AppUserAuthType.EMAIL,
        email,
        nickname: `用户${crypto.randomBytes(3).toString('hex')}`,
        emailVerified: true,
        status: AppUserStatus.ACTIVE,
      });
      user = await this.appUserRepository.save(user);
      isNewUser = true;
    } else {
      // 标记邮箱已验证
      if (!user.emailVerified) {
        user.emailVerified = true;
        await this.appUserRepository.save(user);
      }
    }

    // 更新最后登录时间
    await this.appUserRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    const token = this.generateToken(user);
    return {
      token,
      user: this.toUserResponse(user),
      isNewUser,
    };
  }

  // ==================== 验证码管理 ====================

  /**
   * 生成并存储邮箱验证码
   * TODO: 发送邮件（后续补充）
   */
  generateEmailCode(email: string, type: string): { message: string } {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    this.emailCodes.set(email, {
      code,
      expireAt: Date.now() + 5 * 60 * 1000, // 5分钟过期
    });

    // TODO: 调用邮件服务发送验证码
    this.logger.log(
      `[邮箱验证码] email: ${email}, code: ${code}, type: ${type}`,
    );

    return { message: '验证码已发送' };
  }

  // ==================== 密码重置 ====================

  /**
   * 通过邮箱验证码重置密码
   */
  async resetPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    if (!this.verifyEmailCode(email, code)) {
      throw new BadRequestException('验证码错误或已过期');
    }

    const user = await this.appUserRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.appUserRepository.save(user);

    return { message: '密码重置成功' };
  }

  // ==================== 用户信息管理 ====================

  /**
   * 获取用户信息
   */
  async getUserInfo(userId: string): Promise<AppUserResponseDto> {
    const user = await this.appUserRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return this.toUserResponse(user);
  }

  /**
   * 更新用户资料
   */
  async updateProfile(
    userId: string,
    data: { nickname?: string; avatar?: string },
  ): Promise<AppUserResponseDto> {
    const user = await this.appUserRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    if (data.nickname !== undefined) user.nickname = data.nickname;
    if (data.avatar !== undefined) user.avatar = data.avatar;

    const updated = await this.appUserRepository.save(user);
    return this.toUserResponse(updated);
  }

  /**
   * 匿名用户升级（绑定邮箱+密码）
   */
  async upgradeAnonymous(
    userId: string,
    email: string,
    password: string,
  ): Promise<AppLoginResponseDto> {
    const user = await this.appUserRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    if (user.authType !== AppUserAuthType.ANONYMOUS) {
      throw new BadRequestException('仅匿名用户可升级');
    }

    // 检查邮箱是否已被使用
    const existing = await this.appUserRepository.findOne({
      where: { email },
    });
    if (existing) {
      throw new ConflictException('该邮箱已被注册');
    }

    user.authType = AppUserAuthType.EMAIL;
    user.email = email;
    user.password = await bcrypt.hash(password, 10);

    const updated = await this.appUserRepository.save(user);

    const token = this.generateToken(updated);
    return {
      token,
      user: this.toUserResponse(updated),
      isNewUser: false,
    };
  }

  /**
   * Token 刷新
   */
  async refreshToken(userId: string): Promise<{ token: string }> {
    const user = await this.appUserRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (user.status !== AppUserStatus.ACTIVE) {
      throw new UnauthorizedException('账号已被禁用');
    }

    const token = this.generateToken(user);
    return { token };
  }

  /**
   * 根据ID查找用户
   */
  async findById(id: string): Promise<AppUser | null> {
    return this.appUserRepository.findOne({ where: { id } });
  }

  // ==================== 私有方法 ====================

  /**
   * 生成 JWT Token
   */
  private generateToken(user: AppUser): string {
    const payload = {
      sub: user.id,
      authType: user.authType,
      type: 'app',
    };

    return this.jwtService.sign(payload);
  }

  /**
   * 获取代理 agent（若配置了 PROXY_HOST 和 PROXY_PORT）
   */
  private getProxyAgent(): HttpsProxyAgent<string> | undefined {
    const host = process.env.PROXY_HOST;
    const port = process.env.PROXY_PORT;
    if (!host || !port) return undefined;
    const auth =
      process.env.PROXY_USERNAME && process.env.PROXY_PASSWORD
        ? `${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@`
        : '';
    return new HttpsProxyAgent(`http://${auth}${host}:${port}`);
  }

  /**
   * 验证 Google Token（支持 id_token 和 access_token）
   */
  private async verifyGoogleToken(token: string): Promise<{
    sub: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  }> {
    // 先尝试作为 id_token 验证
    try {
      const idTokenResult = await this.verifyGoogleIdToken(token);
      if (idTokenResult) return idTokenResult;
    } catch {
      // id_token 验证失败，尝试 access_token
    }

    // 再尝试作为 access_token 通过 userinfo 端点获取
    try {
      const agent = this.getProxyAgent();
      const response = await nodeFetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: { Authorization: `Bearer ${token}` },
          ...(agent ? { agent } : {}),
        },
      );

      if (!response.ok) {
        throw new UnauthorizedException('Google Token 验证失败');
      }

      const payload = await response.json();

      if (!payload.sub) {
        throw new UnauthorizedException('Google Token 无效');
      }

      return {
        sub: payload.sub,
        email: payload.email,
        email_verified: payload.email_verified,
        name: payload.name,
        picture: payload.picture,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Google Token 验证异常', error);
      throw new UnauthorizedException('Google 授权验证失败');
    }
  }

  /**
   * 验证 Google ID Token
   */
  private async verifyGoogleIdToken(idToken: string): Promise<{
    sub: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  } | null> {
    const agent = this.getProxyAgent();
    const response = await nodeFetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
      ...(agent ? [{ agent }] : []),
    );

    if (!response.ok) return null;

    const payload = await response.json();

    // 验证 audience（可配置 Google Client ID）
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (googleClientId && payload.aud !== googleClientId) {
      throw new UnauthorizedException('Google Token audience 不匹配');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      email_verified: payload.email_verified === 'true',
      name: payload.name,
      picture: payload.picture,
    };
  }

  /**
   * 验证邮箱验证码
   */
  private verifyEmailCode(email: string, code: string): boolean {
    const stored = this.emailCodes.get(email);

    if (!stored) return false;
    if (Date.now() > stored.expireAt) {
      this.emailCodes.delete(email);
      return false;
    }
    if (stored.code !== code) return false;

    this.emailCodes.delete(email);
    return true;
  }

  /**
   * 转换为响应 DTO
   */
  private toUserResponse(user: AppUser): AppUserResponseDto {
    return {
      id: user.id,
      authType: user.authType,
      email: user.email,
      nickname: user.nickname,
      avatar: user.avatar,
      status: user.status,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
