import { RegisterUserOnDb } from "../../../../src/modules/User-Authentication/application/registerUserOnDb";
import { UserOnDb } from "../../../../src/modules/User-Authentication/domain/userOnDb.interface";
import AuthRepository from "../../../../src/modules/User-Authentication/repository/LoginRepository";

// Mock the AuthRepository
jest.mock(
  "../../../../src/modules/User-Authentication/repository/LoginRepository",
  () => {
    return jest.fn().mockImplementation(() => ({
      registerAccount: jest.fn(),
    }));
  }
);

describe("RegisterUserOnDb class", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register a user successfully", async () => {
    const mockUser: UserOnDb = {
      id: 1,
      email: "test@example.com",
      groupid: 2,
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
