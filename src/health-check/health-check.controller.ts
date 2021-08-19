import { Controller, Get } from "@nestjs/common";
import { HealthCheck, HealthCheckResult, HealthCheckService } from "@nestjs/terminus";
import { healthCheck as cacheHealthCheck } from "../lib/cache";
import { healthCheck as databaseHealthCheck } from "../lib/database";

@Controller("/health-check")
export class HealthCheckController {
  constructor(private health: HealthCheckService) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([databaseHealthCheck, cacheHealthCheck]);
  }
}
