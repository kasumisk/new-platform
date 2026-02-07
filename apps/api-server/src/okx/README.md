# OKX API 控制器

OKX API控制器已按功能领域进行细分，使代码更加模块化和可维护。本文档说明了如何使用各个专门的控制器。

## 控制器概述

OKX API控制器现已分为以下几个主要类别：

1. **钱包API (OkxWalletController)**
   - 路径前缀: `/okx/wallet`
   - 功能: 币种信息、钱包余额、代币价格等

2. **DEX API (OkxDexController)**
   - 路径前缀: `/okx/dex`
   - 功能: 代币列表、兑换报价、跨链桥等

3. **市场API (OkxMarketController)**
   - 路径前缀: `/okx/market`
   - 功能: NFT和BTC Ordinals相关操作

4. **DeFi API (OkxDefiController)**
   - 路径前缀: `/okx/defi`
   - 功能: 质押产品、质押报价等

5. **Web3 API (OkxWeb3Controller)**
   - 路径前缀: `/okx/web3`
   - 功能: 链上余额查询、交易构造等

> **重要说明**：为了向后兼容，原有的`OkxController`仍然可用，它会将请求转发到相应的专门控制器。不过我们建议在新开发中直接使用专门控制器，以获得更好的可维护性。

## API端点清单

### 钱包API (`/okx/wallet`)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/currencies` | 获取支持的币种列表 |
| GET | `/balance` | 获取钱包余额 |
| GET | `/historical-price` | 获取代币历史价格 |
| POST | `/real-time-price` | 获取代币实时价格 |
| GET | `/token-price/:chainIndex/:tokenAddress` | 获取单个代币实时价格 |
| GET | `/token-balances` | 获取地址资产明细 |

### DEX API (`/okx/dex`)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/tokens/:chainId` | 获取DEX支持的所有代币列表 |
| GET | `/quote` | 获取代币兑换报价 |
| GET | `/bridges` | 获取跨链桥列表 |
| GET | `/cross-chain-quote` | 获取跨链报价 |

### 市场API (`/okx/market`)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/nft/collections` | 获取NFT收藏品列表 |
| GET | `/nft/assets` | 获取NFT资产列表 |
| GET | `/ordinals/collections` | 获取BTC Ordinals收藏品列表 |
| GET | `/ordinals/inscriptions` | 获取BTC Ordinals铭文列表 |
| GET | `/nft/assets-by-address` | 获取地址NFT资产列表 |

### DeFi API (`/okx/defi`)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/staking/products` | 获取质押产品列表 |
| GET | `/staking/product-details` | 获取质押产品详情 |
| GET | `/staking/quote` | 获取质押报价 |

### Web3 API (`/okx/web3`)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/balance/:address` | 获取账户余额 |
| POST | `/transfer` | 发送交易 |

## 错误处理

所有控制器都使用统一的错误处理机制，将返回以下格式的错误：

```json
{
  "statusCode": 500,
  "message": "错误描述"
}
```

## 代码清理说明

为了提高代码质量和可维护性，我们进行了以下清理工作：

1. **分离关注点**：将原`OkxController`中的功能分散到专门的控制器中
2. **保留兼容层**：原有的`OkxController`已重构为转发层，确保现有API调用继续工作
3. **移除冗余示例**：不再需要的示例代码文件已被移除

## 路径对照表

以下是旧路径和新路径的对照表，两者目前都可用：

| 旧路径 | 新路径 | 说明 |
|--------|--------|------|
| `/okx/currencies` | `/okx/wallet/currencies` | 获取币种列表 |
| `/okx/balance` | `/okx/wallet/balance` | 获取钱包余额 |
| `/okx/historical-price` | `/okx/wallet/historical-price` | 获取历史价格 |
| `/okx/real-time-price` | `/okx/wallet/real-time-price` | 获取实时价格 |
| `/okx/token-balances` | `/okx/wallet/token-balances` | 获取地址资产明细 |
| `/okx/nft/assets-by-address` | `/okx/market/nft/assets-by-address` | 获取地址NFT资产 |

## 最佳实践

1. 对于新开发，直接使用专门控制器的API端点
2. 如果您在自己的代码中注入了OkxService，可以考虑直接注入对应的专门服务（OkxWalletService, OkxMarketService等）
3. 记录和监控旧路径的使用情况，以便将来可能的完全迁移 