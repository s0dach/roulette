import { Module } from '@nestjs/common'
import { MarketCsgoService } from './market-csgo.service'

@Module({
  exports: [MarketCsgoService],
  providers: [MarketCsgoService]
})
export class MarketCsgoModule {}
