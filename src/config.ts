import * as fs from "fs";
import * as J from "joi";

interface Config {
  mongodbURL: string;
  redis: {
    host: string;
    port: number;
  };
}

const configSchema = J.object({
  mongodbURL: J.string().required(),
  redis: {
    host: J.string().required(),
    port: J.number().required(),
  },
});

class Configuration {
  private config: Config;

  loadConfig() {
    if (fs.existsSync("./config/config.json")) {
      this.config = this.loadConfigFromFile();
      return;
    }

    this.config = this.loadConfigFromEnvVar();
  }

  private validateConfig(config: unknown): Config {
    const validationResult = configSchema.validate(config);
    if (validationResult.error) {
      throw Error(`invalid config: ${validationResult.error}`);
    }

    return validationResult.value as Config;
  }

  private loadConfigFromFile(): Config {
    const config = JSON.parse(fs.readFileSync("./config/config.json").toString());
    return this.validateConfig(config);
  }

  private loadConfigFromEnvVar(): Config {
    const config: Config = {
      mongodbURL: process.env.MONGODB_URL,
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    };
    return this.validateConfig(config);
  }

  get(): Config {
    return this.config;
  }
}

export const config = new Configuration();
