import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RealTimePriceParams } from '../../../core/okx/wallet.service';

/**
 * 实时价格单个代币参数DTO
 */
export class RealTimePriceItemDto implements RealTimePriceParams {
  @ApiProperty({ description: '区块链唯一标识', example: '1' })
  @IsString()
  chainIndex: string;

  @ApiProperty({
    description: '代币地址',
    example: '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72',
  })
  @IsString()
  tokenAddress: string;
}

/**
 * 实时价格查询参数DTO
 */
export class RealTimePriceDto {
  @ApiProperty({
    description: '代币列表，每个包含chainIndex和tokenAddress',
    type: [RealTimePriceItemDto],
    isArray: true,
    maxItems: 100,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RealTimePriceItemDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  tokens: RealTimePriceItemDto[];
}
