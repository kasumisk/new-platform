import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Client } from '../../entities/client.entity';

/**
 * 获取当前认证的客户端
 * 使用方式: @CurrentClient() client: Client
 */
export const CurrentClient = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Client => {
    const request = ctx.switchToHttp().getRequest();
    return request.client;
  },
);
