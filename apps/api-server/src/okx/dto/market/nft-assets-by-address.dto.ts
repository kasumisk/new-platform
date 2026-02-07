import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * NFT资产列表查询参数DTO
 */
export class NFTAssetsByAddressRequestDto {
  @ApiProperty({
    description: '钱包地址',
    example: '0xEd0C6079229E2d407672a117c22b62064f4a4312',
  })
  @IsString()
  @Transform(({ value, obj }: { value: string; obj: Record<string, any> }) => {
    // 如果提供了address但没有提供ownerAddress，使用address作为ownerAddress
    if (!value && typeof obj.address === 'string') {
      return obj.address;
    }
    return value;
  })
  ownerAddress: string;

  @ApiProperty({
    description: '区块链名称',
    example: 'eth',
    required: false,
  })
  @IsOptional()
  @IsString()
  chain: string;

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
 * NFT资产项DTO
 */
export class NFTAssetItemDto {
  @ApiProperty({ description: '区块链名称' })
  chain: string;

  @ApiProperty({ description: '合约地址' })
  contractAddress: string;

  @ApiProperty({ description: '代币ID' })
  tokenId: string;

  @ApiProperty({ description: 'NFT名称' })
  name: string;

  @ApiProperty({ description: '收藏品名称' })
  collectionName: string;

  @ApiProperty({ description: '图片URL' })
  imageUrl: string;

  @ApiProperty({ description: '最近价格' })
  latestPrice: string;

  @ApiProperty({ description: '最近价格币种' })
  latestPriceCurrency: string;

  @ApiProperty({ description: '估价(USD)' })
  estimatedValue: string;

  @ApiProperty({ description: '收藏品ID' })
  collectionId: string;

  @ApiProperty({ description: '当前所有者地址' })
  owner: string;

  @ApiProperty({ description: '区块链浏览器链接' })
  exploreUrl: string;
}

/**
 * NFT资产列表响应DTO
 */
export class NFTAssetsByAddressResponseDto {
  @ApiProperty({ description: '总资产数量' })
  total: number;

  @ApiProperty({ type: [NFTAssetItemDto], description: 'NFT资产列表' })
  assets: NFTAssetItemDto[];
}
