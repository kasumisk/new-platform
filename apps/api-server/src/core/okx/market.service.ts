import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from '../config/configuration';
import { OkxBaseService } from './base.service';

// NFT 收藏品查询参数
export interface NFTCollectionsParams {
  chain?: string; // 区块链名称，如 'eth', 'sol'
  sortBy?: 'volumeDesc' | 'volumeAsc' | 'floorPriceDesc' | 'floorPriceAsc';
  limit?: number; // 默认20，最大100
  offset?: number; // 默认0
}

// NFT 收藏品数据
export interface NFTCollectionsData {
  totalCount: number;
  collections: Array<{
    chain: string;
    collectionId: string;
    name: string;
    contractAddress: string;
    description: string;
    imageUrl: string;
    floorPrice: string;
    volume24h: string;
    volumeTotal: string;
    items: number;
    owners: number;
  }>;
}

// NFT 资产查询参数
export interface NFTAssetsParams {
  chain: string; // 区块链名称，如 'eth', 'sol'
  collectionId: string; // 收藏品ID
  sortBy?: 'priceAsc' | 'priceDesc' | 'listingTimeAsc' | 'listingTimeDesc';
  limit?: number; // 默认20，最大100
  offset?: number; // 默认0
  minPrice?: string; // 最低价格
  maxPrice?: string; // 最高价格
  rarity?: string; // 稀有度
}

// NFT 资产数据
export interface NFTAssetsData {
  totalCount: number;
  assets: Array<{
    assetId: string;
    name: string;
    collectionName: string;
    contractAddress: string;
    tokenId: string;
    imageUrl: string;
    price: string;
    paymentToken: string;
    rarity: string;
    listingTime: string;
    attributes: Array<{
      traitType: string;
      value: string;
    }>;
  }>;
}

// BTC Ordinals 收藏品查询参数
export interface OrdinalsCollectionsParams {
  sortBy?: 'volumeDesc' | 'volumeAsc' | 'floorPriceDesc' | 'floorPriceAsc';
  limit?: number; // 默认20，最大100
  offset?: number; // 默认0
}

// BTC Ordinals 收藏品数据
export interface OrdinalsCollectionsData {
  totalCount: number;
  collections: Array<{
    slug: string;
    name: string;
    description: string;
    imageUrl: string;
    floorPrice: string;
    volume24h: string;
    volumeTotal: string;
    items: number;
    holders: number;
    launchTime: string;
  }>;
}

// BTC Ordinals 铭文查询参数
export interface OrdinalsInscriptionsParams {
  slug: string; // 收藏品标识
  sortBy?:
    | 'priceAsc'
    | 'priceDesc'
    | 'listingTimeAsc'
    | 'listingTimeDesc'
    | 'inscriptionNumberAsc'
    | 'inscriptionNumberDesc';
  limit?: number; // 默认20，最大100
  offset?: number; // 默认0
  minPrice?: string; // 最低价格
  maxPrice?: string; // 最高价格
}

// BTC Ordinals 铭文数据
export interface OrdinalsInscriptionsData {
  totalCount: number;
  inscriptions: Array<{
    inscriptionId: string;
    inscriptionNumber: number;
    contentType: string;
    previewUrl: string;
    sat: string;
    price: string;
    listingTime: string;
    attributes: Array<{
      traitType: string;
      value: string;
    }>;
  }>;
}

// 地址NFT资产查询参数
export interface NFTAssetsByAddressParams {
  ownerAddress: string; // 钱包地址
  chain: string; // 区块链名称
  contractAddress?: string; // 合约地址
  limit?: number; // 每页数量，默认20，最大100
  offset?: number; // 偏移量，默认0
}

// 地址NFT资产数据
export interface NFTAssetsByAddressData {
  total: number;
  assets: Array<{
    chain: string; // 区块链名称
    contractAddress: string; // 合约地址
    tokenId: string; // 代币ID
    name: string; // NFT名称
    collectionName: string; // 收藏品名称
    imageUrl: string; // 图片URL
    latestPrice: string; // 最近价格
    latestPriceCurrency: string; // 最近价格币种
    estimatedValue: string; // 估价(USD)
    collectionId: string; // 收藏品ID
    owner: string; // 当前所有者地址
    exploreUrl: string; // 区块链浏览器链接
  }>;
}

