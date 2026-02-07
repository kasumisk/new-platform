import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, IsNumberString } from 'class-validator';

export class LegacyTransactionDto {
  @ApiProperty({
    description: '发送方地址',
    example: '0x1234567890123456789012345678901234567890',
  })
  @IsNotEmpty({ message: '发送方地址不能为空' })
  @IsString({ message: '发送方地址必须是字符串' })
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: '发送方地址必须是有效的以太坊地址格式',
  })
  fromAddress: string;

  @ApiProperty({
    description: '接收方地址',
    example: '0x0987654321098765432109876543210987654321',
  })
  @IsNotEmpty({ message: '接收方地址不能为空' })
  @IsString({ message: '接收方地址必须是字符串' })
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: '接收方地址必须是有效的以太坊地址格式',
  })
  toAddress: string;

  @ApiProperty({
    description: '发送金额',
    example: '0.1',
  })
  @IsNotEmpty({ message: '发送金额不能为空' })
  @IsNumberString({}, { message: '发送金额必须是数字字符串' })
  amount: string;
}
