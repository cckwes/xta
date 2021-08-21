import nock from "nock";
import { RateProviderService } from "./rate-provider.service";
import { config } from "../lib/config";
import { expect } from "chai";

describe("Rate provider service", () => {
  const rateProviderService = new RateProviderService();

  it("should be able to fetch rate from provider", async () => {
    nock(config.fixer.baseURL)
      .get(`/latest`)
      .query({ access_key: config.fixer.apiKey, base: "USD", symbols: "SGD,HKD" })
      .reply(200, {
        success: true,
        timestamp: 1629419232,
        base: "USD",
        date: "2021-08-20",
        rates: {
          SGD: 1.3245,
          HKD: 7.7983,
        },
      });

    const result = await rateProviderService.getRate("USD", ["SGD", "HKD"]);
    expect(result).to.deep.equal({
      from: "USD",
      rates: {
        SGD: 1.3245,
        HKD: 7.7983,
      },
    });
    expect(nock.isDone()).to.be.true;
  });
});
