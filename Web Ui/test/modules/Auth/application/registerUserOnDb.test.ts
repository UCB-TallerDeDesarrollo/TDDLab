import { RegisterUserOnDb } from "../../../../src/modules/Auth/application/registerUserOnDb";
import UserOnDb from "../../../../src/modules/Auth/domain/userOnDb.interface";
import AuthRepository from "../../../../src/modules/Auth/repository/LoginRepository";

// Mock the AuthRepository
jest.mock("../../../../src/modules/Auth/repository/LoginRepository", () => {
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
      role: "student",
    };

    const mockRepository = new AuthRepository() as jest.Mocked<AuthRepository>;
    mockRepository.registerAccount.mockResolvedValue(undefined);

    const registerUser = new RegisterUserOnDb(mockRepository);
    await registerUser.register(mockUser);

    expect(mockRepository.registerAccount).toHaveBeenCalledTimes(1);
    expect(mockRepository.registerAccount).toHaveBeenCalledWith(mockUser);
  });
});
