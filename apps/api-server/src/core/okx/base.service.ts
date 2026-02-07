import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from '../config/configuration';
import * as crypto from 'crypto';
import * as https from 'https';
import axios, { AxiosRequestConfig } from 'axios';
import * as querystring from 'querystring';

export interface OkxApiResponse<T> {
  code: string;
  msg: string;
  data: T;
}

export interface RequestOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  useWeb3ApiEndpoint?: boolean; // 是否使用Web3 API端点
}

// 代理配置接口
export interface ProxyConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
}

// API时间响应接口
export interface ApiTimeResponse {
  code: string;
  msg: string;
  data: Array<{ ts: string }>;
}

const DEFAULT_REQUEST_OPTIONS: RequestOptions = {
  timeout: 10000, // 10秒超时
  retries: 3, // 最多重试3次
  retryDelay: 1000, // 重试间隔1秒
};

@Injectable()
export class OkxBaseService {
  protected readonly logger = new Logger(OkxBaseService.name);
  protected readonly apiBaseUrl: string;
  protected readonly apiKey: string;
  protected readonly project: string;
  protected readonly secretKey: string;
  protected readonly passphrase: string;
  protected readonly agent: https.Agent;
  protected readonly proxyConfig: ProxyConfig | null = null;
  protected readonly web3ApiUrl: string; // Web3 API端点

  constructor(protected readonly configService: ConfigService<Config>) {
    this.apiBaseUrl =
      this.configService.get('okx.apiBaseUrl', { infer: true }) ||
      'https://web3.okx.com';

    this.web3ApiUrl =
      this.configService.get('okx.web3ApiUrl', { infer: true }) ||
      'https://web3.okx.com/api/v5';

    const project = this.configService.get('okx.project', { infer: true });
    if (!project) {
      this.logger.warn(
        'OKX_PROJECT is not set, API calls requiring project ID may fail',
      );
    }
    this.project = project || '';

    const apiKey = this.configService.get('okx.apiKey', { infer: true });
    if (!apiKey) {
      this.logger.warn(
        'OKX_API_KEY is not set, authenticated API calls may fail',
      );
    }
    this.apiKey = apiKey || '';

    const secretKey = this.configService.get('okx.secretKey', { infer: true });
    if (!secretKey) {
      this.logger.warn(
        'OKX_SECRET_KEY is not set, API authentication will fail',
      );
    }
    this.secretKey = secretKey || '';

    const passphrase = this.configService.get('okx.passphrase', {
      infer: true,
    });
    if (!passphrase) {
      this.logger.warn(
        'OKX_PASSPHRASE is not set, API authentication will fail',
      );
    }
    this.passphrase = passphrase || '';

    // 读取代理配置
    const proxyConfig = this.configService.get('proxy', { infer: true });

    // 检查是否配置了代理
    if (proxyConfig?.host && proxyConfig?.port) {
      this.proxyConfig = {
        host: proxyConfig.host,
        port: proxyConfig.port,
        username: proxyConfig.username,
        password: proxyConfig.password,
      };

      this.logger.log(`代理已配置: ${proxyConfig.host}:${proxyConfig.port}`);
    } else {
      this.logger.log('未配置代理，将直接连接');
    }

    // 创建HTTPS Agent
    this.agent = new https.Agent({
      keepAlive: true,
      maxSockets: 100,
      timeout: 60000,
    });

    this.logger.log(
      `OKX Base Service initialized with URL: ${this.apiBaseUrl}`,
    );
  }

