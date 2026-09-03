import { Request, Response } from "express";
import UserController from "../../src/controllers/users/userController";
import { UserRepository } from "../../src/modules/Users/Repositories/UserRepository";
import { getUser } from "../../src/modules/Users/Application/getUser";
import { decodeUserTokenFromCookie } from "../../src/modules/Users/Application/decodeUserTokenFromCookie";

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

  describe("GitHub removal", () => {
    it("should not have getUserControllerGithub method on controller", () => {
      expect(controller).not.toHaveProperty("getUserControllerGithub");
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
