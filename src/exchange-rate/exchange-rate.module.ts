import { Module } from "@nestjs/common";
import { ExchangeRateService } from "./exchange-rate.service";
import { ExchangeRateController } from "./exchange-rate.controller";
import { ExchangeRateResolver } from "./exchange-rate.resolver";
import { RateProviderService } from "./rate-provider.service";

@Module({
  controllers: [ExchangeRateController],
  providers: [ExchangeRateService, ExchangeRateResolver, RateProviderService],
})
export class ExchangeRateModule {}
