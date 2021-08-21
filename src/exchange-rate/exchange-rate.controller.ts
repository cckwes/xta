import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Query,
  ServiceUnavailableException,
  UsePipes,
} from "@nestjs/common";
import { ExchangeRateService } from "./exchange-rate.service";
import { ExchangeRateQueries } from "./exchange-rate.input";
import { JoiValidationPipe } from "../lib/joi-validation.pipe";
import { supportedCurrencies } from "./exchange-rate.data";
import { ExchangeRateOutput } from "./exchange-rate.output";

@Controller("/exchange-rate")
export class ExchangeRateController {
  private logger = new Logger("ExchangeRateController");
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Get("/")
  @UsePipes(new JoiValidationPipe({ query: ExchangeRateQueries }))
  async getExchangeRate(@Query() queries: ExchangeRateQueries): Promise<ExchangeRateOutput> {
    const { from, to } = queries;

    if (!supportedCurrencies.includes(from)) {
      throw new BadRequestException("from currency is not supported");
    }
    if (!supportedCurrencies.includes(to)) {
      throw new BadRequestException("to currency is not supported");
    }

    try {
      const rate = await this.exchangeRateService.getExchangeRate(from, to);

      return { rate };
    } catch (error) {
      this.logger.error(`Error getting rate: ${JSON.stringify(error)}`);

      throw new ServiceUnavailableException(
        "Rate not available at the moment, please try again later",
      );
    }
  }
}
