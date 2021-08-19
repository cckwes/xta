import { Module } from "@nestjs/common";
import { ExchangeRateService } from "./exchange-rate.service";
import { ExchangeRateController } from "./exchange-rate.controller";
import { ExchangeRateResolver } from "./exchange-rate.resolver";

@Module({
  imports: [],
  controllers: [ExchangeRateController],
  providers: [ExchangeRateService, ExchangeRateResolver],
})
export class ExchangeRateModule {}
