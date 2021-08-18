import { Injectable, Logger } from "@nestjs/common";
import { ExchangeRateQueries } from "./exchange-rate.input";

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger("ExchangeRateService");

  async getExchangeRate(data: ExchangeRateQueries): Promise<number> {
    return 0;
  }
}
