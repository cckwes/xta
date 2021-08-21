import Redis from "ioredis";
import { ConfigSchema } from "./config";
import { HealthIndicatorResult } from "@nestjs/terminus";

let redis: Redis.Redis;

const initialize = (redisConfig: ConfigSchema["redis"]): void => {
  if (redis) {
    return;
  }

  redis = new Redis(redisConfig.port, redisConfig.host);
};

const healthCheck = async (): Promise<HealthIndicatorResult> => {
  try {
    await redis.ping("ping health check");
    return { redis: { status: "up" } };
  } catch (error) {
    return { redis: { status: "down", message: error.message ?? "" } };
  }
};

const setWithExpiry = async (
  key: string,
  value: string | number,
  TTLSeconds: number,
): Promise<void> => {
  await redis.setex(key, TTLSeconds, value);
};

const get = async (key: string): Promise<any> => {
  return redis.get(key);
};

const clearAllData = async (): Promise<string> => {
  return redis.flushall();
};

export { initialize, healthCheck, setWithExpiry, get, clearAllData };