@Injectable()
export class OkxMarketService extends OkxBaseService {
  protected readonly logger = new Logger('OkxMarketService');
  constructor(protected readonly configService: ConfigService<Config>) {
    super(configService);
    this.logger.log('OKX Market Service initialized');
  }

  /**
   * 获取NFT收藏品列表
   * @param params 查询参数
   */
  async getNFTCollections(
    params?: NFTCollectionsParams,
  ): Promise<NFTCollectionsData> {
    const queryParams: Record<string, string> = {};

    if (params) {
      if (params.chain) queryParams.chain = params.chain;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.limit) queryParams.limit = String(params.limit);
      if (params.offset) queryParams.offset = String(params.offset);
    }

    return this.sendGetRequest<NFTCollectionsData>(
      '/api/v5/mktplace/nft/collections',
      queryParams,
    );
  }

  /**
   * 获取NFT资产列表
   * @param params 查询参数
   */
  async getNFTAssets(params: NFTAssetsParams): Promise<NFTAssetsData> {
    const queryParams: Record<string, string> = {
      chain: params.chain,
      collectionId: params.collectionId,
    };

    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.limit) queryParams.limit = String(params.limit);
    if (params.offset) queryParams.offset = String(params.offset);
    if (params.minPrice) queryParams.minPrice = params.minPrice;
    if (params.maxPrice) queryParams.maxPrice = params.maxPrice;
    if (params.rarity) queryParams.rarity = params.rarity;

    return this.sendGetRequest<NFTAssetsData>(
      '/api/v5/mktplace/nft/assets',
      queryParams,
    );
  }

  /**
   * 获取BTC Ordinals收藏品列表
   * @param params 查询参数
   */
  async getOrdinalsCollections(
    params?: OrdinalsCollectionsParams,
  ): Promise<OrdinalsCollectionsData> {
    const queryParams: Record<string, string> = {};

    if (params) {
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.limit) queryParams.limit = String(params.limit);
      if (params.offset) queryParams.offset = String(params.offset);
    }

    return this.sendGetRequest<OrdinalsCollectionsData>(
      '/api/v5/mktplace/nft/ordinals/collections',
      queryParams,
    );
  }

  /**
   * 获取BTC Ordinals铭文列表
   * @param params 查询参数
   */
  async getOrdinalsInscriptions(
    params: OrdinalsInscriptionsParams,
  ): Promise<OrdinalsInscriptionsData> {
    const queryParams: Record<string, string> = {
      slug: params.slug,
    };

    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.limit) queryParams.limit = String(params.limit);
    if (params.offset) queryParams.offset = String(params.offset);
    if (params.minPrice) queryParams.minPrice = params.minPrice;
    if (params.maxPrice) queryParams.maxPrice = params.maxPrice;

    return this.sendGetRequest<OrdinalsInscriptionsData>(
      '/api/v5/mktplace/nft/ordinals/listings',
      queryParams,
    );
  }

  /**
   * 获取地址NFT资产列表
   * @param params 查询参数
   */
  async getNFTAssetsByAddress(
    params: NFTAssetsByAddressParams,
  ): Promise<NFTAssetsByAddressData> {
    this.logger.log(
      `查询地址NFT资产: ${params.ownerAddress}, 链: ${params.chain || '所有'}`,
    );

    if (!params.ownerAddress) {
      const error = new Error('Parameter {ownerAddress} cannot be empty');
      this.logger.error('缺少必要参数: ownerAddress', error);
      throw error;
    }

    const queryParams: Record<string, string | number> = {
      ownerAddress: params.ownerAddress,
    };

    if (params.chain) {
      queryParams.chain = params.chain;
    }

    if (params.limit) {
      queryParams.limit = params.limit;
    }

    if (params.offset !== undefined) {
      queryParams.offset = params.offset;
    }

    try {
      return this.sendGetRequest<NFTAssetsByAddressData>(
        '/api/v5/mktplace/nft/owner/asset-list',
        queryParams as Record<string, string>,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`获取地址NFT资产列表失败: ${errorMessage}`, error);
      throw error;
    }
  }
}
