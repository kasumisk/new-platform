import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import {
  StakingProductsParams,
  StakingProductDetailParams,
  StakingQuoteParams,
} from '../../../core/okx/defi.service';

/**
 * 质押产品列表参数DTO
 */
export class StakingProductsDto implements StakingProductsParams {
  @ApiProperty({
    description: '区块链名称',
    example: 'ETH',
    required: false,
  })
  @IsOptional()
  @IsString()
  chain?: string;

  @ApiProperty({
    description: '资产名称',
    example: 'ETH',
    required: false,
  })
  @IsOptional()
  @IsString()
  asset?: string;

  @ApiProperty({
    description: '协议名称',
    example: 'Lido',
    required: false,
  })
  @IsOptional()
  @IsString()
  protocol?: string;

  @ApiProperty({
    description: '产品类型',
    enum: ['Staking', 'Liquid Staking', 'DeFi Staking'],
    required: false,
  })
  @IsOptional()
  @IsString()
  productType?: 'Staking' | 'Liquid Staking' | 'DeFi Staking';

  @ApiProperty({
    description: '排序方式',
    enum: ['tvlDesc', 'tvlAsc', 'aprDesc', 'aprAsc'],
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: 'tvlDesc' | 'tvlAsc' | 'aprDesc' | 'aprAsc';

  @ApiProperty({
    description: '每页数量，默认20，最大100',
    example: 20,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiProperty({
    description: '偏移量，默认0',
    example: 0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset?: number;
}

/**
 * 质押产品详情参数DTO
 */
export class StakingProductDetailDto implements StakingProductDetailParams {
  @ApiProperty({
    description: '产品ID',
    example: 'lido_eth',
  })
  @IsString()
  productId: string;
}

/**
 * 质押报价参数DTO
 */
export class StakingQuoteDto implements StakingQuoteParams {
  @ApiProperty({
    description: '产品ID',
    example: 'lido_eth',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: '质押数量',
    example: '1',
  })
  @IsString()
  amount: string;

  @ApiProperty({
    description: '用户钱包地址',
    example: '0x1234567890123456789012345678901234567890',
  })
  @IsString()
  address: string;
}
