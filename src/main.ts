import { NestFactory } from "@nestjs/core";
import helmet from "helmet";

import { AppModule } from "./app.module";
import { config, loadConfig } from "./lib/config";
import { initialize as initCache } from "./lib/cache";
import { initialize as initDatabase, mongoClient } from "./lib/database";
import { initialize as initScheduler, stop as stopScheduler } from "./lib/scheduler";

async function graceful() {
  await stopScheduler();
  process.exit(0);
}

async function bootstrap() {
  loadConfig();
  initCache(config.redis);
  await initDatabase(config.mongodbURL);
  await initScheduler(mongoClient);

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(helmet());

  await app.listen(3000);

  process.on("SIGTERM", graceful);
  process.on("SIGINT", graceful);
}

bootstrap();
