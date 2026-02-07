import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import {
  OrdinalsCollectionsParams,
  OrdinalsInscriptionsParams,
} from '../../../core/okx/market.service';

/**
 * BTC Ordinals 收藏品查询参数DTO
 */
export class OrdinalsCollectionsDto implements OrdinalsCollectionsParams {
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
 * BTC Ordinals 铭文查询参数DTO
 */
export class OrdinalsInscriptionsDto implements OrdinalsInscriptionsParams {
  @ApiProperty({
    description: '收藏品标识',
    example: 'ordinalspunks',
  })
  @IsString()
  slug: string;

  @ApiProperty({
    description: '排序方式',
    enum: [
      'priceAsc',
      'priceDesc',
      'listingTimeAsc',
      'listingTimeDesc',
      'inscriptionNumberAsc',
      'inscriptionNumberDesc',
    ],
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?:
    | 'priceAsc'
    | 'priceDesc'
    | 'listingTimeAsc'
    | 'listingTimeDesc'
    | 'inscriptionNumberAsc'
    | 'inscriptionNumberDesc';

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
}
