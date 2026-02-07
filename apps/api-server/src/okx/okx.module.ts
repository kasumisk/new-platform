import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { OkxController } from './okx.controller';
import { OkxWalletController } from './controllers/wallet.controller';
import { OkxDexController } from './controllers/dex.controller';
import { OkxMarketController } from './controllers/market.controller';
import { OkxDefiController } from './controllers/defi.controller';
import { OkxWeb3Controller } from './controllers/web3.controller';

/**
 * OKX模块
 * 包含所有OKX相关的控制器
 */
@Module({
  imports: [CoreModule],
  controllers: [
    // 保留原有控制器，提供向后兼容性
    OkxController,
    // 新的专门控制器
    OkxWalletController,
    OkxDexController,
    OkxMarketController,
    OkxDefiController,
    OkxWeb3Controller,
  ],
})
export class OkxModule {}
