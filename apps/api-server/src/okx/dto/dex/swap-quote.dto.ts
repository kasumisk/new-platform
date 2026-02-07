import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { SwapQuoteParams } from '../../../core/okx/dex.service';

/**
 * 代币兑换报价请求参数DTO
 */
export class SwapQuoteDto implements SwapQuoteParams {
  @ApiProperty({ description: '区块链ID', example: '1' })
  @IsString()
  chainId: string;

  @ApiProperty({
    description: '兑换数量（以fromToken的最小单位计）',
    example: '1000000000000000000',
  })
  @IsString()
  amount: string;

  @ApiProperty({
    description: '源代币地址',
    example: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // ETH
  })
  @IsString()
  fromTokenAddress: string;

  @ApiProperty({
    description: '目标代币地址',
    example: '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
  })
  @IsString()
  toTokenAddress: string;

  @ApiProperty({
    description: '自定义Gas价格（可选）',
    required: false,
  })
  @IsOptional()
  @IsString()
  gasPrice?: string;

  @ApiProperty({
    description: '滑点（可选，默认1%）',
    required: false,
    example: '1',
  })
  @IsOptional()
  @IsString()
  slippage?: string;

  @ApiProperty({
    description: '排除的协议（可选）',
    required: false,
  })
  @IsOptional()
  @IsString()
  excludeProtocols?: string;

  @ApiProperty({
    description: '包含的协议（可选）',
    required: false,
  })
  @IsOptional()
  @IsString()
  protocols?: string;
}
