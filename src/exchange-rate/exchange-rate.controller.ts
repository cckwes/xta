import {
  BadRequestException,
  Controller,
  Get,
  Query,
  ServiceUnavailableException,
  UsePipes,
} from "@nestjs/common";
import { ExchangeRateService } from "./exchange-rate.service";
import { ExchangeRateQueries } from "./exchange-rate.input";
import { JoiValidationPipe } from "../lib/joi-validation.pipe";
import { supportedCurrencies } from "./exchange-rate.data";

@Controller("/exchange-rate")
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Get("/")
  @UsePipes(new JoiValidationPipe({ query: ExchangeRateQueries }))
  async getExchangeRate(@Query() queries: ExchangeRateQueries): Promise<number> {
    const { from, to } = queries;

    if (!supportedCurrencies.includes(from)) {
      throw new BadRequestException("from currency is not supported");
    }
    if (!supportedCurrencies.includes(to)) {
      throw new BadRequestException("to currency is not supported");
    }

    const rate = this.exchangeRateService.getExchangeRate(from, to);
    if (!rate) {
      throw new ServiceUnavailableException(
        "Rate not available at the moment, please try again later",
      );
    }

    return rate;
  }
}
