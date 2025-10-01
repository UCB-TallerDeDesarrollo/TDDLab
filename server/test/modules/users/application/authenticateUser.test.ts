import jwt from "jsonwebtoken";
import { AuthenticateUser } from "../../../../src/modules/Users/Application/authenticateUser";

jest.mock("jsonwebtoken");

describe("AuthenticateUser", () => {
  const secret = "mi_secreto";
  const authUser = new AuthenticateUser(secret);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Devolver el payload si el token es válido", () => {
    const mockPayload = { userId: 123 };
    (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

    const result = authUser.verifyToken("token_valido");

    expect(jwt.verify).toHaveBeenCalledWith("token_valido", secret);
    expect(result).toEqual(mockPayload);
  });

  it("Devolver error si el token es inválido", () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("invalid token");
    });

    expect(() => authUser.verifyToken("token_invalido")).toThrow("Token inválido");
    expect(jwt.verify).toHaveBeenCalledWith("token_invalido", secret);
  });

  it("Debe devolver null si jwt.verify no retorna nada", () => {
    (jwt.verify as jest.Mock).mockReturnValue(null);

    const result = authUser.verifyToken("token_vacio");

    expect(jwt.verify).toHaveBeenCalledWith("token_vacio", secret);
    expect(result).toBeNull();
  });
});
