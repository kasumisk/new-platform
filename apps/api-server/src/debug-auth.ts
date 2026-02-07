/**
 * OKX API 认证调试工具
 * 用于诊断401认证错误
 *
 * 使用方法:
 * 1. 配置好.env文件中的所有OKX相关配置
 * 2. 运行: npx ts-node src/debug-auth.ts
 * 3. 可选参数:
 *    - TIME: 测试服务器时间API
 *    - GET: 测试带查询参数的GET请求
 *    - POST: 测试带请求体的POST请求
 *
 * 例如: npx ts-node src/debug-auth.ts TIME
 */

import axios, { AxiosProxyConfig, AxiosError } from 'axios';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common';

// 加载环境变量
try {
  dotenv.config();
} catch (error) {
  console.error('无法加载.env文件:', error);
}

const logger = new Logger('AuthDebug');

/**
 * 生成签名
 * 严格按照OKX官方文档: timestamp + method + requestPath + body
 */
function generateSignature(
  timestamp: string,
  method: string,
  requestPath: string,
  secretKey: string,
  body?: string,
): string {
  // 构建签名原文
  const message = timestamp + method + requestPath + (body || '');
  console.log('\n签名原文:', message);

  // 使用HMAC SHA256加密，然后Base64编码
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(message)
    .digest('base64');

  console.log('生成签名:', signature);
  return signature;
}

async function testServerTime(): Promise<void> {
  try {
    // 简单测试，不需要认证的公共API
    const response = await axios.get('https://web3.okx.com/api/v5/public/time');
    console.log('OKX服务器时间:', response.data);

    // 计算时间差异
    const serverTime = new Date(response.data.data[0].ts);
    const localTime = new Date();
    const timeDiff = Math.abs(serverTime.getTime() - localTime.getTime());

    console.log('本地时间:', localTime.toISOString());
    console.log('服务器时间:', serverTime.toISOString());
    console.log('时间差异(毫秒):', timeDiff);

    if (timeDiff > 30000) {
      console.log('⚠️ 警告: 时间差异超过30秒，可能导致认证失败');
    } else {
      console.log('✅ 时间同步正常');
    }

    return;
  } catch (error) {
    console.error('测试服务器时间失败:', error);
    return;
  }
}

