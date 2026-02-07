import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { HistoricalPriceParams } from '../../../core/okx/wallet.service';

/**
 * 历史价格查询参数DTO
 */
export class HistoricalPriceDto implements HistoricalPriceParams {
  @ApiProperty({ description: '区块链唯一标识', example: '1' })
  @IsString()
  chainIndex: string;

  @ApiProperty({
    description: '代币地址，为空表示查询原生代币',
    required: false,
    example: '',
  })
  @IsOptional()
  @IsString()
  tokenAddress?: string;

  @ApiProperty({
    description: '每次查询的条目数，默认50，最大200',
    required: false,
    example: '50',
  })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiProperty({ description: '光标位置，默认为第一条', required: false })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({
    description: '开始时间戳（毫秒）',
    required: false,
    example: '1700040600000',
  })
  @IsOptional()
  @IsString()
  begin?: string;

  @ApiProperty({ description: '结束时间戳（毫秒）', required: false })
  @IsOptional()
  @IsString()
  end?: string;

  @ApiProperty({
    description: '时间间隔',
    required: false,
    enum: ['1m', '5m', '30m', '1h', '1d'],
    default: '1d',
  })
  @IsOptional()
  @IsString()
  period?: '1m' | '5m' | '30m' | '1h' | '1d';
}
