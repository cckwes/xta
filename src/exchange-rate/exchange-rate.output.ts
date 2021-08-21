import { Field, Float, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ExchangeRateOutput {
  @Field((type) => Float)
  rate: number;
}
