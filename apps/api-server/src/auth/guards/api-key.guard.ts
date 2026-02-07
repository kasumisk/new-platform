import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../../entities/client.entity';
import * as crypto from 'crypto';

/**
 * API Key 认证守卫
 * 验证请求头中的 X-API-Key 和 X-API-Secret
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const apiSecret = request.headers['x-api-secret'];

    if (!apiKey || !apiSecret) {
      throw new UnauthorizedException('API Key and Secret are required');
    }

    // 查找客户端
    const client = await this.clientRepository.findOne({
      where: { apiKey: apiKey as string },
      relations: ['permissions'],
    });

    if (!client) {
      throw new UnauthorizedException('Invalid API Key');
    }

    // 验证状态
    if (client.status !== 'active') {
      throw new UnauthorizedException('Client is not active');
    }

    // 验证 API Secret
    const isValidSecret = this.verifySecret(
      apiSecret as string,
      client.apiSecret,
    );

    if (!isValidSecret) {
      throw new UnauthorizedException('Invalid API Secret');
    }

    // 将客户端信息附加到请求对象
    request.client = client;

    return true;
  }

  /**
   * 验证 API Secret
   * 支持明文比对和哈希比对
   */
  private verifySecret(providedSecret: string, storedSecret: string): boolean {
    // 直接比对（开发环境）
    if (providedSecret === storedSecret) {
      return true;
    }

    // 哈希比对（生产环境）
    try {
      const hash = crypto
        .createHash('sha256')
        .update(providedSecret)
        .digest('hex');
      return hash === storedSecret;
    } catch {
      return false;
    }
  }
}
