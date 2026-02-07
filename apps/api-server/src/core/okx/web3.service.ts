import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from '../config/configuration';
import { Web3 } from 'web3';

export interface BalanceResponse {
  address: string;
  balance: string;
  unit: string;
}

export interface TransactionResponse {
  transaction: {
    from: string;
    to: string;
    value: string;
    gas: number;
  };
  status: string;
  message: string;
}

@Injectable()
export class Web3Service implements OnModuleInit {
  private readonly logger = new Logger(Web3Service.name);
  private readonly web3RpcUrl: string;
  private web3!: Web3; // 使用非空断言，因为在onModuleInit中初始化

  constructor(private readonly configService: ConfigService<Config>) {
    const rpcUrl = this.configService.get('okx.web3RpcUrl', { infer: true });
    this.web3RpcUrl = rpcUrl || 'https://eth.llamarpc.com';
    this.logger.log(`Web3 RPC URL set to: ${this.web3RpcUrl}`);
  }

  async onModuleInit() {
    try {
      await this.initializeWeb3();
      this.logger.log('Web3 initialized in onModuleInit');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to initialize Web3: ${errorMessage}`);
    }
  }

  /**
   * 初始化Web3实例
   */
  async initializeWeb3() {
    try {
      this.web3 = new Web3(this.web3RpcUrl);
      // 执行一个简单的调用来测试连接
      const blockNumber = await this.web3.eth.getBlockNumber();
      this.logger.log(`Web3 初始化成功，当前区块高度: ${blockNumber}`);
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Web3 初始化失败: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * 获取账户余额
   */
  async getAccountBalance(address: string): Promise<BalanceResponse> {
    try {
      const balance = await this.web3.eth.getBalance(address);
      const balanceInEther = this.web3.utils.fromWei(balance, 'ether');
      this.logger.log(`获取账户 ${address} 的余额: ${balanceInEther} ETH`);
      return { address, balance: balanceInEther, unit: 'ETH' };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`获取账户余额失败: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * 发送交易示例
   * 注意：实际使用需要签名私钥
   */
  async sendTransaction(
    fromAddress: string,
    toAddress: string,
    amount: string,
  ): Promise<TransactionResponse> {
    try {
      // 转换金额为Wei
      const amountInWei = this.web3.utils.toWei(amount, 'ether');

      // 验证地址格式
      if (!this.web3.utils.isAddress(fromAddress)) {
        throw new Error(`无效的发送方地址: ${fromAddress}`);
      }

      if (!this.web3.utils.isAddress(toAddress)) {
        throw new Error(`无效的接收方地址: ${toAddress}`);
      }

      // 获取当前区块以确认连接
      await this.web3.eth.getBlockNumber();

      // 注意：这里只是构造交易对象，实际发送需要签名
      const tx = {
        from: fromAddress,
        to: toAddress,
        value: amountInWei,
        gas: 21000,
      };

      this.logger.log(
        `构造交易: 从 ${fromAddress} 发送 ${amount} ETH 到 ${toAddress}`,
      );

      // 实际应用中，这里需要用私钥签名交易后再发送
      // 由于安全考虑，此示例仅返回交易对象
      return {
        transaction: tx,
        status: 'prepared',
        message: '交易已准备好，但未发送。实际应用中需要私钥签名。',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`构造交易失败: ${errorMessage}`);
      throw error;
    }
  }
}
