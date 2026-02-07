import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from '../config/configuration';
import { OkxBaseService } from './base.service';
import { OkxWalletService } from './wallet.service';
import { OkxDexService } from './dex.service';
import { OkxMarketService } from './market.service';
import { OkxDefiService } from './defi.service';

// 重新导出所有接口，保持向后兼容
export * from './interfaces';

/**
 * OKX服务适配器
 * 为保持向后兼容性，该服务将委托调用到各个专门的服务
 */
@Injectable()
export class OkxService {
  private readonly logger = new Logger(OkxService.name);

  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly walletService: OkxWalletService,
    private readonly dexService: OkxDexService,
    private readonly marketService: OkxMarketService,
    private readonly defiService: OkxDefiService,
    private readonly baseService: OkxBaseService,
  ) {
    this.logger.log('OKX服务适配器已初始化');
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    return this.baseService.healthCheck();
  }

  // ===== 钱包API =====

  /**
   * 获取支持的币种列表
   */
  async getCurrencies() {
    return this.walletService.getCurrencies();
  }

  /**
   * 获取钱包余额
   */
  async getBalance() {
    return this.walletService.getBalance();
  }

  /**
   * 获取代币历史价格
   */
  async getHistoricalPrice(params) {
    return this.walletService.getHistoricalPrice(params);
  }

  /**
   * 获取代币实时价格
   */
  async getRealTimePrice(tokens) {
    return this.walletService.getRealTimePrice(tokens);
  }

  /**
   * 获取单个代币实时价格
   */
  async getSingleTokenPrice(chainIndex, tokenAddress) {
    return this.walletService.getSingleTokenPrice(chainIndex, tokenAddress);
  }

  /**
   * 获取地址资产明细
   */
  async getTokenBalancesByAddress(params) {
    return this.walletService.getTokenBalancesByAddress(params);
  }

  // ===== DEX API =====

  /**
   * 获取DEX支持的所有代币列表
   */
  async getAllTokens(chainId) {
    return this.dexService.getAllTokens(chainId);
  }

  /**
   * 获取代币兑换报价
   */
  async getSwapQuote(params) {
    return this.dexService.getSwapQuote(params);
  }

  /**
   * 获取跨链桥列表
   */
  async getCrossChainBridges(params) {
    return this.dexService.getCrossChainBridges(params);
  }

  /**
   * 获取跨链报价
   */
  async getCrossChainQuote(params) {
    return this.dexService.getCrossChainQuote(params);
  }

  // ===== 市场API =====

  /**
   * 获取NFT收藏品列表
   */
  async getNFTCollections(params) {
    return this.marketService.getNFTCollections(params);
  }

  /**
   * 获取NFT资产列表
   */
  async getNFTAssets(params) {
    return this.marketService.getNFTAssets(params);
  }

  /**
   * 获取BTC Ordinals收藏品列表
   */
  async getOrdinalsCollections(params) {
    return this.marketService.getOrdinalsCollections(params);
  }

  /**
   * 获取BTC Ordinals铭文列表
   */
  async getOrdinalsInscriptions(params) {
    return this.marketService.getOrdinalsInscriptions(params);
  }

  /**
   * 获取地址NFT资产列表
   */
  async getNFTAssetsByAddress(params) {
    return this.marketService.getNFTAssetsByAddress(params);
  }

  // ===== DeFi API =====

  /**
   * 获取质押产品列表
   */
  async getStakingProducts(params) {
    return this.defiService.getStakingProducts(params);
  }

  /**
   * 获取质押产品详情
   */
  async getStakingProductDetail(params) {
    return this.defiService.getStakingProductDetail(params);
  }

  /**
   * 获取质押报价
   */
  async getStakingQuote(params) {
    return this.defiService.getStakingQuote(params);
  }

  // 基础API请求方法，保持向后兼容

  /**
   * 发送GET请求
   */
  async sendGetRequest<T>(api, queryParams, options) {
    return this.baseService.sendGetRequest<T>(api, queryParams, options);
  }

  /**
   * 发送POST请求
   */
  async sendPostRequest<T>(api, body, options) {
    return this.baseService.sendPostRequest<T>(api, body, options);
  }
}
