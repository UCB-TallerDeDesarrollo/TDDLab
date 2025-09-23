import { authenticateJWT } from "../../src/middleware/authMiddleware";
import { AuthenticateUser } from "../../src/modules/Users/Application/authenticateUser";

jest.mock("../../src/modules/Users/Application/authenticateUser");

describe("authenticateJWT middleware", () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = { cookies: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it("Verificar el token con token_valido", () => {
    mockReq.cookies.userSession = "token_valido";
    const mockDecoded = { userId: 123 };
    (AuthenticateUser.prototype.verifyToken as jest.Mock).mockReturnValue(
      mockDecoded
    );
    authenticateJWT(mockReq, mockRes, mockNext);
    expect(AuthenticateUser.prototype.verifyToken).toHaveBeenCalledWith(
      "token_valido"
    );
  });

  it("Verificar que el token es decifrado correctamente", () => {
    mockReq.cookies.userSession = "token_valido";
    const mockDecoded = { userId: 123 };
    (AuthenticateUser.prototype.verifyToken as jest.Mock).mockReturnValue(
      mockDecoded
    );
    authenticateJWT(mockReq, mockRes, mockNext);
    expect((mockReq).user).toEqual(mockDecoded);
  });

  it("Verificar que devuelve 200 cuando la autenticacion es exitosa", () => {
    mockReq.cookies.userSession = "token_valido";
    const mockDecoded = { userId: 123 };
    (AuthenticateUser.prototype.verifyToken as jest.Mock).mockReturnValue(
      mockDecoded
    );
    authenticateJWT(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it("Verificar que devuelve 401 cuando no se manda el token", () => {
    mockReq.cookies.userSession = undefined;
    authenticateJWT(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
  });

  it("Verificar que devuelve 403 cuando se envia token invalido", () => {
    mockReq.cookies.userSession = "token_invalido";
    (AuthenticateUser.prototype.verifyToken as jest.Mock).mockImplementation(
      () => {
        throw new Error("Token inválido");
      }
    );
    authenticateJWT(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(403);
  });
});
