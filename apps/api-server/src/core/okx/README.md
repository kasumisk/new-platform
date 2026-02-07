# OKX API服务

OKX API服务已按功能领域进行细分，使代码更加模块化和可维护。本文档说明如何使用各个专门的服务。

## 服务概述

OKX API服务现已分为以下几个主要类别：

1. **钱包API (OkxWalletService)**
   - 币种信息查询
   - 钱包余额查询
   - 代币历史价格
   - 代币实时价格
   - **新增**: 地址资产明细查询

2. **DEX API (OkxDexService)**
   - 代币列表查询
   - 代币兑换报价
   - 跨链桥信息
   - 跨链兑换报价

3. **市场API (OkxMarketService)**
   - NFT收藏品数据
   - NFT资产列表
   - BTC Ordinals收藏品
   - BTC Ordinals铭文列表
   - **新增**: 地址NFT资产列表查询

4. **DeFi API (OkxDefiService)**
   - 质押产品列表
   - 质押产品详情
   - 质押报价计算

5. **基础服务 (OkxBaseService)**
   - API认证和请求处理
   - 错误处理和重试逻辑
   - **增强**: 支持Web3 API端点

同时，我们保留了原有的`OkxService`类作为适配器，确保向后兼容性。

## 重要更新

为了更好地支持OKX Web3 API，我们进行了以下增强：

1. **Web3 API支持**: 
   - 增加了对`wallet/asset/all-token-balances-by-address`的支持
   - 增加了对`marketplace/retrieve-asset-list`的支持
   
2. **配置增强**:
   - 新增`OKX_WEB3_API_URL`配置选项，用于Web3 API调用
   - 在`base.service.ts`中添加了Web3 API URL支持

3. **代码重构**:
   - 控制器层已分解为多个专门控制器
   - 旧的`okx.controller.ts`已简化为兼容层
   - 删除了冗余的示例代码

## 使用方法

### 1. 导入需要的服务

```typescript
import { OkxWalletService } from './core/okx/wallet.service';
import { OkxDexService } from './core/okx/dex.service';
import { OkxMarketService } from './core/okx/market.service';
import { OkxDefiService } from './core/okx/defi.service';
```

### 2. 在模块中注册服务

```typescript
@Module({
  imports: [CoreModule], // CoreModule已导出所有OKX服务
  providers: [YourService],
})
export class YourModule {}
```

### 3. 注入所需的服务

```typescript
@Injectable()
export class YourService {
  constructor(
    private readonly walletService: OkxWalletService,
    private readonly dexService: OkxDexService,
    // 根据需要注入其他服务
  ) {}

  async yourMethod() {
    // 使用钱包API获取实时价格
    const prices = await this.walletService.getRealTimePrice([
      {
        chainIndex: '1', // Ethereum
        tokenAddress: '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72', // ENS
      },
    ]);

    // 使用钱包API获取地址资产明细
    const assets = await this.walletService.getTokenBalancesByAddress({
      address: '0xEd0C6079229E2d407672a117c22b62064f4a4312',
      chains: '1,56,137',
    });

    // 使用市场API获取地址NFT资产
    const nfts = await this.marketService.getNFTAssetsByAddress({
      ownerAddress: '0xEd0C6079229E2d407672a117c22b62064f4a4312',
      chain: 'eth',
    });

    return { prices, assets, nfts };
  }
}
```

### 4. 或者继续使用原有的OkxService（向后兼容）

```typescript
@Injectable()
export class YourService {
  constructor(private readonly okxService: OkxService) {}

  async yourMethod() {
    // 所有方法保持不变
    const prices = await this.okxService.getRealTimePrice([
      {
        chainIndex: '1',
        tokenAddress: '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72',
      },
    ]);

    return prices;
  }
}
```

## 接口和类型

所有接口和类型都可以通过`interfaces`索引文件导入：

```typescript
import { 
  HistoricalPriceParams, 
  SwapQuoteParams,
  NFTCollectionsParams,
  StakingProductsParams,
  TokenBalancesParams,  // 新增
  NFTAssetsByAddressParams  // 新增
} from './core/okx/interfaces';
```

## 错误处理

所有服务都使用统一的错误处理机制。当API调用失败时，会抛出包含详细错误信息的异常。

```typescript
try {
  const result = await this.walletService.getHistoricalPrice(params);
  // 处理结果
} catch (error) {
  console.error('API调用失败:', error.message);
  // 错误处理逻辑
}
```

## 配置

所有服务共享相同的配置来源，通过`ConfigService`获取。确保在`.env`文件中设置以下变量：

```
OKX_API_BASE_URL=https://web3.okx.com
OKX_PROJECT=your_project_id
OKX_API_KEY=your_api_key
OKX_SECRET_KEY=your_secret_key
OKX_PASSPHRASE=your_passphrase
OKX_WEB3_API_URL=https://web3.okx.com/api/v5  # 新增
```

## 获取地址NFT资产列表

### 请求路径
```
GET /api/okx/market/nft/assets-by-address
```

### 请求参数
| 参数名 | 类型 | 是否必须 | 描述 |
| --- | --- | --- | --- |
| ownerAddress | string | 是 | 钱包地址 |
| chain | string | 否 | 区块链名称，如 eth, bsc 等 |
| limit | number | 否 | 每页数量，默认20，最大100 |
| offset | number | 否 | 偏移量，默认0 |

### 请求示例
```
GET /api/okx/market/nft/assets-by-address?ownerAddress=0xEd0C6079229E2d407672a117c22b62064f4a4312&chain=eth&limit=20&offset=0
```

### 注意事项
- 参数名必须使用`ownerAddress`而不是`address`
- 为了向后兼容，系统也支持使用`address`参数，但建议使用`ownerAddress`参数

### 响应示例
```json
{
  "total": 5,
  "assets": [
    {
      "chain": "eth",
      "contractAddress": "0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85",
      "tokenId": "12345678",
      "name": "sample.eth",
      "collectionName": "ENS",
      "imageUrl": "https://example.com/image.png",
      "latestPrice": "0.5",
      "latestPriceCurrency": "ETH",
      "estimatedValue": "800",
      "collectionId": "ens",
      "owner": "0xEd0C6079229E2d407672a117c22b62064f4a4312",
      "exploreUrl": "https://etherscan.io/token/0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85?a=12345678"
    }
    // ...更多资产
  ]
}
``` 