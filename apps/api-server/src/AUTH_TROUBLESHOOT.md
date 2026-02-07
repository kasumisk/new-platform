# OKX API 401认证错误排查指南

## 问题说明

如果您在使用OKX Web3 API时遇到401 Unauthorized错误，可能是由于以下原因导致：

1. **API凭据不正确或不完整**
2. **签名生成错误**
3. **时间戳不同步**
4. **项目ID不正确或未授权**
5. **请求头格式问题**

## 排查步骤

### 1. 检查API凭据配置

确保在`.env`文件中设置了以下所有必需的环境变量：

```
OKX_PROJECT=你的项目ID
OKX_API_KEY=你的API密钥
OKX_SECRET_KEY=你的密钥
OKX_PASSPHRASE=你的API密码
```

### 2. 检查时间同步（非常关键）

OKX API服务器要求客户端时间与服务器时间差不超过30秒。运行以下命令检查时间差：

```bash
npx ts-node src/debug-auth.ts TIME
```

如果返回显示时间不同步错误，您需要同步您的服务器时间。在不同操作系统上同步时间的方法：

**Linux**:
```bash
sudo ntpdate pool.ntp.org
```

**macOS**:
```bash
sudo sntp -sS pool.ntp.org
```

**Windows**:
```
设置 -> 时间和语言 -> 日期和时间 -> 立即同步
```

### 3. 确认项目ID和API权限

1. 登录OKX Web3开发者平台：https://www.okx.com/web3/build/dashboard
2. 确认项目ID是否正确
3. 检查API密钥是否有足够权限访问目标API

特别注意：有些API需要特定权限，确保您创建API密钥时勾选了所需的权限类型。

### 4. 仔细检查签名生成逻辑

根据[OKX官方文档](https://web3.okx.com/zh-hans/build/docs/waas/rest-authentication)，签名生成必须严格遵循以下规则：

```
签名 = Base64(HMAC_SHA256(timestamp + method + requestPath + body, SecretKey))
```

注意以下关键点：

1. **timestamp格式**:
   - 必须是ISO 8601格式，例如：`2020-12-08T09:08:57.715Z`
   - 某些API可能需要特定的时间戳精度

2. **method**:
   - 请求方法必须大写，例如：`GET` 或 `POST`

3. **requestPath**:
   - 对于带查询参数的GET请求，请求路径必须包含查询参数
   - 例如：`/api/v5/account/balance?ccy=BTC`

4. **body**:
   - GET请求通常不包含body，可以省略
   - POST请求必须包含JSON格式的body字符串
   - 例如：`{"instId":"BTC-USDT","lever":"5","mgnMode":"isolated"}`

### 5. 使用增强版调试工具

此项目提供了功能强大的调试工具，可测试多种类型的API请求：

```bash
# 测试时间同步
npx ts-node src/debug-auth.ts TIME

# 测试简单GET请求（默认）
npx ts-node src/debug-auth.ts

# 测试带查询参数的GET请求
npx ts-node src/debug-auth.ts GET

# 测试带请求体的POST请求
npx ts-node src/debug-auth.ts POST
```

工具会输出以下关键信息：
- 签名原文（用于检查签名生成是否正确）
- 请求头信息（验证所有必要头信息是否存在）
- 服务器响应（分析错误原因）

### 6. 比较官方示例代码

参考OKX官方提供的JavaScript示例代码：

```javascript
function preHash(timestamp, method, request_path, params) {
  // 根据字符串和参数创建预签名
  let query_string = '';
  if (method === 'GET' && params) {
    query_string = '?' + querystring.stringify(params);
  }
  if (method === 'POST' && params) {
    query_string = JSON.stringify(params);
  }
  return timestamp + method + request_path + query_string;
}

function sign(message, secret_key) {
  // 使用 HMAC-SHA256 对预签名字符串进行签名
  const hmac = crypto.createHmac('sha256', secret_key);
  hmac.update(message);
  return hmac.digest('base64');
}
```

### 7. 检查请求头

确保每个API请求都包含以下请求头：

```
OK-ACCESS-PROJECT: 你的项目ID         ← 很多WaaS API需要这个
OK-ACCESS-KEY: 你的API密钥
OK-ACCESS-SIGN: 使用上述方法生成的签名
OK-ACCESS-TIMESTAMP: ISO格式的时间戳
OK-ACCESS-PASSPHRASE: 你的API密码
Content-Type: application/json
```

您可以使用浏览器开发者工具或抓包工具检查请求是否包含所有必要的头信息。

### 8. 常见错误模式和解决方案

| 问题 | 症状 | 解决方案 |
|------|------|---------|
| 时间戳错误 | 401错误，响应中提及时间同步问题 | 同步服务器时间 |
| 签名错误 | 401错误，但时间同步正常 | 检查签名生成逻辑，特别是查询参数处理 |
| API密钥权限 | 401错误，响应中提及权限问题 | 检查API密钥权限设置 |
| 项目ID错误 | 401错误，响应中提及项目不存在 | 确认项目ID正确 |
| 网络问题 | 连接超时或无响应 | 检查网络连接和代理设置 |

## 代码示例：正确生成签名

以下是经过验证可用的完整签名生成示例：

```typescript
// 正确生成签名的函数
function generateSignature(
  timestamp: string,   // ISO格式时间戳: 2020-12-08T09:08:57.715Z
  method: string,      // 大写的HTTP方法: GET 或 POST
  requestPath: string, // 包含查询参数的请求路径: /api/v5/account/balance?ccy=BTC
  secretKey: string,   // 密钥
  body?: string        // POST请求的JSON字符串
): string {
  // 按照OKX官方文档: timestamp + method + requestPath + body
  const message = timestamp + method + requestPath + (body || '');
  console.log('签名原文:', message);
  
  // HMAC SHA256加密，然后Base64编码
  return crypto
    .createHmac('sha256', secretKey)
    .update(message)
    .digest('base64');
}

// GET请求示例
const timestamp = new Date().toISOString();
const method = 'GET';
const requestPath = '/api/v5/public/time';
const signature = generateSignature(timestamp, method, requestPath, secretKey);

// POST请求示例
const body = JSON.stringify({instId: 'BTC-USDT'});
const postSignature = generateSignature(timestamp, method, requestPath, secretKey, body);
```

## 相关资源

- [OKX Web3 REST API鉴权文档](https://web3.okx.com/zh-hans/build/docs/waas/rest-authentication)
- [OKX Web3开发者平台](https://www.okx.com/web3/build/dashboard)
- [OKX API状态页面](https://www.okx.com/status) 