async function debugAuth(): Promise<void> {
  try {
    // 检查命令行参数
    const args = process.argv.slice(2);
    if (args.length > 0 && args[0] === 'TIME') {
      return await testServerTime();
    }

    // 读取OKX配置
    const apiBaseUrl = process.env.OKX_API_BASE_URL || 'https://web3.okx.com';
    const projectId = process.env.OKX_PROJECT;
    const apiKey = process.env.OKX_API_KEY;
    const secretKey = process.env.OKX_SECRET_KEY;
    const passphrase = process.env.OKX_PASSPHRASE;

    // 读取代理配置（如果有）
    const proxyHost = process.env.PROXY_HOST;
    const proxyPort = process.env.PROXY_PORT
      ? parseInt(process.env.PROXY_PORT, 10)
      : undefined;
    const proxyUsername = process.env.PROXY_USERNAME;
    const proxyPassword = process.env.PROXY_PASSWORD;

    // 验证所有必要参数
    if (!projectId || !apiKey || !secretKey || !passphrase) {
      logger.error('配置错误: 请确保以下环境变量都已设置：');
      logger.error('- OKX_PROJECT: ' + (projectId ? '已设置' : '未设置 ❌'));
      logger.error('- OKX_API_KEY: ' + (apiKey ? '已设置' : '未设置 ❌'));
      logger.error('- OKX_SECRET_KEY: ' + (secretKey ? '已设置' : '未设置 ❌'));
      logger.error(
        '- OKX_PASSPHRASE: ' + (passphrase ? '已设置' : '未设置 ❌'),
      );
      return;
    }

    // 确定测试类型
    let method = 'GET';
    let requestPath = '';
    let reqBody: any = undefined;

    if (args.length > 0 && args[0] === 'POST') {
      // POST请求测试
      method = 'POST';
      requestPath = '/api/v5/wallet/token/real-time-price';
      reqBody = [
        {
          chainIndex: '1',
          tokenAddress: '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72',
        },
      ];
      logger.log('执行POST请求测试...');
    } else {
      // GET请求测试 (默认)
      method = 'GET';
      // 简单GET请求 - 服务器时间
      requestPath = '/api/v5/public/time';

      if (args.length > 0 && args[0] === 'GET') {
        // 带参数的GET请求
        requestPath =
          '/api/v5/wallet/token/historical-price?chainIndex=1&limit=1';
        logger.log('执行带参数的GET请求测试...');
      } else {
        logger.log('执行简单GET请求测试...');
      }
    }

    // 生成时间戳(ISO格式)
    const timestamp = new Date().toISOString();

    // 准备请求体字符串
    const bodyString = reqBody ? JSON.stringify(reqBody) : '';

    // 生成签名
    const signature = generateSignature(
      timestamp,
      method,
      requestPath,
      secretKey,
      method === 'POST' ? bodyString : undefined,
    );

    // 准备请求头
    const headers = {
      'Content-Type': 'application/json',
      'OK-ACCESS-PROJECT': projectId,
      'OK-ACCESS-KEY': apiKey,
      'OK-ACCESS-SIGN': signature,
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': passphrase,
      'User-Agent': 'Card3-Provider/1.0',
    };

    // 输出调试信息
    logger.log('\n===== 请求信息 =====');
    logger.log(`请求URL: ${apiBaseUrl}${requestPath}`);
    logger.log(`请求方法: ${method}`);
    logger.log(`时间戳: ${timestamp}`);
    logger.log(`Project ID: ${projectId}`);
    logger.log(
      `API Key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`,
    );

    if (method === 'POST' && reqBody) {
      logger.log(`请求体: ${bodyString}`);
    }

    // 准备代理配置（如果有）
    let proxyConfig: AxiosProxyConfig | undefined;
    if (proxyHost && proxyPort) {
      logger.log(`使用代理: ${proxyHost}:${proxyPort}`);
      proxyConfig = {
        host: proxyHost,
        port: proxyPort,
        protocol: 'http',
      };

      if (proxyUsername && proxyPassword) {
        proxyConfig.auth = {
          username: proxyUsername,
          password: proxyPassword,
        };
      }
    }

    // 发送请求
    const requestConfig = {
      method,
      url: `${apiBaseUrl}${requestPath}`,
      headers,
      timeout: 10000,
      proxy: proxyConfig,
    };

    // 如果是POST请求，添加请求体
    if (method === 'POST' && reqBody) {
      requestConfig['data'] = reqBody;
    }

    const response = await axios(requestConfig);

    // 输出响应
    logger.log('');
    logger.log('===== 响应信息 =====');
    logger.log(`状态码: ${response.status}`);
    logger.log('响应数据:');
    console.log(JSON.stringify(response.data, null, 2));
    logger.log('');
    logger.log('认证测试通过 ✅ (API连接和认证正常)');
  } catch (error) {
    logger.error('===== 错误信息 =====');

    if ('response' in error && error.response) {
      // 服务器返回了错误响应
      logger.error(`状态码: ${error.response.status}`);
      logger.error('响应头:');
      console.log(JSON.stringify(error.response.headers, null, 2));
      logger.error('错误响应:');
      console.log(JSON.stringify(error.response.data, null, 2));

      // 特殊处理401错误
      if (error.response.status === 401) {
        logger.error('');
        logger.error('认证失败 (401 Unauthorized) ❌');
        logger.error('可能原因:');
        logger.error('1. API密钥不正确或已过期');
        logger.error('2. 签名生成错误 - 检查签名原文是否正确');
        logger.error('3. 时间戳不同步 - 服务器和OKX的时间差异超过30秒');
        logger.error('4. Project ID错误或未授权');
        logger.error('5. Passphrase不正确');
        logger.error('');
        logger.error('建议操作:');
        logger.error('1. 运行 npx ts-node src/debug-auth.ts TIME 检查时间同步');
        logger.error('2. 重新获取API密钥，确保权限正确');
        logger.error('3. 验证Project ID是否正确');
      }
    } else if ('request' in error) {
      // 请求已发出但没有收到响应
      logger.error('未收到响应 ❌');
      logger.error('可能原因:');
      logger.error('1. 网络连接问题');
      logger.error('2. API服务器不可用');
      logger.error('3. 需要配置代理但未配置或配置错误');
    } else {
      // 设置请求时发生错误
      logger.error(`请求设置错误: ${error.message || '未知错误'}`);
    }
  }
}

// 执行调试
debugAuth().catch((err) => {
  logger.error('测试异常:', err);
  process.exit(1);
});
