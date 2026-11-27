import request from "supertest";
import { createTDDCyclesDependencies } from "../../src/modules/TDDCycles/Repositories/createTDDCyclesDependencies";

jest.mock("../../src/config/server", () => ({ __esModule: true, default: jest.fn() }));

describe("Integración de registro en la aplicación", () => {
  afterEach(() => {
    jest.resetModules();
  });

  it("la fábrica comparte la misma instancia falsa entre lectura y registro", () => {
    const dependencies = createTDDCyclesDependencies();
    expect(dependencies.registrationRepository).toBe(dependencies.dbJobsRepository);
  });

  it("la fábrica real comparte el adaptador PostgreSQL entre lectura y registro", () => {
    const dependencies = createTDDCyclesDependencies();
    expect(dependencies.registrationRepository).toBe(dependencies.dbJobsRepository);
  });

  it("la aplicación en modo real devuelve un error controlado si PostgreSQL no está disponible", async () => {
    const app = (require("../../src/app") as typeof import("../../src/app")).default;
    const response = await request(app).post("/api/TDDCycles/jobs").send({ sha: "abc123", owner: "demo", reponame: "tests", conclusion: "success" });
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Internal server error" });
  }, 30000);

  it("la aplicación real monta el POST, comparte el falso y maneja JSON malformado", async () => {
    const app = (require("../../src/app") as typeof import("../../src/app")).default;
    const malformed = await request(app).post("/api/TDDCycles/jobs").set("Content-Type", "application/json").send('{"sha":');
    expect(malformed.status).toBe(400);
    expect(malformed.body).toEqual({ error: "Invalid JSON", field: "body" });
    const other = await request(app).post("/api/user/other").set("Content-Type", "application/json").send('{"sha":');
    expect(other.status).toBe(400);
    expect(other.type).not.toBe("application/json");
  }, 30000);
});
