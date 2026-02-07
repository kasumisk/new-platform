import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import {
  LoginDto,
  LoginByPhoneDto,
  RegisterDto,
  UpdateProfileDto,
} from './dto/auth.dto';
import type {
  LoginResponseDto,
  UserDto,
  SendCodeResponseDto,
} from '@ai-platform/shared';

@Injectable()
export class AdminService {
  // 模拟验证码存储 (生产环境应使用 Redis)
  private verificationCodes: Map<string, { code: string; expireAt: number }> =
    new Map();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 用户名密码登录
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { username, password } = loginDto;

    // 查找用户 (支持用户名、邮箱、手机号登录)
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.username = :username', { username })
      .orWhere('user.email = :username', { username })
      .orWhere('user.phone = :username', { username })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 检查用户状态
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('账号已被禁用');
    }

    // 更新最后登录时间
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    // 生成 JWT
    const token = this.generateToken(user);

    // 移除密码字段
    const { password: _loginPwd, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
  }

  /**
   * 手机验证码登录
   */
  async loginByPhone(
    loginByPhoneDto: LoginByPhoneDto,
  ): Promise<LoginResponseDto> {
    const { phone, code } = loginByPhoneDto;

    // 验证验证码
    if (!this.verifyCode(phone, code)) {
      throw new UnauthorizedException('验证码错误或已过期');
    }

    // 查找用户
    let user = await this.userRepository.findOne({ where: { phone } });

    // 如果用户不存在,自动注册
    if (!user) {
      user = await this.userRepository.save({
        username: `user_${phone.slice(-4)}`,
        phone,
        password: await bcrypt.hash(Math.random().toString(36), 10), // 随机密码
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
      });
    }

    // 更新最后登录时间
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    // 生成 JWT
    const token = this.generateToken(user);

    return { token, user };
  }

  /**
   * Token 登录
   */
  async loginByToken(token: string): Promise<LoginResponseDto> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      if (user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('账号已被禁用');
      }

      // 生成新的 token
      const newToken = this.generateToken(user);

      return { token: newToken, user };
    } catch {
      throw new UnauthorizedException('Token 无效或已过期');
    }
  }

  /**
   * 用户注册
   */
  async register(registerDto: RegisterDto): Promise<LoginResponseDto> {
    const { username, email, phone, password } = registerDto;

    // 检查用户名是否已存在
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }, { phone }],
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new ConflictException('用户名已存在');
      }
      if (existingUser.email === email) {
        throw new ConflictException('邮箱已被注册');
      }
      if (existingUser.phone === phone) {
        throw new ConflictException('手机号已被注册');
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await this.userRepository.save({
      username,
      email,
      phone,
      password: hashedPassword,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
    });

    // 生成 JWT
    const token = this.generateToken(user);

    // 移除密码字段
    const { password: _pwd, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
  }

  /**
   * 发送验证码
   */
  sendCode(phone: string, type: string): SendCodeResponseDto {
    // 生成 6 位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 存储验证码 (5分钟过期)
    this.verificationCodes.set(phone, {
      code,
      expireAt: Date.now() + 5 * 60 * 1000,
    });

    // TODO: 实际环境中应该调用短信服务
    console.log(`[验证码] 手机号: ${phone}, 验证码: ${code}, 类型: ${type}`);

    return { message: '验证码已发送' };
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(userId: string): Promise<UserDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return user;
  }

  /**
   * 更新用户资料
   */
  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserDto> {
    const user = await this.findById(userId);

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    await this.userRepository.update(userId, updateProfileDto);

    const updatedUser = await this.findById(userId);
    if (!updatedUser) {
      throw new BadRequestException('更新失败');
    }
    return updatedUser;
  }

  /**
   * 根据ID查找用户
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * 生成 JWT Token
   */
  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      isAdmin: user.isAdmin,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * 验证验证码
   */
  private verifyCode(phone: string, code: string): boolean {
    const storedCode = this.verificationCodes.get(phone);

    if (!storedCode) {
      return false;
    }

    if (Date.now() > storedCode.expireAt) {
      this.verificationCodes.delete(phone);
      return false;
    }

    if (storedCode.code !== code) {
      return false;
    }

    // 验证成功后删除验证码
    this.verificationCodes.delete(phone);
    return true;
  }
}
