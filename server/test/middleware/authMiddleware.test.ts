import { authenticateJWT } from "../../src/middleware/authMiddleware";
import { AuthenticateUser } from "../../src/modules/Users/Application/authenticateUser";

jest.mock("../../src/modules/Users/Application/authenticateUser");

describe("authenticateJWT middleware", () => {
  let mockReq: any;


  beforeEach(() => {
    mockReq = { cookies: {} };
    jest.clearAllMocks();
  });

  it("Verificar el token con token_valido", () => {
    mockReq.cookies.userSession = "token_valido";
    const mockDecoded = { userId: 123 };
    (AuthenticateUser.prototype.verifyToken as jest.Mock).mockReturnValue(mockDecoded);
    authenticateJWT(mockReq);
    expect(AuthenticateUser.prototype.verifyToken).toHaveBeenCalledWith("token_valido");
  });
});