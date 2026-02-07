# OKX API集成说明

本项目集成了OKX的Web3 API服务，提供以下功能：

## 功能特点

- OKX API调用：通过OKX服务模块封装API调用
- Web3功能：使用Web3.js与区块链交互
- 钱包功能：查询余额、构造交易等
- 代币价格查询：获取实时和历史价格数据

## 配置

在`.env`文件中添加以下OKX相关配置：

```
# OKX 配置
OKX_API_BASE_URL=https://web3.okx.com
OKX_API_KEY=你的API密钥
OKX_SECRET_KEY=你的密钥
OKX_PASSPHRASE=你的API密码
OKX_WEB3_RPC_URL=https://eth.llamarpc.com
```

## 如何获取OKX API密钥

1. 注册并登录OKX账户
2. 访问开发者控制台： https://www.okx.com/account/my-api
3. 创建一个新的API密钥，记录下API Key、Secret Key和Passphrase
4. 将这些值设置到环境变量中

## API端点

本项目提供以下API端点与OKX服务交互：

- `GET /api/okx/currencies` - 获取支持的币种列表
- `GET /api/okx/balance` - 获取钱包余额
- `GET /api/okx/historical-price` - 获取代币历史价格（新增）
- `POST /api/okx/request` - 发送自定义请求到OKX API
- `GET /api/okx/web3/balance/:address` - 获取区块链账户余额
- `POST /api/okx/web3/transfer` - 构造区块链交易

## 历史价格API

### 描述
获取特定代币的历史价格数据。支持原生代币、ERC20代币以及BTC链上的铭文代币（如BRC-20、Runes、ARC-20和SRC-20）。

### 请求参数

| 参数          | 类型     | 必填  | 描述                                         |
|--------------|---------|------|--------------------------------------------|
| chainIndex   | String  | 是    | 区块链唯一标识符                               |
| tokenAddress | String  | 否    | 代币地址                                     |
| limit        | String  | 否    | 每次查询的条目数，默认50，最大200                |
| cursor       | String  | 否    | 游标位置，默认为第一条                          |
| begin        | String  | 否    | 开始时间戳 (毫秒)                             |
| end          | String  | 否    | 结束时间戳 (毫秒)                             |
| period       | String  | 否    | 时间间隔: 1m, 5m, 30m, 1h, 1d (默认)         |

### 示例调用

```bash
curl -X GET "http://localhost:3000/api/okx/historical-price?chainIndex=1&period=5m&limit=5" \
  -H "Content-Type: application/json"
```

### 响应示例

```json
{
  "code": "0",
  "msg": "success",
  "data": [
    {
      "cursor": "31",
      "prices": [
        {
          "time": "1700040600000",
          "price": "1994.430000000000000000"
        },
        {
          "time": "1700040300000",
          "price": "1994.190000000000000000"
        }
      ]
    }
  ]
}
```

## 示例调用

### 获取账户余额

```bash
curl -X GET http://localhost:3000/api/okx/web3/balance/0x1234567890123456789012345678901234567890
```

### 构造交易

```bash
curl -X POST http://localhost:3000/api/okx/web3/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromAddress": "0x1234567890123456789012345678901234567890",
    "toAddress": "0x0987654321098765432109876543210987654321",
    "amount": "0.1"
  }'
```

### 发送自定义OKX API请求

```bash
curl -X POST "http://localhost:3000/api/okx/request?api=/api/v5/asset/currencies&method=GET" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## 项目结构

OKX集成相关的代码主要分布在以下目录：

```
src/
├── core/                  # 核心模块
│   └── okx/               # OKX核心服务
│       ├── okx.service.ts # OKX API服务
│       ├── web3.service.ts # Web3服务
│       └── okx.module.ts  # OKX核心模块
├── okx/                   # OKX功能模块
│   ├── dto/               # 数据传输对象
│   │   └── transaction.dto.ts # 交易DTO
│   ├── okx.controller.ts  # OKX控制器
│   └── okx.module.ts      # OKX模块
```

## 注意事项

- 本集成仅提供基本功能，实际应用中可能需要添加更多错误处理和安全措施
- 真实交易需要私钥签名，当前实现仅演示交易构造
- 建议在生产环境中使用加密存储API密钥，不要直接硬编码
- 历史价格API需要正确的chainIndex参数，请参考文档中的值
- 如果遇到"fetch failed"错误，请检查API密钥和网络连接 