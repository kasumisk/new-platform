import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  OkxService,
  HistoricalPriceParams,
  RealTimePriceParams,
} from '../core/okx/okx.service';
import { Web3Service } from '../core/okx/web3.service';
import {
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// DTO for historical price API
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

// DTO for real-time price API
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

@ApiTags('OKX')
@Controller('okx')
export class OkxController {
  private readonly logger = new Logger(OkxController.name);

  constructor(
    private readonly okxService: OkxService,
    private readonly web3Service: Web3Service,
  ) {}

  @Get('health')
  @ApiOperation({ summary: '健康检查' })
  @ApiResponse({
    status: 200,
    description: 'API服务健康状态',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        okxApi: { type: 'boolean' },
        web3: { type: 'boolean' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async healthCheck() {
    try {
      const [okxApiHealth, web3Health] = await Promise.all([
        this.okxService.healthCheck().catch(() => false),
        this.web3Service.initializeWeb3().catch(() => false),
      ]);

      return {
        status: okxApiHealth && web3Health ? 'healthy' : 'degraded',
        okxApi: okxApiHealth,
        web3: web3Health,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('健康检查失败', error);
      return {
        status: 'unhealthy',
        okxApi: false,
        web3: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
