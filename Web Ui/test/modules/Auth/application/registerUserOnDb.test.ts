import { RegisterUserOnDb } from "../../../../src/modules/Users-Authentication/application/registerUserOnDb";
import UserOnDb from "../../../../src/modules/Users-Authentication/domain/userOnDb.interface";
import AuthRepository from "../../../../src/modules/Users-Authentication/repository/LoginRepository";

// Mock the AuthRepository
jest.mock("../../../../src/modules/Users-Authentication/repository/LoginRepository", () => {
  return jest.fn().mockImplementation(() => ({
    registerAccount: jest.fn(),
  }));
});

describe("RegisterUserOnDb class", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register a user successfully", async () => {
    const mockUser: UserOnDb = {
      email: "test@example.com",
      course: "2",
    };

    const mockRepository = new AuthRepository() as jest.Mocked<AuthRepository>;
    mockRepository.registerAccount.mockResolvedValue(undefined);

    const registerUser = new RegisterUserOnDb(mockRepository);
    await registerUser.register(mockUser);

    expect(mockRepository.registerAccount).toHaveBeenCalledTimes(1);
    expect(mockRepository.registerAccount).toHaveBeenCalledWith(mockUser);
  });
});
