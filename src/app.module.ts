import { Module } from "@nestjs/common";
import { ExchangeRateModule } from "./exchange/exchange-rate.module";
import { GraphQLModule } from "@nestjs/graphql";
import { TerminusModule } from "@nestjs/terminus";

@Module({
  imports: [
    ExchangeRateModule,
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      playground: false,
      context: ({ req }) => ({ req }),
    }),
    TerminusModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
