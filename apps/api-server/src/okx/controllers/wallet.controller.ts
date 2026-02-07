import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Logger,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import {
  OkxWalletService,
  HistoricalPriceData,
  RealTimePriceData,
  TokenBalancesData,
} from '../../core/okx/wallet.service';
import { HistoricalPriceDto } from '../dto/wallet/historical-price.dto';
import { RealTimePriceDto } from '../dto/wallet/real-time-price.dto';
import {
  TokenBalancesRequestDto,
  TokenBalancesResponseDto,
} from '../dto/wallet/token-balances.dto';

@ApiTags('OKX - 钱包API')
@Controller('okx/wallet')
export class OkxWalletController {
  private readonly logger = new Logger(OkxWalletController.name);

  constructor(private readonly walletService: OkxWalletService) {}

  @Get('currencies')
  @ApiOperation({ summary: '获取支持的币种列表' })
  @ApiResponse({
    status: 200,
    description: '成功获取币种列表',
  })
  async getCurrencies() {
    this.logger.log('获取支持的币种列表');
    try {
      return await this.walletService.getCurrencies();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`获取币种列表失败: ${message}`);
      throw new HttpException(
        `获取币种列表失败: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('balance')
  @ApiOperation({ summary: '获取钱包余额' })
  @ApiResponse({
    status: 200,
    description: '成功获取钱包余额',
  })
  async getBalance() {
    this.logger.log('获取钱包余额');
    try {
      return await this.walletService.getBalance();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`获取钱包余额失败: ${message}`);
      throw new HttpException(
        `获取钱包余额失败: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('historical-price')
  @ApiOperation({ summary: '获取代币历史价格' })
  @ApiResponse({
    status: 200,
    description: '成功获取历史价格数据',
  })
  async getHistoricalPrice(
    @Query() params: HistoricalPriceDto,
  ): Promise<HistoricalPriceData[]> {
    this.logger.log(
      `获取历史价格，链ID: ${params.chainIndex}, 代币: ${params.tokenAddress || '原生代币'}`,
    );

    if (!params.chainIndex) {
      throw new HttpException('链ID不能为空', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.walletService.getHistoricalPrice(params);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`获取历史价格失败: ${message}`);
      throw new HttpException(
        `获取历史价格失败: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('real-time-price')
  @ApiOperation({ summary: '获取代币实时价格' })
  @ApiResponse({
    status: 200,
    description: '成功获取代币实时价格',
  })
  async getRealTimePrice(
    @Body() dto: RealTimePriceDto,
  ): Promise<RealTimePriceData[]> {
    this.logger.log(`获取代币实时价格，共${dto.tokens.length}个代币`);

    try {
      return await this.walletService.getRealTimePrice(dto.tokens);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`获取实时价格失败: ${message}`);
      throw new HttpException(
        `获取实时价格失败: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('token-price/:chainIndex/:tokenAddress')
  @ApiOperation({ summary: '获取单个代币实时价格' })
  @ApiParam({ name: 'chainIndex', description: '区块链唯一标识', example: '1' })
  @ApiParam({
    name: 'tokenAddress',
    description: '代币地址',
    example: '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取代币实时价格',
  })
  async getSingleTokenPrice(
    @Param('chainIndex') chainIndex: string,
    @Param('tokenAddress') tokenAddress: string,
  ): Promise<RealTimePriceData[]> {
    this.logger.log(
      `获取代币实时价格，链ID: ${chainIndex}, 代币地址: ${tokenAddress}`,
    );

    try {
      return await this.walletService.getSingleTokenPrice(
        chainIndex,
        tokenAddress,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`获取实时价格失败: ${message}`);
      throw new HttpException(
        `获取实时价格失败: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('token-balances')
  @ApiOperation({ summary: '获取地址资产明细' })
  @ApiResponse({
    status: 200,
    description: '成功获取地址资产明细',
    type: [TokenBalancesResponseDto],
  })
  async getTokenBalancesByAddress(
    @Query() params: TokenBalancesRequestDto,
  ): Promise<TokenBalancesData[]> {
    this.logger.log(
      `获取地址资产明细: ${params.address}, 链: ${params.chains}`,
    );

    try {
      return await this.walletService.getTokenBalancesByAddress(params);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`获取地址资产明细失败: ${message}`);
      throw new HttpException(
        `获取地址资产明细失败: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
