import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import {
  CrossChainBridgesParams,
  CrossChainQuoteParams,
} from '../../../core/okx/dex.service';

/**
 * 跨链桥列表参数DTO
 */
export class CrossChainBridgesDto implements CrossChainBridgesParams {
  @ApiProperty({ description: '源链ID', example: '1' }) // Ethereum
  @IsString()
  fromChainId: string;

  @ApiProperty({ description: '目标链ID', example: '56' }) // BSC
  @IsString()
  toChainId: string;

  @ApiProperty({
    description: '代币符号（可选）',
    required: false,
    example: 'USDT',
  })
  @IsOptional()
  @IsString()
  tokenSymbol?: string;
}

/**
 * 跨链报价参数DTO
 */
export class CrossChainQuoteDto implements CrossChainQuoteParams {
  @ApiProperty({ description: '源链ID', example: '1' })
  @IsString()
  fromChainId: string;

  @ApiProperty({ description: '目标链ID', example: '56' })
  @IsString()
  toChainId: string;

  @ApiProperty({
    description: '源代币地址',
    example: '0xdac17f958d2ee523a2206206994597c13d831ec7', // Ethereum USDT
  })
  @IsString()
  fromTokenAddress: string;

  @ApiProperty({
    description: '目标代币地址',
    example: '0x55d398326f99059ff775485246999027b3197955', // BSC USDT
  })
  @IsString()
  toTokenAddress: string;

  @ApiProperty({
    description: '兑换数量（以源代币的最小单位计）',
    example: '1000000', // 1 USDT (6 decimals)
  })
  @IsString()
  fromAmount: string;

  @ApiProperty({
    description: '跨链桥ID（可选）',
    required: false,
  })
  @IsOptional()
  @IsString()
  bridgeId?: string;

  @ApiProperty({
    description: '滑点（可选，默认1%）',
    required: false,
    example: '1',
  })
  @IsOptional()
  @IsString()
  slippage?: string;
}
