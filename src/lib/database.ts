import { MongoClient } from "mongodb";
import { HealthIndicatorResult } from "@nestjs/terminus";

let mongoClient: MongoClient;

const initialize = async (mongodbURL: string): Promise<void> => {
  if (mongoClient) {
    return;
  }

  mongoClient = new MongoClient(mongodbURL);
  await mongoClient.connect();
};

const healthCheck = async (): Promise<HealthIndicatorResult> => {
  try {
    await mongoClient.db("agenda").command({ ping: 1 });
    return { mongodb: { status: "up" } };
  } catch (error) {
    return { mongodb: { status: "down", message: error.message ?? "" } };
  }
};

export { initialize, healthCheck, mongoClient };
