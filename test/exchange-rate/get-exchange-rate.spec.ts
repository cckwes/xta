import { INestApplication } from "@nestjs/common";
import * as sinon from "sinon";
import { expect, use } from "chai";
import sinonChai from "sinon-chai";
import request from "supertest";

import { get, setWithExpiry } from "../../src/lib/cache";

import { createExchangeRateTestModule, providerGetRateStub } from "./helper";

use(sinonChai);

describe("GET /exchange-rate", () => {
  let app: INestApplication;

  before(async () => {
    app = await createExchangeRateTestModule();
    await app.init();
  });

  afterEach(() => {
    sinon.reset();
  });

  it("should be able to get exchange rate from remote rate provider", async () => {
    providerGetRateStub.resolves({
      from: "USD",
      rates: {
        SGD: 1.3456,
      },
    });

    await request(app.getHttpServer())
      .get("/exchange-rate?from=USD&to=SGD")
      .expect(200)
      .then((response) => {
        expect(response.body.rate).to.equal(1.3456);
      });
    expect(providerGetRateStub).to.have.been.calledOnce;
    expect(providerGetRateStub).to.have.been.calledWith("USD", ["SGD"]);
  });

  it("should save the exchange rate in cache", async () => {
    providerGetRateStub.resolves({
      from: "SGD",
      rates: {
        USD: 0.731125,
      },
    });

    await request(app.getHttpServer())
      .get("/exchange-rate?from=SGD&to=USD")
      .expect(200)
      .then((response) => {
        expect(response.body.rate).to.equal(0.731125);
      });

    const rateInCache = await get("exchange-rate:SGD-USD");
    expect(rateInCache).to.equal("0.731125");
  });

  it("should be able to get exchange rate from cache if exists", async () => {
    await setWithExpiry("exchange-rate:USD-HKD", 7.76891, 60 * 60);

    await request(app.getHttpServer())
      .get("/exchange-rate?from=USD&to=HKD")
      .expect(200)
      .then((response) => {
        expect(response.body.rate).to.equal(7.76891);
      });

    expect(providerGetRateStub).to.have.not.been.called;
  });

  it("should throw error if from currency is not supported", async () => {
    await request(app.getHttpServer())
      .get("/exchange-rate?from=ALIENCOIN&to=USD")
      .expect(400)
      .then((response) => {
        expect(response.body.message).to.equal("from currency is not supported");
      });

    expect(providerGetRateStub).to.have.not.been.called;
  });

  it("should throw error if to currency is not supported", async () => {
    await request(app.getHttpServer())
      .get("/exchange-rate?from=USD&to=HELLOCOIN")
      .expect(400)
      .then((response) => {
        expect(response.body.message).to.equal("to currency is not supported");
      });

    expect(providerGetRateStub).to.have.not.been.called;
  });

  it("should throw error if unable to get rate from remote rate provider", async () => {
    providerGetRateStub.throws();

    await request(app.getHttpServer())
      .get("/exchange-rate?from=SGD&to=HKD")
      .expect(503)
      .then((response) => {
        expect(response.body.message).to.equal(
          "Rate not available at the moment, please try again later",
        );
      });
  });
});
