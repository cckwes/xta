import * as jf from "joiful";
import { Field, InputType } from "@nestjs/graphql";

@InputType("ExchangeRateQueryInput")
export class ExchangeRateQueries {
  @(jf.string().required())
  @Field()
  from: string;

  @(jf.string().required())
  @Field()
  to: string;
}
