import { Injectable, Logger } from "@nestjs/common";
import { RateProviderService } from "./rate-provider.service";
import { get, setWithExpiry } from "../lib/cache";
import { scheduleRepeatingTask } from "../lib/scheduler";

const alwaysInCacheRatesPair = [
  { from: "USD", to: "SGD" },
  { from: "SGD", to: "USD" },
  { from: "USD", to: "HKD" },
  { from: "HKD", to: "USD" },
];

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger("ExchangeRateService");

  constructor(private readonly rateProviderService: RateProviderService) {
    scheduleRepeatingTask(
      "poll-currency-pairs",
      this.pollAlwaysInCacheRates.bind(this),
      "60 minutes",
    );
  }

  async getExchangeRate(from: string, to: string): Promise<number | undefined> {
    this.logger.log(`getting exchange rate for: ${from} -> ${to}`);

    const key = `exchange-rate:${from}-${to}`;
    const rateFromCache = await get(key);
    if (rateFromCache) {
      return rateFromCache;
    }

    const result = await this.rateProviderService.getRate(from, [to]);
    const rate = result.rates[to];
    await setWithExpiry(key, rate, 60 * 60);

    return rate;
  }

  async pollAlwaysInCacheRates(): Promise<void> {
    const simplifiedRatePairs: Record<string, Set<string>> = {};
    alwaysInCacheRatesPair.forEach((pair) => {
      if (simplifiedRatePairs[pair.from]) {
        simplifiedRatePairs[pair.from].add(pair.to);
      } else {
        simplifiedRatePairs[pair.from] = new Set([pair.to]);
      }
    });

    for (const key in simplifiedRatePairs) {
      const from = key;
      const to = Array.from(simplifiedRatePairs[key]);

      try {
        const rates = await this.rateProviderService.getRate(from, to);

        for (const toCurrency in rates.rates) {
          const cacheKey = `exchange-rate:${from}-${toCurrency}`;
          await setWithExpiry(cacheKey, rates.rates[toCurrency], 60 * 60);
        }
      } catch (error) {
        this.logger.error(`error fetching and storing rate: ${JSON.stringify(error)}`);
      }
    }
  }
}
