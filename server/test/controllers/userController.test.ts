import { Request, Response } from "express";
import UserController from "../../src/controllers/users/userController";
import { UserRepository } from "../../src/modules/Users/Repositories/UserRepository";
import { loginUserWithGoogle } from "../../src/modules/Users/Application/loginUserWithGoogle";
import { saveUserCookie } from "../../src/modules/Users/Application/saveUserCookie";
import { decodeUserTokenFromCookie } from "../../src/modules/Users/Application/decodeUserTokenFromCookie";
import { getUser } from "../../src/modules/Users/Application/getUser";

// Crear un mock de UserRepository
jest.mock("../../src/modules/Users/Repositories/UserRepository");
jest.mock("firebase-admin", () => ({
  initializeApp: jest.fn(),
  auth: jest.fn(),
}));
jest.mock("../../src/modules/Users/Application/getUser", () => ({
  getUser: jest.fn(),
}));
jest.mock("../../src/modules/Users/Application/decodeUserTokenFromCookie", () => ({
  decodeUserTokenFromCookie: jest.fn(),
}));
jest.mock("../../src/modules/Users/Application/loginUserWithGoogle", () => ({
  loginUserWithGoogle: jest.fn(),
}));
jest.mock("../../src/modules/Users/Application/getUserByemailUseCase", () => ({
  getUserByemail: jest.fn(),
}));
jest.mock("../../src/modules/Users/Application/saveUserCookie", () => ({
  saveUserCookie: jest.fn(),
}));

describe("UserController", () => {
  let controller: UserController;
  let userRepositoryMock: UserRepository;

  beforeEach(() => {
    userRepositoryMock = new UserRepository() as jest.Mocked<UserRepository>;
    controller = new UserController(userRepositoryMock);
  });

  describe("removeUserFromGroup", () => {
    it("debería devolver 400 si el userId no es válido", async () => {
      // Crear el mock de req con las propiedades necesarias
      const req = {
        params: { userId: "invalidId" }, // Solo lo que necesitas
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.removeUserFromGroup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Debes proporcionar un id de usuario valido:",
      });
    });

    it("debería devolver 200 si el usuario se elimina exitosamente", async () => {
      const req = {
        params: { userId: "1" },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      userRepositoryMock.removeUserFromGroup = jest
        .fn()
        .mockResolvedValue(undefined);

      await controller.removeUserFromGroup(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Usuario eliminado del grupo exitosamente.",
      });
    });
  });

  describe("getUserControllerGoogle", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;

    beforeEach(() => {
      jest.clearAllMocks();
      mockReq = { body: { idToken: "validGoogleToken" } };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it("returns 400 when the ID token is missing", async () => {
      mockReq.body = {};

      await controller.getUserControllerGoogle(
        mockReq as Request,
        mockRes as Response
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Debes proporcionar un token válido",
      });
    });

    it("returns the user and saves the session cookie on success", async () => {
      const user = { id: 1, role: "admin", groupid: 10 };
      (loginUserWithGoogle as jest.Mock).mockResolvedValue({
        user,
        jwtToken: "session-token",
      });

      await controller.getUserControllerGoogle(
        mockReq as Request,
        mockRes as Response
      );

      expect(loginUserWithGoogle).toHaveBeenCalledWith("validGoogleToken");
      expect(saveUserCookie).toHaveBeenCalledWith("session-token", mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(user);
    });

    it("returns 404 when the user is not registered", async () => {
      (loginUserWithGoogle as jest.Mock).mockRejectedValue(
        new Error("Usuario no encontrado")
      );

      await controller.getUserControllerGoogle(
        mockReq as Request,
        mockRes as Response
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Usuario no encontrado. Por favor, regístrate primero.",
      });
    });

    it("returns 401 when the Google token is invalid", async () => {
      (loginUserWithGoogle as jest.Mock).mockRejectedValue(
        new Error("Token inválido o expirado")
      );

      await controller.getUserControllerGoogle(
        mockReq as Request,
        mockRes as Response
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Token inválido o expirado",
      });
    });

    it("returns 500 for an unexpected login error", async () => {
      (loginUserWithGoogle as jest.Mock).mockRejectedValue(
        new Error("Unexpected error")
      );

      await controller.getUserControllerGoogle(
        mockReq as Request,
        mockRes as Response
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Error en el servidor" });
    });
  });

  describe("getMeController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    res = {
      status: statusMock,
      json: jsonMock,
      cookies: {},
    } as any;
  });


  it("Verificar que se devuelve 200 y el usuario si el token es valido", async () => {
    const fakePayload = { id: 1, role: "admin", groupid: 2 };
    const fakeUser = { id: 1, name: "Test User" };
    req = { cookies: { userSession: "validtoken" } };
    (decodeUserTokenFromCookie as jest.Mock).mockReturnValue(fakePayload);
    (getUser as jest.Mock).mockResolvedValue(fakeUser);
    await controller.getMeController(req as Request, res as Response);
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(fakeUser);
  });

  it("Verificar que devuelve 401 si no hay cookie", async () => {
    req = { cookies: {} };
    await controller.getMeController(req as Request, res as Response);
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: "Usuario no autenticado" });
  });

  it("Verificar que devuelve 404 si el usuario no se encuentra", async () => {
    const fakePayload = { id: 1, role: "admin", groupid: 2 };
    req = { cookies: { userSession: "validtoken" } };
    (decodeUserTokenFromCookie as jest.Mock).mockReturnValue(fakePayload);
    (getUser as jest.Mock).mockResolvedValue(null);
    await controller.getMeController(req as Request, res as Response);
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ error: "Usuario no encontrado" });
  });

   it("Verificar que devuelve 401 si ocurre un error", async () => {
    req = { cookies: { userSession: "invalidtoken" } };
    (decodeUserTokenFromCookie as jest.Mock).mockImplementation(() => {
      throw new Error("Token inválido");
    });
    await controller.getMeController(req as Request, res as Response);
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: "Token inválido o expirado" });
  });
});
});
