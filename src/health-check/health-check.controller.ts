import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  MongooseHealthIndicator,
} from "@nestjs/terminus";

@Controller("/health-check")
export class HealthCheckController {
  constructor(private health: HealthCheckService, private mongodb: MongooseHealthIndicator) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([() => this.mongodb.pingCheck("mongoose")]);
  }
}
