import { Controller, Get, Query, UsePipes } from "@nestjs/common";
import { ExchangeRateService } from "./exchange-rate.service";
import { ExchangeRateQueries } from "./exchange-rate.input";
import { JoiValidationPipe } from "../lib/joi-validation.pipe";

@Controller("/exchange-rate")
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Get("/")
  @UsePipes(new JoiValidationPipe({ query: ExchangeRateQueries }))
  async getExchangeRate(@Query() queries: ExchangeRateQueries): Promise<number> {
    return this.exchangeRateService.getExchangeRate(queries);
  }
}
