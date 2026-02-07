import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from '../config/configuration';
import { OkxBaseService } from './base.service';

// 质押产品列表参数
export interface StakingProductsParams {
  chain?: string; // 区块链名称，如 'ETH', 'SOL'
  asset?: string; // 资产名称，如 'ETH', 'SOL'
  protocol?: string; // 协议名称，如 'Lido', 'Marinade'
  productType?: 'Staking' | 'Liquid Staking' | 'DeFi Staking';
  sortBy?: 'tvlDesc' | 'tvlAsc' | 'aprDesc' | 'aprAsc';
  limit?: number; // 默认20，最大100
  offset?: number; // 默认0
}

// 质押产品数据
export interface StakingProductsData {
  totalCount: number;
  products: Array<{
    productId: string;
    name: string;
    chain: string;
    asset: string;
    protocol: {
      name: string;
      logo: string;
      verified: boolean;
      website: string;
    };
    type: string;
    apr: string;
    tvl: string;
    description: string;
    risks: string[];
    restrictions: {
      lockupPeriod: string;
      minAmount: string;
      unstakingTime: string;
    };
  }>;
}

// 质押详情参数
export interface StakingProductDetailParams {
  productId: string; // 产品ID
}

// 质押详情数据
export interface StakingProductDetailData {
  product: {
    productId: string;
    name: string;
    chain: string;
    asset: string;
    protocol: {
      name: string;
      logo: string;
      verified: boolean;
      website: string;
      twitter: string;
      github: string;
    };
    type: string;
    apr: string;
    tvl: string;
    description: string;
    risks: string[];
    restrictions: {
      lockupPeriod: string;
      minAmount: string;
      unstakingTime: string;
    };
    rewards: {
      type: string;
      asset: string;
      frequency: string;
      estimation: string;
    }[];
    howToStake: string;
    faq: {
      question: string;
      answer: string;
    }[];
  };
}

// 质押报价参数
export interface StakingQuoteParams {
  productId: string; // 产品ID
  amount: string; // 数量
  address: string; // 用户钱包地址
}

// 质押报价数据
export interface StakingQuoteData {
  from: {
    asset: string;
    amount: string;
  };
  to: {
    asset: string;
    amount: string;
  };
  priceImpact: string;
  estimatedGas: {
    amount: string;
    asset: string;
  };
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gasLimit: string;
  };
  apr: string;
  expectedRewards: {
    daily: string;
    weekly: string;
    monthly: string;
    yearly: string;
  };
}

@Injectable()
export class OkxDefiService extends OkxBaseService {
  protected readonly logger = new Logger('OkxDefiService');

  constructor(protected readonly configService: ConfigService<Config>) {
    super(configService);
    this.logger.log('OKX DeFi Service initialized');
  }

  /**
   * 获取质押产品列表
   * @param params 查询参数
   */
  async getStakingProducts(
    params?: StakingProductsParams,
  ): Promise<StakingProductsData> {
    const queryParams: Record<string, string> = {};

    if (params) {
      if (params.chain) queryParams.chain = params.chain;
      if (params.asset) queryParams.asset = params.asset;
      if (params.protocol) queryParams.protocol = params.protocol;
      if (params.productType) queryParams.productType = params.productType;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.limit) queryParams.limit = String(params.limit);
      if (params.offset) queryParams.offset = String(params.offset);
    }

    return this.sendGetRequest<StakingProductsData>(
      '/api/v5/defi/staking/products',
      queryParams,
    );
  }

  /**
   * 获取质押产品详情
   * @param params 查询参数
   */
  async getStakingProductDetail(
    params: StakingProductDetailParams,
  ): Promise<StakingProductDetailData> {
    const queryParams: Record<string, string> = {
      productId: params.productId,
    };

    return this.sendGetRequest<StakingProductDetailData>(
      '/api/v5/defi/staking/product-details',
      queryParams,
    );
  }

  /**
   * 获取质押报价
   * @param params 报价参数
   */
  async getStakingQuote(params: StakingQuoteParams): Promise<StakingQuoteData> {
    const queryParams: Record<string, string> = {
      productId: params.productId,
      amount: params.amount,
      address: params.address,
    };

    return this.sendGetRequest<StakingQuoteData>(
      '/api/v5/defi/staking/quote',
      queryParams,
    );
  }
}
