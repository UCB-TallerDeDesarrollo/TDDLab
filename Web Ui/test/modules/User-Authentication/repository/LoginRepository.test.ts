import axios from "axios";
import AuthRepository from "../../../../src/modules/User-Authentication/repository/LoginRepository";
import { dbUserMock } from "../../__mocks__/Auth/userOnDbMock";
import { OAuthProvider } from "../../../../src/modules/User-Authentication/domain/AuthManager";
import dotenv from "dotenv";

dotenv.config();

const API_URL = process.env.VITE_API_URL;

jest.mock("axios");

describe("AuthRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should get account info for a valid email", async () => {
    const validEmail = "test@example.com";
    const response = { status: 200, data: dbUserMock };
    axios.post = jest.fn().mockResolvedValue(response);

    const authRepo = new AuthRepository();
    const user = await authRepo.getAccountInfoByEmail(validEmail);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      `${API_URL}/user/login`,
      { email: validEmail },
      { withCredentials: true }
    );
    expect(user).toEqual(dbUserMock);
  });

  it("should throw an error when getting account info fails", async () => {
    const invalidEmail = "invalid@example.com";
    const error = new Error("Error al obtener la cuenta por email");
    axios.post = jest.fn().mockRejectedValue(error);

    const authRepo = new AuthRepository();

    await expect(authRepo.getAccountInfoByEmail(invalidEmail)).rejects.toThrow(
      "Error al obtener la cuenta por email"
    );
  });

  it("should register an account with token", async () => {
    axios.post = jest.fn().mockResolvedValue({ data: dbUserMock });

    const authRepo = new AuthRepository();
    const dto = {
      idToken: "mock-token",
      groupid: 1,
      role: "student",
    };

    const result = await authRepo.registerAccountWithToken(dto, OAuthProvider.Google);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      `${API_URL}/user/register/google`,
      {
        idToken: dto.idToken,
        groupid: dto.groupid,
        role: dto.role,
      },
      { withCredentials: true }
    );
    expect(result).toEqual(dbUserMock);
  });
});
