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
});
