import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from '../config/configuration';
import { OkxBaseService } from './base.service';

// 代币列表接口
export interface TokensData {
  tokens: Array<{
    chainId: string;
    contractAddress: string;
    decimals: string;
    logoURI: string;
    name: string;
    symbol: string;
  }>;
}

// 代币兑换报价请求参数
export interface SwapQuoteParams {
  chainId: number | string; // 区块链ID
  amount: string; // 兑换数量（以fromToken的最小单位计）
  fromTokenAddress: string; // 源代币地址
  toTokenAddress: string; // 目标代币地址
  gasPrice?: string; // 可选，自定义Gas价格
  slippage?: string; // 可选，滑点（默认1%）
  excludeProtocols?: string; // 可选，排除的协议
  protocols?: string; // 可选，包含的协议
}

// 代币兑换报价响应数据
export interface SwapQuoteData {
  chainId: string;
  from: string;
  to: string;
  fromToken: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoURI: string;
  };
  toToken: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoURI: string;
  };
  protocols: Array<{
    name: string;
    part: number;
    fromTokenAddress: string;
    toTokenAddress: string;
  }>[];
  fromAmount: string;
  toAmount: string;
  toAmountMin: string;
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gasPrice: string;
    gas: string;
  };
  estimatedGas: string;
}

// 跨链桥列表参数
export interface CrossChainBridgesParams {
  fromChainId: string | number;
  toChainId: string | number;
  tokenSymbol?: string;
}

// 跨链桥列表响应
export interface CrossChainBridgesData {
  bridgesList: Array<{
    bridgeName: string;
    bridgeId: string;
    bridgeLogo: string;
    bridgeStatus: string;
  }>;
}

// 跨链报价请求参数
export interface CrossChainQuoteParams {
  fromChainId: string | number;
  toChainId: string | number;
  fromTokenAddress: string;
  toTokenAddress: string;
  fromAmount: string;
  bridgeId?: string;
  slippage?: string;
}

// 跨链报价响应数据
export interface CrossChainQuoteData {
  fromChainId: string;
  toChainId: string;
  fromTokenAddress: string;
  toTokenAddress: string;
  fromTokenAmount: string;
  toTokenAmount: string;
  estimatedTimeMinutes: number;
  bridgeId: string;
  bridgeName: string;
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gasPrice: string;
    gas: number;
  };
}

@Injectable()
export class OkxDexService extends OkxBaseService {
  protected readonly logger = new Logger('OkxDexService');
  constructor(protected readonly configService: ConfigService<Config>) {
    super(configService);
    this.logger.log('OKX DEX Service initialized');
  }

  /**
   * 获取DEX支持的所有代币列表
   * @param chainId 区块链ID
   */
  async getAllTokens(chainId: string | number): Promise<TokensData> {
    return this.sendGetRequest<TokensData>(
      '/api/v5/dex/aggregator/all-tokens',
      {
        chainId: String(chainId),
      },
    );
  }

  /**
   * 获取代币兑换报价
   * @param params 兑换报价参数
   */
  async getSwapQuote(params: SwapQuoteParams): Promise<SwapQuoteData> {
    const queryParams: Record<string, string> = {
      chainId: String(params.chainId),
      amount: String(params.amount),
      fromTokenAddress: params.fromTokenAddress,
      toTokenAddress: params.toTokenAddress,
    };

    if (params.gasPrice) queryParams.gasPrice = params.gasPrice;
    if (params.slippage) queryParams.slippage = params.slippage;
    if (params.excludeProtocols)
      queryParams.excludeProtocols = params.excludeProtocols;
    if (params.protocols) queryParams.protocols = params.protocols;

    return this.sendGetRequest<SwapQuoteData>(
      '/api/v5/dex/aggregator/quote',
      queryParams,
    );
  }

  /**
   * 获取跨链桥列表
   * @param params 跨链桥参数
   */
  async getCrossChainBridges(
    params: CrossChainBridgesParams,
  ): Promise<CrossChainBridgesData> {
    const queryParams: Record<string, string> = {
      fromChainId: String(params.fromChainId),
      toChainId: String(params.toChainId),
    };

    if (params.tokenSymbol) queryParams.tokenSymbol = params.tokenSymbol;

    return this.sendGetRequest<CrossChainBridgesData>(
      '/api/v5/dex/aggregator/bridges',
      queryParams,
    );
  }

  /**
   * 获取跨链报价
   * @param params 跨链报价参数
   */
  async getCrossChainQuote(
    params: CrossChainQuoteParams,
  ): Promise<CrossChainQuoteData> {
    const queryParams: Record<string, string> = {
      fromChainId: String(params.fromChainId),
      toChainId: String(params.toChainId),
      fromTokenAddress: params.fromTokenAddress,
      toTokenAddress: params.toTokenAddress,
      fromAmount: params.fromAmount,
    };

    if (params.bridgeId) queryParams.bridgeId = params.bridgeId;
    if (params.slippage) queryParams.slippage = params.slippage;

    return this.sendGetRequest<CrossChainQuoteData>(
      '/api/v5/dex/aggregator/cross-chain-quote',
      queryParams,
    );
  }
}
