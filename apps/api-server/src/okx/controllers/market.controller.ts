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
  OkxMarketService,
  NFTCollectionsData,
  NFTAssetsData,
  OrdinalsCollectionsData,
  OrdinalsInscriptionsData,
  NFTAssetsByAddressData,
} from '../../core/okx/market.service';
import { NFTCollectionsDto, NFTAssetsDto } from '../dto/market/nft.dto';
import {
  OrdinalsCollectionsDto,
  OrdinalsInscriptionsDto,
} from '../dto/market/ordinals.dto';
import {
  NFTAssetsByAddressRequestDto,
  NFTAssetsByAddressResponseDto,
} from '../dto/market/nft-assets-by-address.dto';

@ApiTags('OKX - 市场API')
@Controller('okx/market')
export class OkxMarketController {
  private readonly logger = new Logger(OkxMarketController.name);

  constructor(private readonly marketService: OkxMarketService) {}

  @Get('nft/collections')
  @ApiOperation({ summary: '获取NFT收藏品列表' })
  @ApiResponse({
    status: 200,
    description: '成功获取NFT收藏品列表',
  })
  async getNFTCollections(
    @Query() params: NFTCollectionsDto,
  ): Promise<NFTCollectionsData> {
    this.logger.log('获取NFT收藏品列表');
    try {
      return await this.marketService.getNFTCollections(params);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`获取NFT收藏品列表失败: ${message}`);
      throw new HttpException(
        `获取NFT收藏品列表失败: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('nft/assets')
  @ApiOperation({ summary: '获取NFT资产列表' })
  @ApiResponse({
    status: 200,
    description: '成功获取NFT资产列表',
  })
  async getNFTAssets(@Query() params: NFTAssetsDto): Promise<NFTAssetsData> {
    this.logger.log(
      `获取NFT资产列表: 链 ${params.chain}, 收藏品 ${params.collectionId}`,
    );
    try {
      return await this.marketService.getNFTAssets(params);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`获取NFT资产列表失败: ${message}`);
      throw new HttpException(
        `获取NFT资产列表失败: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('ordinals/collections')
  @ApiOperation({ summary: '获取BTC Ordinals收藏品列表' })
  @ApiResponse({
    status: 200,
    description: '成功获取BTC Ordinals收藏品列表',
  })
  async getOrdinalsCollections(
    @Query() params: OrdinalsCollectionsDto,
  ): Promise<OrdinalsCollectionsData> {
    this.logger.log('获取BTC Ordinals收藏品列表');
    try {
      return await this.marketService.getOrdinalsCollections(params);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`获取BTC Ordinals收藏品列表失败: ${message}`);
      throw new HttpException(
        `获取BTC Ordinals收藏品列表失败: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('ordinals/inscriptions')
  @ApiOperation({ summary: '获取BTC Ordinals铭文列表' })
  @ApiResponse({
    status: 200,
    description: '成功获取BTC Ordinals铭文列表',
  })
  async getOrdinalsInscriptions(
    @Query() params: OrdinalsInscriptionsDto,
  ): Promise<OrdinalsInscriptionsData> {
    this.logger.log(`获取BTC Ordinals铭文列表: 收藏品 ${params.slug}`);
    try {
      return await this.marketService.getOrdinalsInscriptions(params);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`获取BTC Ordinals铭文列表失败: ${message}`);
      throw new HttpException(
        `获取BTC Ordinals铭文列表失败: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('nft/assets-by-address')
  @ApiOperation({
    summary: '获取地址NFT资产列表',
    description:
      '根据钱包地址查询该地址拥有的NFT资产列表。必须提供ownerAddress参数（或者使用address，但建议使用ownerAddress）。',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取地址NFT资产列表',
    type: NFTAssetsByAddressResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误，缺少必要参数或参数格式不正确',
  })
  @ApiResponse({
    status: 500,
    description: '服务器内部错误',
  })
  async getNFTAssetsByAddress(
    @Query() params: NFTAssetsByAddressRequestDto,
  ): Promise<NFTAssetsByAddressData> {
    this.logger.log(
      `获取地址NFT资产列表: ${params.ownerAddress}, 链: ${params.chain || '所有'}`,
    );
    try {
      // 检查必要参数
      if (!params.ownerAddress) {
        this.logger.error('缺少必要参数: ownerAddress');
        throw new HttpException(
          '缺少必要参数: 钱包地址',
          HttpStatus.BAD_REQUEST,
        );
      }
      return await this.marketService.getNFTAssetsByAddress(params);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `获取地址NFT资产列表失败: ${message}`,
        error instanceof Error ? error.stack : undefined,
      );
      // 如果已经是HttpException，直接抛出
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `获取地址NFT资产列表失败: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
