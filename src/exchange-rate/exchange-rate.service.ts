import { Injectable, Logger } from "@nestjs/common";
import { RateProviderService } from "./rate-provider.service";
import { get, setWithExpiry } from "../lib/cache";

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger("ExchangeRateService");

  constructor(private readonly rateProviderService: RateProviderService) {}

  async getExchangeRate(from: string, to: string): Promise<number | undefined> {
    this.logger.log(`getting exchange rate for: ${from} -> ${to}`);

    const key = `exchange-rate:${from}-${to}`;
    const rateFromCache = await get(key);
    if (rateFromCache) {
      return Number(rateFromCache);
    }

    const result = await this.rateProviderService.getRate(from, [to]);
    const rate = result.rates[to];
    await setWithExpiry(key, rate, 60 * 60);

    return rate;
  }
}
