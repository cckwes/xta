import { NestFactory } from "@nestjs/core";
import * as helmet from "helmet";
import { AppModule } from "./app.module";
import { config } from "./config";

async function bootstrap() {
  config.loadConfig();
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(helmet());

  await app.listen(3000);
}

bootstrap();
