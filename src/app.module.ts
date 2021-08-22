import { Module } from "@nestjs/common";
import { ExchangeRateModule } from "./exchange-rate/exchange-rate.module";
import { GraphQLModule } from "@nestjs/graphql";
import { TerminusModule } from "@nestjs/terminus";
import { HealthCheckModule } from "./health-check/health-check.module";
import { PollExchangeRateModule } from "./poll-exchange-rate/poll-exchange-rate.module";

@Module({
  imports: [
    ExchangeRateModule,
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      playground: false,
      context: ({ req }) => ({ req }),
    }),
    PollExchangeRateModule,
    TerminusModule,
    HealthCheckModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
