import { Request, Response } from "express";
import UserController from "../../src/controllers/users/userController";
import { UserRepository } from "../../src/modules/Users/Repositories/UserRepository";
import admin from "firebase-admin";
import { getUserByemail } from "../../src/modules/Users/Application/getUserByemailUseCase";
import { getUserToken } from "../../src/modules/Users/Application/getUserToken";
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
jest.mock("../../src/modules/Users/Application/getUserToken", () => ({
  getUserToken: jest.fn(),
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

  describe("getUserControllerGithub", () => {
    let mockReq: any;
    let controller: UserController;
    let userRepositoryMock: UserRepository;
    let mockRes: any;

    beforeEach(() => {
      mockReq = { body: { idToken: "validToken" } };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      jest.clearAllMocks();
      userRepositoryMock = new UserRepository() as jest.Mocked<UserRepository>;
      controller = new UserController(userRepositoryMock);
    });

    it("Verificar el token con firebase", async () => {
      const fakeDecoded = { email: "test@example.com" };
      const verifyIdTokenMock = jest.fn().mockResolvedValue(fakeDecoded);
      (admin.auth as jest.Mock).mockReturnValue({
        verifyIdToken: verifyIdTokenMock,
      });
      await controller.getUserControllerGithub(mockReq, mockRes);
      expect(verifyIdTokenMock).toHaveBeenCalledWith("validToken");
    });

    it("Verificar que devuelve el usuario cuando el token es valido", async () => {
      const fakeDecoded = { email: "test@example.com" };
      const fakeUser = { id: 1, role: "admin", groupid: 10 };
      const verifyIdTokenMock = jest.fn().mockResolvedValue(fakeDecoded);
      (admin.auth as jest.Mock).mockReturnValue({
        verifyIdToken: verifyIdTokenMock,
      });
      (getUserByemail as jest.Mock).mockResolvedValue(fakeUser);
      await controller.getUserControllerGithub(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(fakeUser);
    });

    it("Verificar que devuelve error si no se obtiene email del token", async () => {
      const fakeDecoded = {};
      const verifyIdTokenMock = jest.fn().mockResolvedValue(fakeDecoded);
      (admin.auth as jest.Mock).mockReturnValue({
        verifyIdToken: verifyIdTokenMock,
      });
      await controller.getUserControllerGithub(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "No se pudo obtener email de Firebase",
      });
    });

    it("Verificar que se obtiene el token generado del usuario", async () => {
      const fakeDecoded = { email: "test@example.com" };
      const fakeUser = { id: 1, role: "admin", groupid: 10 };
      const verifyIdTokenMock = jest.fn().mockResolvedValue(fakeDecoded);
      (admin.auth as jest.Mock).mockReturnValue({
        verifyIdToken: verifyIdTokenMock,
      });
      (getUserByemail as jest.Mock).mockResolvedValue(fakeUser);
      (getUserToken as jest.Mock).mockResolvedValue("fake.jwt.token");
      await controller.getUserControllerGithub(mockReq, mockRes);
      expect(getUserToken).toHaveBeenCalledWith(fakeUser);
    });

    it("Verificar que se guarda la cookie correctamente", async () => {
    const fakeDecoded = { email: "test@example.com" };
    const fakeUser = { id: 1, role: "admin", groupid: 10 };
    const fakeToken = "fake.jwt.token";
    const verifyIdTokenMock = jest.fn().mockResolvedValue(fakeDecoded);
    (admin.auth as jest.Mock).mockReturnValue({
      verifyIdToken: verifyIdTokenMock,
    });
    (getUserByemail as jest.Mock).mockResolvedValue(fakeUser);
    (getUserToken as jest.Mock).mockResolvedValue(fakeToken);
    await controller.getUserControllerGithub(mockReq, mockRes);
    expect(saveUserCookie).toHaveBeenCalledWith(fakeToken, mockRes);
  });

  it("Verificar que devuelve 401 en caso de error", async () => {
    const verifyIdTokenMock = jest.fn().mockRejectedValue(new Error("invalid"));
    (admin.auth as jest.Mock).mockReturnValue({
      verifyIdToken: verifyIdTokenMock,
    });
    await controller.getUserControllerGithub(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Token inválido o expirado",
    });
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
