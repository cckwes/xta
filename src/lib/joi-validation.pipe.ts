import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from "@nestjs/common";
import * as jf from "joiful";
import { Constructor } from "joiful/core";

interface ValidationSchema {
  requestBody?: Constructor<any>;
  query?: Constructor<any>;
  param?: Constructor<any>;
}

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ValidationSchema) {}

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  transform(value: any, metadata: ArgumentMetadata): any {
    if (metadata.type === "custom") {
      return value;
    }

    const typeToSchemaMapping = {
      body: "requestBody",
      param: "param",
      query: "query",
    };

    const { error } = jf.validateAsClass(value, this.schema[typeToSchemaMapping[metadata.type]]);
    if (error) {
      throw new BadRequestException(`Validation failed ${error.details[0].message}`);
    }

    return value;
  }
}
