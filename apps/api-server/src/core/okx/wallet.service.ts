import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from '../config/configuration';
import { OkxBaseService } from './base.service';

// 币种数据接口
export interface CurrencyData {
  code: string;
  data?: Array<{
    chain: string;
    ccy: string;
    name: string;
    [key: string]: any;
  }>;
  msg?: string;
}

// 钱包余额数据接口
export interface BalanceData {
  adjEq: string;
  details: Array<{
    ccy: string;
    eq: string;
    cashBal: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

// 历史价格查询参数接口
export interface HistoricalPriceParams {
  chainIndex: string; // 区块链唯一标识
  tokenAddress?: string; // 代币地址，为空表示查询原生代币
  limit?: string; // 每次查询的条目数，默认50，最大200
  cursor?: string; // 光标位置，默认为第一条
  begin?: string; // 开始时间戳，毫秒
  end?: string; // 结束时间戳，毫秒
  period?: '1m' | '5m' | '30m' | '1h' | '1d'; // 时间间隔
}

// 历史价格数据接口
export interface HistoricalPriceData {
  cursor: string;
  prices: Array<{
    time: string;
    price: string;
  }>;
}

// 实时币价参数接口
export interface RealTimePriceParams {
  chainIndex: string; // 区块链唯一标识
  tokenAddress: string; // 代币地址
}

// 实时币价响应接口
export interface RealTimePriceData {
  chainIndex: string;
  tokenAddress: string;
  time: string; // 时间戳，毫秒
  price: string; // 币价，USD
}

// 资产明细查询参数接口
export interface TokenBalancesParams {
  address: string; // 地址
  chains: string; // 筛选查询的链，多链以逗号分隔
  filter?: string; // 是否过滤风险空投币 0-过滤 1-不过滤
}

// 资产明细查询响应接口
export interface TokenBalancesData {
  tokenAssets: Array<{
    chainIndex: string; // 链唯一标识
    tokenAddress: string; // 合约地址
    address: string; // 地址
    symbol: string; // 代币简称
    balance: string; // 代币数量
    rawBalance: string; // 代币原始数量
    tokenPrice: string; // 代币单位价值(USD)
    tokenType: string; // 代币类型 1-token 2-铭文
    transferAmount: string; // 可直接转账交易的余额
    availableAmount: string; // 需要铭刻才能交易的余额
    isRiskToken: boolean; // 是否为风险空投币
  }>;
}

@Injectable()
export class OkxWalletService extends OkxBaseService {
  protected readonly logger = new Logger('OkxWalletService');
  constructor(protected readonly configService: ConfigService<Config>) {
    super(configService);
    this.logger.log('OKX Wallet Service initialized');
  }

  /**
   * 获取支持的币种列表
   */
  async getCurrencies(): Promise<CurrencyData> {
    return this.sendGetRequest<CurrencyData>('/api/v5/asset/currencies');
  }

  /**
   * 获取钱包余额
   */
  async getBalance(): Promise<BalanceData> {
    return this.sendGetRequest<BalanceData>('/api/v5/account/balance');
  }

  /**
   * 获取代币历史价格
   * @param params 历史价格查询参数
   */
  async getHistoricalPrice(
    params: HistoricalPriceParams,
  ): Promise<HistoricalPriceData[]> {
    const queryParams: Record<string, string> = {};

    // 添加所有非undefined的参数
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams[key] = String(value);
      }
    });

    return this.sendGetRequest<HistoricalPriceData[]>(
      '/api/v5/wallet/token/historical-price',
      queryParams,
    );
  }

  /**
   * 获取代币实时价格
   * @param tokens 代币参数数组，包含chainIndex和tokenAddress
   */
  async getRealTimePrice(
    tokens: RealTimePriceParams[],
  ): Promise<RealTimePriceData[]> {
    if (!tokens || tokens.length === 0) {
      throw new Error('代币参数不能为空');
    }

    if (tokens.length > 100) {
      throw new Error('每次最多查询100个代币的实时价格');
    }

    // 这里使用POST请求发送数组作为请求体
    return this.sendPostRequest<RealTimePriceData[]>(
      '/api/v5/wallet/token/real-time-price',
      tokens,
    );
  }

  /**
   * 获取单个代币实时价格
   * @param chainIndex 区块链唯一标识
   * @param tokenAddress 代币地址
   */
  async getSingleTokenPrice(
    chainIndex: string,
    tokenAddress: string,
  ): Promise<RealTimePriceData[]> {
    return this.getRealTimePrice([{ chainIndex, tokenAddress }]);
  }

  /**
   * 获取地址资产明细
   * @param params 资产明细查询参数
   */
  async getTokenBalancesByAddress(
    params: TokenBalancesParams,
  ): Promise<TokenBalancesData[]> {
    this.logger.log(
      `查询地址资产明细: ${params.address}, 链: ${params.chains}`,
    );

    const queryParams: Record<string, string> = {
      address: params.address,
      chains: params.chains,
    };

    if (params.filter !== undefined) {
      queryParams.filter = params.filter;
    }

    return this.sendGetRequest<TokenBalancesData[]>(
      '/api/v5/wallet/asset/all-token-balances-by-address',
      queryParams,
    );
  }
}
