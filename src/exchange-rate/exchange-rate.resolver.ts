import { Logger } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { GraphQLError } from "graphql";
import { ExchangeRateService } from "./exchange-rate.service";
import { ExchangeRateQueries } from "./exchange-rate.input";
import { supportedCurrencies } from "./exchange-rate.data";
import { ExchangeRateOutput } from "./exchange-rate.output";

@Resolver()
export class ExchangeRateResolver {
  private logger = new Logger("ExchangeRateResolver");
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Query((returns) => ExchangeRateOutput)
  async exchangeRate(@Args("input") queries: ExchangeRateQueries): Promise<ExchangeRateOutput> {
    const { from, to } = queries;

    if (!supportedCurrencies.includes(from)) {
      throw new GraphQLError("from currency is not supported");
    }
    if (!supportedCurrencies.includes(to)) {
      throw new GraphQLError("to currency is not supported");
    }

    try {
      const rate = await this.exchangeRateService.getExchangeRate(from, to);

      return { rate };
    } catch (error) {
      this.logger.error(`Error getting rate: ${JSON.stringify(error)}`);

      throw new GraphQLError("Rate not available at the moment, please try again later");
    }
  }
}
