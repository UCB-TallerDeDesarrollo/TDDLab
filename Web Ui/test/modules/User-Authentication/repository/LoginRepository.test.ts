import axios from "axios";
import AuthRepository from "../../../../src/modules/User-Authentication/repository/LoginRepository";
import { dbUserMock } from "../../__mocks__/Auth/userOnDbMock";
import dotenv from 'dotenv';
dotenv.config()

// Mocking Axios to avoid actual HTTP requests
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
    const user = await authRepo.getAccountInfo(validEmail);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(`${API_URL}/user/login`, {
      email: validEmail,
    });
    expect(user).toEqual(dbUserMock);
  });
  it("should throw an error because user doesnt exist", async () => {
    const invalidEmail = "test2@example.com";

    const response = { status: 404 };
    axios.post = jest.fn().mockResolvedValue(response);

    const authRepo = new AuthRepository();
    await expect(authRepo.getAccountInfo(invalidEmail)).rejects.toThrow(
      "Failed to get user Course"
    );
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(`${API_URL}/user/login`, {
      email: invalidEmail,
    });
  });

  it("should throw an error when getting account info fails", async () => {
    const invalidEmail = "invalid@example.com";
    const error = new Error("Failed to get user Course");
    axios.post = jest.fn().mockRejectedValue(error);

    const authRepo = new AuthRepository();

    await expect(authRepo.getAccountInfo(invalidEmail)).rejects.toThrow(error);
  });

  it("should register an account", async () => {
    axios.post = jest.fn().mockResolvedValue({ status: 200 });

    const authRepo = new AuthRepository();
    await authRepo.registerAccount(dbUserMock);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      `${API_URL}/user/register`,
      dbUserMock
    );
  });

  it("should throw an error when registration fails", async () => {
    const error = new Error("Error saving user");
    axios.post = jest.fn().mockRejectedValue(error);

    const authRepo = new AuthRepository();

    await expect(authRepo.registerAccount(dbUserMock)).rejects.toThrow(error);
  });
});
