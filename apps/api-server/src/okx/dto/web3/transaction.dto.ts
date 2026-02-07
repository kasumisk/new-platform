import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/**
 * 交易参数DTO
 */
export class TransactionDto {
  @ApiProperty({
    description: '发送方钱包地址',
    example: '0x1234567890123456789012345678901234567890',
  })
  @IsString()
  fromAddress: string;

  @ApiProperty({
    description: '接收方钱包地址',
    example: '0x0987654321098765432109876543210987654321',
  })
  @IsString()
  toAddress: string;

  @ApiProperty({
    description: '转账金额（ETH单位）',
    example: '0.01',
  })
  @IsString()
  amount: string;
}
