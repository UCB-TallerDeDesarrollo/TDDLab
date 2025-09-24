import { Request, Response } from "express";
import UserController from "../../src/controllers/users/userController";
import { UserRepository } from "../../src/modules/Users/Repositories/UserRepository";
import admin from "firebase-admin";
// Crear un mock de UserRepository
jest.mock("../../src/modules/Users/Repositories/UserRepository");
jest.mock("firebase-admin", () => ({
  initializeApp: jest.fn(),
  auth: jest.fn(),
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
import { getUserByemail } from "../../src/modules/Users/Application/getUserByemailUseCase";
import { getUserToken } from "../../src/modules/Users/Application/getUserToken";
import { saveUserCookie } from "../../src/modules/Users/Application/saveUserCookie";

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
  });
});
