import { Injectable } from "@nestjs/common";
import axios from "axios";
import axiosRetry from "axios-retry";
import { config } from "../lib/config";

axiosRetry(axios, { retries: 3 });

interface FixerGetRateResponse {
  success: boolean;
  timestamp: number;
  base: string;
  date: string;
  rates: Record<string, number>;
  error?: Record<string, any>;
}

export interface GetRateResult {
  from: string;
  rates: Record<string, number>;
}

@Injectable()
export class RateProviderService {
  async getRate(from: string, to: string[]): Promise<GetRateResult> {
    const toCurrencySymbols = to.join(",");

    const { data: result } = await axios.get<FixerGetRateResponse>("latest", {
      baseURL: config.fixer.baseURL,
      params: {
        access_key: config.fixer.apiKey,
        base: from,
        symbols: toCurrencySymbols,
      },
    });
    if (!result.success) {
      throw Error(result.error.type);
    }

    return {
      from: result.base,
      rates: result.rates,
    };
  }
}
