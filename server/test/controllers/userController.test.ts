import { Request, Response } from "express";
import UserController from "../../src/controllers/users/userController";
import { UserRepository } from "../../src/modules/Users/Repositories/UserRepository";
import { getUser } from "../../src/modules/Users/Application/getUser";
import { decodeUserTokenFromCookie } from "../../src/modules/Users/Application/decodeUserTokenFromCookie";

jest.mock("../../src/modules/Users/Repositories/UserRepository");
jest.mock("../../src/modules/Users/Application/getUser", () => ({
  getUser: jest.fn(),
}));
jest.mock("../../src/modules/Users/Application/decodeUserTokenFromCookie", () => ({
  decodeUserTokenFromCookie: jest.fn(),
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
      const req = { params: { userId: "invalidId" } } as unknown as Request;
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
  });
});
