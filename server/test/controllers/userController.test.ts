import express, { Request, Response } from "express";
import UserController from "../../src/controllers/users/userController";
import { UserRepository } from "../../src/modules/Users/Repositories/UserRepository";
import { decodeUserTokenFromCookie } from "../../src/modules/Users/Application/decodeUserTokenFromCookie";
import { getUser } from "../../src/modules/Users/Application/getUser";

import request from "supertest";
import userRoutes from "../../src/routes/userRoutes";
import { loginUserWithGoogle } from "../../src/modules/Users/Application/loginUserWithGoogle";
import { registerUserWithGoogle } from "../../src/modules/Users/Application/registerUserWithGoogle";

jest.mock("../../src/modules/Users/Application/loginUserWithGoogle");
jest.mock("../../src/modules/Users/Application/registerUserWithGoogle");

// Crear un mock de UserRepository
jest.mock("../../src/modules/Users/Repositories/UserRepository");
jest.mock("../../src/modules/Users/Application/getUser", () => ({
  getUser: jest.fn(),
}));
jest.mock("../../src/modules/Users/Application/decodeUserTokenFromCookie", () => ({
  decodeUserTokenFromCookie: jest.fn(),
}));
jest.mock("../../src/modules/Users/Application/getUserByemailUseCase", () => ({
  getUserByemail: jest.fn(),
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

// Pruebas agregadas para la HU-10: eliminar el acceso con GitHub.
const app = express();
app.use(express.json());
app.use("/user", userRoutes);

describe("HU-10: rutas de autenticacion", () => {
  beforeEach(() => jest.clearAllMocks());

  it("POST /user/github ya no existe", async () => {
    await request(app).post("/user/github").send({ idToken: "qa-token" }).expect(404);
    expect(loginUserWithGoogle).not.toHaveBeenCalled();
  });

  it("POST /user/google conserva la validacion de token obligatorio", async () => {
    await request(app).post("/user/google").send({}).expect(400);
    expect(loginUserWithGoogle).not.toHaveBeenCalled();
  });

  it("POST /user/google devuelve el usuario y establece la cookie de sesion", async () => {
    const user = { id: 7, email: "qa@example.com", role: "student", groupid: 90 };
    (loginUserWithGoogle as jest.Mock).mockResolvedValue({ user, jwtToken: "qa-session" });
    const response = await request(app).post("/user/google").send({ idToken: "qa-token" }).expect(200);
    expect(loginUserWithGoogle).toHaveBeenCalledWith("qa-token");
    expect(response.body).toEqual(user);
    expect(response.headers["set-cookie"]).toEqual(expect.arrayContaining([
      expect.stringContaining("userSession=qa-session"),
    ]));
  });

  it("POST /user/google conserva el rechazo de usuarios no registrados", async () => {
    (loginUserWithGoogle as jest.Mock).mockRejectedValue(new Error("Usuario no encontrado"));
    await request(app).post("/user/google").send({ idToken: "qa-token" }).expect(404);
  });

  it("POST /user/register/google conserva el registro por token, grupo y rol", async () => {
    (registerUserWithGoogle as jest.Mock).mockResolvedValue(undefined);
    await request(app).post("/user/register/google")
      .send({ idToken: "qa-token", groupid: 90, role: "student" }).expect(201);
    expect(registerUserWithGoogle).toHaveBeenCalledWith("qa-token", 90, "student");
  });

  it("POST /user/register/google rechaza datos incompletos", async () => {
    await request(app).post("/user/register/google").send({ role: "student" }).expect(400);
    expect(registerUserWithGoogle).not.toHaveBeenCalled();
  });

  it.each(["/me", "/users"])("GET /user%s sigue protegido sin sesion", async (path) => {
    await request(app).get(`/user${path}`).expect(401);
  });

  it("POST /user/logout sigue protegido sin sesion", async () => {
    await request(app).post("/user/logout").expect(401);
  });
});
