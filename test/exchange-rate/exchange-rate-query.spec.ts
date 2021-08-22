import { INestApplication } from "@nestjs/common";
import * as sinon from "sinon";
import request from "supertest";
import { expect, use } from "chai";
import sinonChai from "sinon-chai";

import { createExchangeRateTestModule, providerGetRateStub } from "./helper";
import { get, setWithExpiry } from "../../src/lib/cache";

use(sinonChai);

const createExchangeRateQuery = (from: string, to: string) => ({
  query: `query getExchangeRate($input: ExchangeRateQueryInput!) {
      exchangeRate(input: $input) {
        rate
      }
    }`,
  variables: {
    input: {
      from,
      to,
    },
  },
});

describe("GraphQL exchangeRate query", () => {
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
      .post("/graphql")
      .send(createExchangeRateQuery("USD", "SGD"))
      .expect(200)
      .then((response) => {
        expect(response.body.data).to.deep.equal({
          exchangeRate: {
            rate: 1.3456,
          },
        });
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
      .post("/graphql")
      .send(createExchangeRateQuery("SGD", "USD"))
      .expect(200)
      .then((response) => {
        expect(response.body.data).to.deep.equal({
          exchangeRate: {
            rate: 0.731125,
          },
        });
      });

    const rateInCache = await get("exchange-rate:SGD-USD");
    expect(rateInCache).to.equal("0.731125");
  });

  it("should be able to get rate from cache", async () => {
    await setWithExpiry("exchange-rate:USD-HKD", 7.76891, 60 * 60);

    await request(app.getHttpServer())
      .post("/graphql")
      .send(createExchangeRateQuery("USD", "HKD"))
      .expect(200)
      .then((response) => {
        expect(response.body.data).to.deep.equal({
          exchangeRate: {
            rate: 7.76891,
          },
        });
      });

    expect(providerGetRateStub).to.have.not.been.called;
  });

  it("should throw error if from currency is invalid", async () => {
    await request(app.getHttpServer())
      .post("/graphql")
      .send(createExchangeRateQuery("ALIENCOIN", "USD"))
      .expect(200)
      .then((response) => {
        expect(response.body.data).to.be.null;
        expect(response.body.errors[0].message).to.equal("from currency is not supported");
      });

    expect(providerGetRateStub).to.have.not.been.called;
  });

  it("should throw error if to currency is invalid", async () => {
    await request(app.getHttpServer())
      .post("/graphql")
      .send(createExchangeRateQuery("USD", "HELLOCOIN"))
      .expect(200)
      .then((response) => {
        expect(response.body.data).to.be.null;
        expect(response.body.errors[0].message).to.equal("to currency is not supported");
      });

    expect(providerGetRateStub).to.have.not.been.called;
  });

  it("should throw error if unable to get rate from remote rate provider", async () => {
    providerGetRateStub.throws();

    await request(app.getHttpServer())
      .post("/graphql")
      .send(createExchangeRateQuery("SGD", "HKD"))
      .expect(200)
      .then((response) => {
        expect(response.body.data).to.be.null;
        expect(response.body.errors[0].message).to.equal(
          "Rate not available at the moment, please try again later",
        );
      });
  });
});
