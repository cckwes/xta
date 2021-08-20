import { Args, Query, Resolver } from "@nestjs/graphql";
import { ExchangeRateService } from "./exchange-rate.service";
import { ExchangeRateQueries } from "./exchange-rate.input";
import { GraphQLError } from "graphql";
import { supportedCurrencies } from "./exchange-rate.data";

@Resolver()
export class ExchangeRateResolver {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Query((returns) => Number)
  async exchangeRate(@Args("input") queries: ExchangeRateQueries): Promise<number> {
    const { from, to } = queries;

    if (!supportedCurrencies.includes(from)) {
      throw new GraphQLError("from currency is not supported");
    }
    if (!supportedCurrencies.includes(to)) {
      throw new GraphQLError("to currency is not supported");
    }

    const rate = await this.exchangeRateService.getExchangeRate(from, to);
    if (!rate) {
      throw new GraphQLError("Rate not available at the moment, please try again later");
    }
    return this.exchangeRateService.getExchangeRate(from, to);
  }
}
