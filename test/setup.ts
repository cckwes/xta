import { loadConfig, config } from "../src/lib/config";
import { clearAllData, initialize as initCache } from "../src/lib/cache";
import { initialize as initDatabase, mongoClient } from "../src/lib/database";
import { initialize as initScheduler } from "../src/lib/scheduler";

async function cleanDatabase() {
  const collections = await mongoClient.db("xta").collections();

  for (const collection of collections) {
    await collection.deleteMany({});
  }
}

before(async () => {
  loadConfig();
  initCache(config.redis);
  await initDatabase(config.mongodbURL);
  await initScheduler(mongoClient);
});

beforeEach(async () => {
  await clearAllData();
  await cleanDatabase();
});
