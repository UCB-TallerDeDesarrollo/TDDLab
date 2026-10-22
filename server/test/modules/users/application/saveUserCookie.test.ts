import { saveUserCookie } from "../../../../src/modules/Users/Application/saveUserCookie";
import { Response } from "express";

describe("saveUserCookie", () => {
  let mockRes: Partial<Response>;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    mockRes = {
      cookie: jest.fn(),
    };
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("guarda una cookie compatible con HTTP durante el desarrollo local", async () => {
    process.env.NODE_ENV = "development";
    const token = "fake.jwt.token";

    await saveUserCookie(token, mockRes as Response);

    expect(mockRes.cookie).toHaveBeenCalledWith(
      "userSession",
      token,
      {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 30,
      }
    );
  });

  it("mantiene la cookie cross-site segura en producción", async () => {
    process.env.NODE_ENV = "production";
    const token = "fake.jwt.token";

    await saveUserCookie(token, mockRes as Response);

    expect(mockRes.cookie).toHaveBeenCalledWith("userSession", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
  });
});
