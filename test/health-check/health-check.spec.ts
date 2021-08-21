import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { expect } from "chai";

import { createHealthCheckTestModule } from "./helper";

describe("health check endpoint", () => {
  let app: INestApplication;

  before(async () => {
    app = await createHealthCheckTestModule();
    await app.init();
  });

  it("should return ok for health check", async () => {
    await request(app.getHttpServer())
      .get("/health-check")
      .expect(200)
      .then((response) => {
        expect(response.body).to.deep.equal({
          details: {
            mongodb: {
              status: "up",
            },
            redis: {
              status: "up",
            },
          },
          error: {},
          info: {
            mongodb: {
              status: "up",
            },
            redis: {
              status: "up",
            },
          },
          status: "ok",
        });
      });
  });
});
