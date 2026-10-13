import express from "express";
import request from "supertest";
import userRoutes from "../../src/routes/userRoutes";

describe("user routes", () => {
  it("does not expose the removed GitHub login endpoint", async () => {
    const app = express();
    app.use(express.json());
    app.use("/api/user", userRoutes);

    const response = await request(app)
      .post("/api/user/github")
      .send({ idToken: "unused-token" });

    expect(response.status).toBe(404);
  });
});
