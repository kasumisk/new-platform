import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

/**
 * 资产明细查询请求参数DTO
 */
export class TokenBalancesRequestDto {
  @ApiProperty({
    description: '地址',
    example: '0xEd0C6079229E2d407672a117c22b62064f4a4312',
  })
  @IsString()
  address: string;

  @ApiProperty({
    description: '筛选需要查询资产明细的链，多条链以","分隔，最多支持50个',
    example: '1,56,137',
  })
  @IsString()
  chains: string;

  @ApiProperty({
    description: '是否过滤风险空投币: 0-过滤, 1-不过滤',
    example: '0',
    required: false,
  })
  @IsOptional()
  @IsString()
  filter?: string;
}

/**
 * 代币资产信息
 */
export class TokenAssetDto {
  @ApiProperty({ description: '链唯一标识' })
  chainIndex: string;

  @ApiProperty({ description: '合约地址' })
  tokenAddress: string;

  @ApiProperty({ description: '地址' })
  address: string;

  @ApiProperty({ description: '代币简称' })
  symbol: string;

  @ApiProperty({ description: '代币数量' })
  balance: string;

  @ApiProperty({ description: '代币的原始数量' })
  rawBalance: string;

  @ApiProperty({ description: '币种单位价值，以美元计价' })
  tokenPrice: string;

  @ApiProperty({ description: '币种类型: 1：token 2：铭文' })
  tokenType: string;

  @ApiProperty({ description: '铭文资产可直接转账、交易的余额数量' })
  transferAmount: string;

  @ApiProperty({
    description: '铭文资产需要完成铭刻操作才可以交易、转账的数量',
  })
  availableAmount: string;

  @ApiProperty({ description: '是否为风险空投币' })
  isRiskToken: boolean;
}

/**
 * 资产明细查询响应DTO
 */
export class TokenBalancesResponseDto {
  @ApiProperty({ type: [TokenAssetDto], description: '代币余额' })
  tokenAssets: TokenAssetDto[];
}
