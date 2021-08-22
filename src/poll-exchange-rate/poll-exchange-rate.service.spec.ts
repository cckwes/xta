import sinon from "sinon";
import { expect } from "chai";
import { PollExchangeRateService } from "./poll-exchange-rate.service";
import { getJobs } from "../lib/scheduler";
import { get } from "../lib/cache";
import { providerGetRateStub } from "../../test/exchange-rate/helper";

describe("poll exchange rate service", () => {
  afterEach(async () => {
    sinon.reset();
  });

  it("should create scheduler to get always in cache rate pairs", async () => {
    providerGetRateStub.resolves();
    new PollExchangeRateService({
      getRate: providerGetRateStub,
    });

    const jobs = await getJobs();
    expect(jobs.length).to.equal(1);

    const [job] = jobs;
    expect(job.attrs.name).to.equal("poll-currency-pairs");
    expect(job.attrs.repeatInterval).to.equal("60 minutes");
  });

  it("should get rates and store in cache on created", async () => {
    providerGetRateStub
      .withArgs("USD", ["SGD", "HKD"])
      .resolves({ from: "USD", rates: { SGD: 1.3456, HKD: 7.7913 } });
    providerGetRateStub.withArgs("SGD", ["USD"]).resolves({ from: "SGD", rates: { USD: 0.7322 } });
    providerGetRateStub.withArgs("HKD", ["USD"]).resolves({ from: "HKD", rates: { USD: 0.1385 } });

    new PollExchangeRateService({
      getRate: providerGetRateStub,
    });

    // adding a 6s sleep here because Agenda by default scan new job every 5s
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 6000);
    });

    expect(providerGetRateStub).to.have.callCount(3);

    const expectedResult = [
      { from: "USD", to: "SGD", rate: 1.3456 },
      { from: "SGD", to: "USD", rate: 0.7322 },
      { from: "USD", to: "HKD", rate: 7.7913 },
      { from: "HKD", to: "USD", rate: 0.1385 },
    ];
    for (const item of expectedResult) {
      const rate = Number(await get(`exchange-rate:${item.from}-${item.to}`));
      expect(rate).to.equal(item.rate);
    }
  }).timeout(10000);
});
