import { signOut, getAuth } from "firebase/auth";
import { handleSignOut } from "../../../../src/modules/User-Authentication/application/signOut";
import { mockAuth } from "../../__mocks__/Auth/mockedAuthObject";

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("../../../../src/firebaseConfig", () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

describe("handleSignOut function", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should sign out successfully", async () => {
    (getAuth as jest.MockedFunction<typeof getAuth>).mockReturnValue(mockAuth);

    (signOut as jest.MockedFunction<typeof signOut>).mockResolvedValue(
      undefined,
    );

    await handleSignOut();

    expect(getAuth).toHaveBeenCalledTimes(1);
    expect(signOut).toHaveBeenCalledWith(mockAuth);
  });

  it("should handle sign-out error", async () => {
    const errorMessage = "Sign-out error message";
    (getAuth as jest.MockedFunction<typeof getAuth>).mockReturnValue(mockAuth);

    (signOut as jest.MockedFunction<typeof signOut>).mockRejectedValue(
      new Error(errorMessage),
    );
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    await handleSignOut();

    expect(getAuth).toHaveBeenCalledTimes(1);
    expect(signOut).toHaveBeenCalledWith(mockAuth);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error al cerrar sesión",
      expect.any(Error),
    );
    expect(consoleErrorSpy.mock.calls[0][1].message).toEqual(errorMessage);

    consoleErrorSpy.mockRestore();
  });
});
