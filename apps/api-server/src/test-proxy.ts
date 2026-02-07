/**
 * 代理测试脚本
 *
 * 使用方法:
 * 1. 配置好 .env 文件中的代理设置
 * 2. 运行: npx ts-node src/test-proxy.ts
 */

import axios from 'axios';
import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common';

// 加载环境变量
dotenv.config();

const logger = new Logger('ProxyTest');

async function testProxy(): Promise<void> {
  try {
    // 读取代理配置
    const proxyHost = process.env.PROXY_HOST;
    const proxyPort = process.env.PROXY_PORT
      ? parseInt(process.env.PROXY_PORT, 10)
      : undefined;
    const proxyUsername = process.env.PROXY_USERNAME;
    const proxyPassword = process.env.PROXY_PASSWORD;

    if (!proxyHost || !proxyPort) {
      logger.error('未配置代理，请在.env文件中设置PROXY_HOST和PROXY_PORT');
      return;
    }

    logger.log(`使用代理 ${proxyHost}:${proxyPort} 发送测试请求到 OKX API...`);

    // 准备代理配置
    const proxyConfig: any = {
      host: proxyHost,
      port: proxyPort,
      protocol: 'http',
    };

    // 如果有认证信息
    if (proxyUsername && proxyPassword) {
      proxyConfig.auth = {
        username: proxyUsername,
        password: proxyPassword,
      };
    }

    // 发送测试请求
    const response = await axios({
      method: 'GET',
      url: 'https://web3.okx.com/api/v5/public/time',
      timeout: 10000,
      proxy: proxyConfig,
      headers: {
        'User-Agent': 'Card3-Provider/1.0',
      },
    });

    logger.log('请求成功! 响应数据:');
    console.log(JSON.stringify(response.data, null, 2));
    logger.log('代理配置测试通过 ✅');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`测试失败: ${errorMessage}`);

    if (error.response) {
      logger.error('响应详情:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }

    logger.error('代理配置测试失败 ❌');
  }
}

// 执行测试
testProxy().catch((err) => {
  logger.error('测试异常:', err);
  process.exit(1);
});
