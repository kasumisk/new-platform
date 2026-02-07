import {
  Controller,
  Get,
  Query,
  Logger,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import {
  OkxDexService,
  TokensData,
  SwapQuoteData,
  CrossChainBridgesData,
  CrossChainQuoteData,
} from '../../core/okx/dex.service';
import { SwapQuoteDto } from '../dto/dex/swap-quote.dto';
import {
  CrossChainBridgesDto,
  CrossChainQuoteDto,
} from '../dto/dex/cross-chain.dto';

@ApiTags('OKX - DEX API')
@Controller('okx/dex')
export class OkxDexController {
  private readonly logger = new Logger(OkxDexController.name);

  constructor(private readonly dexService: OkxDexService) {}

  @Get('tokens/:chainId')
  @ApiOperation({ summary: '获取DEX支持的所有代币列表' })
  @ApiParam({ name: 'chainId', description: '区块链ID', example: '1' })
  @ApiResponse({
    status: 200,
    description: '成功获取代币列表',
  })
  async getAllTokens(@Param('chainId') chainId: string): Promise<TokensData> {
    this.logger.log(`获取链ID ${chainId} 支持的所有代币列表`);
    try {
      return await this.dexService.getAllTokens(chainId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`获取代币列表失败: ${message}`);
      throw new HttpException(
        `获取代币列表失败: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('quote')
  @ApiOperation({ summary: '获取代币兑换报价' })
  @ApiResponse({
    status: 200,
    description: '成功获取代币兑换报价',
  })
  async getSwapQuote(@Query() params: SwapQuoteDto): Promise<SwapQuoteData> {
    this.logger.log(
      `获取代币兑换报价: ${params.amount} 从 ${params.fromTokenAddress} 到 ${params.toTokenAddress} 在链 ${params.chainId}`,
    );
    try {
      return await this.dexService.getSwapQuote(params);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`获取兑换报价失败: ${message}`);
      throw new HttpException(
        `获取兑换报价失败: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('bridges')
  @ApiOperation({ summary: '获取跨链桥列表' })
  @ApiResponse({
    status: 200,
    description: '成功获取跨链桥列表',
  })
  async getCrossChainBridges(
    @Query() params: CrossChainBridgesDto,
  ): Promise<CrossChainBridgesData> {
    this.logger.log(
      `获取跨链桥列表: 从链 ${params.fromChainId} 到链 ${params.toChainId}`,
    );
    try {
      return await this.dexService.getCrossChainBridges(params);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`获取跨链桥列表失败: ${message}`);
      throw new HttpException(
        `获取跨链桥列表失败: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('cross-chain-quote')
  @ApiOperation({ summary: '获取跨链报价' })
  @ApiResponse({
    status: 200,
    description: '成功获取跨链报价',
  })
  async getCrossChainQuote(
    @Query() params: CrossChainQuoteDto,
  ): Promise<CrossChainQuoteData> {
    this.logger.log(
      `获取跨链报价: ${params.fromAmount} 从链 ${params.fromChainId} 到链 ${params.toChainId}`,
    );
    try {
      return await this.dexService.getCrossChainQuote(params);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`获取跨链报价失败: ${message}`);
      throw new HttpException(
        `获取跨链报价失败: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
