import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { TerminusModule } from "@nestjs/terminus";
import { HealthCheckController } from "../../src/health-check/health-check.controller";

export async function createHealthCheckTestModule(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [TerminusModule],
    controllers: [HealthCheckController],
  }).compile();

  return moduleRef.createNestApplication();
}
