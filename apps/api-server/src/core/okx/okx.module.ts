import { Module } from '@nestjs/common';
import { OkxService } from './okx.service';
import { Web3Service } from './web3.service';
import { OkxBaseService } from './base.service';
import { OkxWalletService } from './wallet.service';
import { OkxDexService } from './dex.service';
import { OkxMarketService } from './market.service';
import { OkxDefiService } from './defi.service';

@Module({
  providers: [
    OkxService,
    Web3Service,
    OkxBaseService,
    OkxWalletService,
    OkxDexService,
    OkxMarketService,
    OkxDefiService,
  ],
  exports: [
    OkxService,
    Web3Service,
    OkxWalletService,
    OkxDexService,
    OkxMarketService,
    OkxDefiService,
  ],
})
export class OkxModule {}
