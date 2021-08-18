import { Args, Query, Resolver } from "@nestjs/graphql";
import { ExchangeRateService } from "./exchange-rate.service";
import { ExchangeRateQueries } from "./exchange-rate.input";

@Resolver()
export class ExchangeRateResolver {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Query((returns) => Number)
  async exchangeRate(@Args("input") queries: ExchangeRateQueries): Promise<number> {
    return this.exchangeRateService.getExchangeRate(queries);
  }
}
