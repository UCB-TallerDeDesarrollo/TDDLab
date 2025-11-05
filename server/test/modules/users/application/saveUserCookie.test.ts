import { saveUserCookie } from "../../../../src/modules/Users/Application/saveUserCookie";
import { Response } from "express";

describe("saveUserCookie", () => {
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockRes = {
      cookie: jest.fn(),
    };
  });

  it("Verificar que guarda la cookie userSession con las opciones correctas", async () => {
    const token = "fake.jwt.token";

    await saveUserCookie(token, mockRes as Response);

    expect(mockRes.cookie).toHaveBeenCalledWith(
      "userSession",
      token,
      {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 30,
      }
    );
  });
});
