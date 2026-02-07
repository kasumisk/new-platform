import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import {
  NFTCollectionsParams,
  NFTAssetsParams,
} from '../../../core/okx/market.service';

/**
 * NFT 收藏品查询参数DTO
 */
export class NFTCollectionsDto implements NFTCollectionsParams {
  @ApiProperty({
    description: '区块链名称',
    example: 'eth',
    required: false,
  })
  @IsOptional()
  @IsString()
  chain?: string;

  @ApiProperty({
    description: '排序方式',
    enum: ['volumeDesc', 'volumeAsc', 'floorPriceDesc', 'floorPriceAsc'],
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: 'volumeDesc' | 'volumeAsc' | 'floorPriceDesc' | 'floorPriceAsc';

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
 * NFT 资产查询参数DTO
 */
export class NFTAssetsDto implements NFTAssetsParams {
  @ApiProperty({
    description: '区块链名称',
    example: 'eth',
  })
  @IsString()
  chain: string;

  @ApiProperty({
    description: '收藏品ID',
    example: '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85', // ENS
  })
  @IsString()
  collectionId: string;

  @ApiProperty({
    description: '排序方式',
    enum: ['priceAsc', 'priceDesc', 'listingTimeAsc', 'listingTimeDesc'],
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: 'priceAsc' | 'priceDesc' | 'listingTimeAsc' | 'listingTimeDesc';

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

  @ApiProperty({
    description: '最低价格',
    example: '0.1',
    required: false,
  })
  @IsOptional()
  @IsString()
  minPrice?: string;

  @ApiProperty({
    description: '最高价格',
    example: '10',
    required: false,
  })
  @IsOptional()
  @IsString()
  maxPrice?: string;

  @ApiProperty({
    description: '稀有度',
    required: false,
  })
  @IsOptional()
  @IsString()
  rarity?: string;
}