  /**
   * 预处理哈希字符串
   */
  protected preHash(
    timestamp: string,
    method: string,
    request_path: string,
    params?: Record<string, any>,
  ): string {
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

  /**
   * 生成签名
   */
  protected sign(message: string): string {
    // 使用 HMAC-SHA256 对预签名字符串进行签名
    const hmac = crypto.createHmac('sha256', this.secretKey);
    hmac.update(message);
    return hmac.digest('base64');
  }

  /**
   * 创建签名
   */
  protected createSignature(
    method: string,
    request_path: string,
    params?: Record<string, any>,
  ): { signature: string; timestamp: string } {
    // 获取 ISO 8601 格式时间戳
    const timestamp = new Date().toISOString();
    // 生成签名
    const message = this.preHash(timestamp, method, request_path, params);
    const signature = this.sign(message);
    return { signature, timestamp };
  }

  /**
   * 创建请求头
   */
  protected createHeaders(
    method: string,
    requestPath: string,
    params?: Record<string, any>,
  ): Record<string, string> {
    const { signature, timestamp } = this.createSignature(
      method,
      requestPath,
      params,
    );

    this.logger.debug(`创建请求头 - 方法: ${method}`);
    this.logger.debug(`路径: ${requestPath}`);
    this.logger.debug(`时间戳: ${timestamp}`);

    const headers = {
      'Content-Type': 'application/json',
      'OK-ACCESS-PROJECT': this.project,
      'OK-ACCESS-KEY': this.apiKey,
      'OK-ACCESS-SIGN': signature,
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': this.passphrase,
    };

    return headers;
  }

  /**
   * 发送请求并处理响应
   */
  protected async makeRequest<T>(
    method: 'GET' | 'POST',
    url: string,
    headers: Record<string, string>,
    data?: unknown,
    options: RequestOptions = DEFAULT_REQUEST_OPTIONS,
  ): Promise<T> {
    // 合并选项，确保使用默认值
    const mergedOptions = {
      timeout: options?.timeout ?? DEFAULT_REQUEST_OPTIONS.timeout ?? 10000,
      retries: options?.retries ?? DEFAULT_REQUEST_OPTIONS.retries ?? 3,
      retryDelay:
        options?.retryDelay ?? DEFAULT_REQUEST_OPTIONS.retryDelay ?? 1000,
      useWeb3ApiEndpoint: options?.useWeb3ApiEndpoint ?? false,
    };

    const { timeout, retries, retryDelay } = mergedOptions;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (attempt > 0) {
          this.logger.log(`重试请求 (${attempt}/${retries}): ${url}`);
          // 重试前等待
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }

        // 准备请求配置
        const requestConfig: AxiosRequestConfig = {
          baseURL: this.apiBaseUrl,
          method,
          url,
          headers,
          data,
          timeout,
          httpsAgent: this.agent,
          validateStatus: (status) => status >= 200 && status < 300,
        };

        // 如果配置了代理，添加代理设置
        if (this.proxyConfig) {
          requestConfig.proxy = {
            host: this.proxyConfig.host,
            port: this.proxyConfig.port,
            protocol: 'http',
          };

          // 如果有代理认证
          if (this.proxyConfig.username && this.proxyConfig.password) {
            if (requestConfig.proxy) {
              requestConfig.proxy.auth = {
                username: this.proxyConfig.username,
                password: this.proxyConfig.password,
              };
            }
          }

          this.logger.debug(
            `使用代理 ${this.proxyConfig.host}:${this.proxyConfig.port} 发送请求`,
          );
        }

        const response = await axios(requestConfig);

        return response.data as T;
      } catch (error) {
        lastError = error as Error;
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        // 只有特定错误才重试
        if (
          attempt < retries &&
          (errorMessage.includes('timeout') ||
            errorMessage.includes('network') ||
            errorMessage.includes('ECONNRESET') ||
            errorMessage.includes('ETIMEDOUT') ||
            errorMessage.includes('EPIPE') ||
            errorMessage.includes('EHOSTDOWN') || // 添加主机不可达错误
            errorMessage.includes('ECONNREFUSED')) // 添加连接被拒绝错误
        ) {
          this.logger.warn(`请求失败，将重试: ${errorMessage}`);
          continue;
        }

        // 达到最大重试次数或不应该重试的错误
        this.logger.error(
          `请求失败 (${attempt + 1}/${retries + 1}): ${errorMessage}`,
          error instanceof Error ? error.stack : undefined,
        );
        throw error;
      }
    }

    // 这里应该不会执行到，但为了类型安全
    throw lastError || new Error('未知错误');
  }

  /**
   * 获取API基础URL
   */
  protected getApiUrl(options?: RequestOptions): string {
    // 使用Web3 API端点
    if (options?.useWeb3ApiEndpoint) {
      return this.web3ApiUrl;
    }
    // 使用普通API端点
    return this.apiBaseUrl;
  }

  /**
   * 发送GET请求
   */
  async sendGetRequest<T>(
    api: string,
    queryParams: Record<string, any> = {},
    options?: RequestOptions,
  ): Promise<T> {
    try {
      const baseUrl = this.getApiUrl(options);
      // 构建完整URL
      const url = `${baseUrl}${api}`;
      const finalUrl = `${url}${queryParams ? '?' + querystring.stringify(queryParams) : ''}`;

      const headers = this.createHeaders('GET', api, queryParams);

      this.logger.debug(`发送GET请求到: ${finalUrl}`);
      this.logger.debug(`请求头: ${JSON.stringify(headers)}`);

      const response = await this.makeRequest<OkxApiResponse<T>>(
        'GET',
        finalUrl,
        headers,
        undefined,
        options,
      );

      if (response.code !== '0') {
        this.logger.error(`发送GET${api}请求到OKX API失败: ${response.msg}`);
        throw new Error(response.msg);
      }

      return response.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`发送GET${api}请求到OKX API失败: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * 发送POST请求
   */
  async sendPostRequest<T>(
    api: string,
    body: Record<string, any> = {},
    options?: RequestOptions,
  ): Promise<T> {
    try {
      const baseUrl = this.getApiUrl(options);
      // 构建完整URL
      const url = `${baseUrl}/${api}`;

      // 为POST请求创建头信息，包含body
      const headers = this.createHeaders('POST', api, body);

      this.logger.debug(`发送POST请求到: ${url}`);
      this.logger.debug(`请求体: ${JSON.stringify(body)}`);
      this.logger.debug(`请求头: ${JSON.stringify(headers)}`);

      const response = await this.makeRequest<OkxApiResponse<T>>(
        'POST',
        url,
        headers,
        body,
        options,
      );

      if (response.code !== '0') {
        this.logger.error(`发送POST${api}请求到OKX API失败: ${response.msg}`);
        throw new Error(response.msg);
      }

      return response.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`发送POST请求到OKX API失败: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * 健康检查 - 测试API连接
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.sendGetRequest<ApiTimeResponse>(
        '/api/v5/public/time',
        {},
        { timeout: 5000, retries: 1 },
      );
      return response && response.code === '0';
    } catch (error) {
      this.logger.error('API健康检查失败', error);
      return false;
    }
  }
}
