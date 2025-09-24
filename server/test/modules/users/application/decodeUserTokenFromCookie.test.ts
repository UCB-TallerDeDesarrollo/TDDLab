import { decodeUserTokenFromCookie } from "../../../../src/modules/Users/Application/decodeUserTokenFromCookie";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");

describe("decodeUserTokenFromCookie", () => {
  const fakePayload = { id: 1, role: "admin", groupid: 2 };
  
  it("Verificar que devuelve el payload si el token es valido", async () => {
    (jwt.verify as jest.Mock).mockReturnValue(fakePayload);
    const result = await decodeUserTokenFromCookie("validtoken");
    expect(result).toEqual(fakePayload);
    expect(jwt.verify).toHaveBeenCalledWith("validtoken", process.env.JWT_SECRET);
  });
});
