import UserController from "../../../../src/controllers/users/userController";
import * as getUserByEmailModule from "../../../../src/modules/Users/Application/getUserByemailUseCase";
import { UserRepository } from "../../../../src/modules/Users/Repositories/UserRepository";

describe("UserController - getUserController", () => {
  let userController: UserController;
  let mockRes: any;

  beforeEach(() => {
    userController = new UserController(new UserRepository());
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("Debe devolver 400 si no se pasa email", async () => {
    const mockReq = { body: {} };

    await userController.getUserController(mockReq as any, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Debes proporcionar un email valido:",
    });
  });

  it("Debe devolver 404 si el usuario no existe", async () => {
    const mockReq = { body: { email: "no@existe.com" } };
    jest.spyOn(getUserByEmailModule, "getUserByemail").mockResolvedValue(null);

    await userController.getUserController(mockReq as any, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Usuario no encontrado",
    });
  });

 it("Debe devolver 200 si el usuario existe", async () => {
  const mockReq = { body: { email: "si@existe.com" } };
  const fakeUser = { 
    id: 1, 
    email: "si@existe.com", 
    groupid: [1], 
    role: "admin",
    firstName: "Test",
    lastName: "User"
  };

  jest.spyOn(getUserByEmailModule, "getUserByemail").mockResolvedValue(fakeUser);

  await userController.getUserController(mockReq as any, mockRes);

  expect(mockRes.status).toHaveBeenCalledWith(200);
  expect(mockRes.json).toHaveBeenCalledWith(fakeUser);
});

});
