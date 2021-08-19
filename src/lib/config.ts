import * as fs from "fs";
import * as J from "joi";

export interface ConfigSchema {
  mongodbURL: string;
  redis: {
    host: string;
    port: number;
  };
  fixer: {
    apiKey: string;
  };
}

const configSchema = J.object({
  mongodbURL: J.string().required(),
  redis: J.object({
    host: J.string().required(),
    port: J.number().required(),
  }),
  fixer: J.object({
    apiKey: J.string().required(),
  }),
});

let config: ConfigSchema;

const validateConfig = (config: unknown): ConfigSchema => {
  const validationResult = configSchema.validate(config);
  if (validationResult.error) {
    throw Error(`invalid config: ${validationResult.error}`);
  }

  return validationResult.value as ConfigSchema;
};

const loadConfigFromFile = (): ConfigSchema => {
  const config = JSON.parse(fs.readFileSync("./config/config.json").toString());
  return validateConfig(config);
};

const loadConfigFromEnvVar = (): ConfigSchema => {
  const config: ConfigSchema = {
    mongodbURL: process.env.MONGODB_URL,
    redis: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
    fixer: {
      apiKey: process.env.FIXER_API_KEY,
    },
  };
  return validateConfig(config);
};

const loadConfig = (): void => {
  if (fs.existsSync("./config/config.json")) {
    config = loadConfigFromFile();
    return;
  }

  config = loadConfigFromEnvVar();
};

export { config, loadConfig };
