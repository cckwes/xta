import { Injectable, Logger } from "@nestjs/common";
import { RateProviderService } from "../exchange-rate/rate-provider.service";
import { setWithExpiry } from "../lib/cache";
import { scheduleRepeatingTask } from "../lib/scheduler";
import { config } from "../lib/config";

@Injectable()
export class PollExchangeRateService {
  private readonly logger = new Logger("PollExchangeRateService");

  constructor(private readonly rateProviderService: RateProviderService) {
    scheduleRepeatingTask(
      "poll-currency-pairs",
      this.pollAlwaysInCacheRates.bind(this),
      "60 minutes",
    );
  }

  async pollAlwaysInCacheRates(): Promise<void> {
    const { alwaysInCacheRatePairs } = config;
    const simplifiedRatePairs: Record<string, Set<string>> = {};

    alwaysInCacheRatePairs.forEach((pair) => {
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
