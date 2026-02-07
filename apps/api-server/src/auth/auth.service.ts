import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../entities/client.entity';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  /**
   * 创建新客户端
   */
  async createClient(data: {
    name: string;
    description?: string;
    quotaConfig?: any;
    metadata?: any;
  }): Promise<{ client: Client; apiKey: string; apiSecret: string }> {
    // 生成 API Key 和 Secret
    const apiKey = this.generateApiKey();
    const apiSecret = this.generateApiSecret();

    // 哈希 Secret（生产环境应该存储哈希值）
    const hashedSecret =
      process.env.NODE_ENV === 'production'
        ? crypto.createHash('sha256').update(apiSecret).digest('hex')
        : apiSecret;

    const client = this.clientRepository.create({
      ...data,
      apiKey,
      apiSecret: hashedSecret,
      status: 'active',
    });

    await this.clientRepository.save(client);

    return {
      client,
      apiKey,
      apiSecret, // 返回原始 Secret，仅此一次
    };
  }

  /**
   * 验证客户端凭证
   */
  async validateClient(
    apiKey: string,
    apiSecret: string,
  ): Promise<Client | null> {
    const client = await this.clientRepository.findOne({
      where: { apiKey },
      relations: ['permissions'],
    });

    if (!client || client.status !== 'active') {
      return null;
    }

    // 验证 Secret
    const isValid =
      process.env.NODE_ENV === 'production'
        ? crypto.createHash('sha256').update(apiSecret).digest('hex') ===
          client.apiSecret
        : apiSecret === client.apiSecret;

    return isValid ? client : null;
  }

  /**
   * 重新生成 API Secret
   */
  async regenerateSecret(clientId: string): Promise<string> {
    const newSecret = this.generateApiSecret();
    const hashedSecret =
      process.env.NODE_ENV === 'production'
        ? crypto.createHash('sha256').update(newSecret).digest('hex')
        : newSecret;

    await this.clientRepository.update(clientId, {
      apiSecret: hashedSecret,
    });

    return newSecret;
  }

  /**
   * 更新客户端状态
   */
  async updateClientStatus(
    clientId: string,
    status: 'active' | 'suspended' | 'inactive',
  ): Promise<void> {
    await this.clientRepository.update(clientId, { status });
  }

  /**
   * 生成 API Key (32字符)
   */
  private generateApiKey(): string {
    return `ak_${crypto.randomBytes(20).toString('hex')}`;
  }

  /**
   * 生成 API Secret (64字符)
   */
  private generateApiSecret(): string {
    return `sk_${crypto.randomBytes(32).toString('hex')}`;
  }
}
