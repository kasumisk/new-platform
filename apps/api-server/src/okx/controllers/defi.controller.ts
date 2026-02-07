import {
  Controller,
  Get,
  Query,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  OkxDefiService,
  StakingProductsData,
  StakingProductDetailData,
  StakingQuoteData,
} from '../../core/okx/defi.service';
import {
  StakingProductsDto,
  StakingProductDetailDto,
  StakingQuoteDto,
} from '../dto/defi/staking.dto';

@ApiTags('OKX - DeFi API')
@Controller('okx/defi')
export class OkxDefiController {
  private readonly logger = new Logger(OkxDefiController.name);

  constructor(private readonly defiService: OkxDefiService) {}

  @Get('staking/products')
  @ApiOperation({ summary: '获取质押产品列表' })
  @ApiResponse({
    status: 200,
    description: '成功获取质押产品列表',
  })
  async getStakingProducts(
    @Query() params: StakingProductsDto,
  ): Promise<StakingProductsData> {
    this.logger.log('获取质押产品列表');
    try {
      return await this.defiService.getStakingProducts(params);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`获取质押产品列表失败: ${message}`);
      throw new HttpException(
        `获取质押产品列表失败: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('staking/product-details')
  @ApiOperation({ summary: '获取质押产品详情' })
  @ApiResponse({
    status: 200,
    description: '成功获取质押产品详情',
  })
  async getStakingProductDetail(
    @Query() params: StakingProductDetailDto,
  ): Promise<StakingProductDetailData> {
    this.logger.log(`获取质押产品详情: 产品ID ${params.productId}`);
    try {
      return await this.defiService.getStakingProductDetail(params);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`获取质押产品详情失败: ${message}`);
      throw new HttpException(
        `获取质押产品详情失败: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('staking/quote')
  @ApiOperation({ summary: '获取质押报价' })
  @ApiResponse({
    status: 200,
    description: '成功获取质押报价',
  })
  async getStakingQuote(
    @Query() params: StakingQuoteDto,
  ): Promise<StakingQuoteData> {
    this.logger.log(
      `获取质押报价: 产品ID ${params.productId}, 数量 ${params.amount}`,
    );
    try {
      return await this.defiService.getStakingQuote(params);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`获取质押报价失败: ${message}`);
      throw new HttpException(
        `获取质押报价失败: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
