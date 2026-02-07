import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 验证客户端凭证（用于测试）
   */
  @Public()
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validate(
    @Body() body: { apiKey: string; apiSecret: string },
  ): Promise<{ valid: boolean; client?: any }> {
    const client = await this.authService.validateClient(
      body.apiKey,
      body.apiSecret,
    );

    if (!client) {
      return { valid: false };
    }

    return {
      valid: true,
      client: {
        id: client.id,
        name: client.name,
        status: client.status,
      },
    };
  }
}
