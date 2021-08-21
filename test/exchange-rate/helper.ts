import { INestApplication } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { Test } from "@nestjs/testing";
import * as sinon from "sinon";

import { ExchangeRateController } from "../../src/exchange-rate/exchange-rate.controller";
import { ExchangeRateService } from "../../src/exchange-rate/exchange-rate.service";
import { ExchangeRateResolver } from "../../src/exchange-rate/exchange-rate.resolver";
import { RateProviderService } from "../../src/exchange-rate/rate-provider.service";

export const providerGetRateStub = sinon.stub();

const mockRateProviderService = {
  provide: RateProviderService,
  useValue: {
    getRate: providerGetRateStub,
  },
};

export async function createExchangeRateTestModule(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [
      GraphQLModule.forRoot({
        autoSchemaFile: true,
        playground: false,
        context: ({ req }) => ({ req }),
      }),
    ],
    controllers: [ExchangeRateController],
    providers: [ExchangeRateService, ExchangeRateResolver, mockRateProviderService],
  }).compile();

  return moduleRef.createNestApplication();
}
