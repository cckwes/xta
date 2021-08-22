import { Module } from "@nestjs/common";
import { ExchangeRateModule } from "../exchange-rate/exchange-rate.module";
import { PollExchangeRateService } from "./poll-exchange-rate.service";

@Module({
  imports: [ExchangeRateModule],
  providers: [PollExchangeRateService],
})
export class PollExchangeRateModule {}
