import {
  Controller,
  Get,
  Post,
  Body,
  Logger,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import {
  Web3Service,
  BalanceResponse,
  TransactionResponse,
} from '../../core/okx/web3.service';
import { TransactionDto } from '../dto/web3/transaction.dto';

@ApiTags('OKX - Web3 API')
@Controller('okx/web3')
export class OkxWeb3Controller {
  private readonly logger = new Logger(OkxWeb3Controller.name);

  constructor(private readonly web3Service: Web3Service) {}

  @Get('balance/:address')
  @ApiOperation({ summary: '获取账户余额' })
  @ApiParam({ name: 'address', description: '钱包地址' })
  @ApiResponse({
    status: 200,
    description: '成功获取账户余额',
  })
  async getAccountBalance(
    @Param('address') address: string,
  ): Promise<BalanceResponse> {
    if (!address) {
      throw new HttpException('钱包地址不能为空', HttpStatus.BAD_REQUEST);
    }

    this.logger.log(`获取账户余额：${address}`);
    try {
      return await this.web3Service.getAccountBalance(address);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`获取账户余额失败: ${message}`);
      throw new HttpException(
        `获取账户余额失败: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('transfer')
  @ApiOperation({ summary: '发送交易' })
  @ApiResponse({
    status: 200,
    description: '交易已构造',
  })
  async sendTransaction(
    @Body() transactionDto: TransactionDto,
  ): Promise<TransactionResponse> {
    const { fromAddress, toAddress, amount } = transactionDto;

    if (!fromAddress || !toAddress || !amount) {
      throw new HttpException(
        '发送方地址、接收方地址和金额都不能为空',
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.log(
      `发送交易：从 ${fromAddress} 到 ${toAddress}，金额: ${amount}`,
    );
    try {
      return await this.web3Service.sendTransaction(
        fromAddress,
        toAddress,
        amount,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`发送交易失败: ${message}`);
      throw new HttpException(
        `发送交易失败: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
