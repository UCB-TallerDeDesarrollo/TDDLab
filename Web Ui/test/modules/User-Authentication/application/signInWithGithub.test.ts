import { signInWithPopup } from "firebase/auth";
import { handleSignInWithGitHub } from "../../../../src/modules/User-Authentication/application/signInWithGithub";
import { mockUserCredential } from "../../__mocks__/Auth/mockedUserCredential";

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  OAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
}));

jest.mock("../../../../src/firebaseConfig", () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

describe("handleSignInWithGitHub function", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should sign in with GitHub successfully and return user data", async () => {
    (
      signInWithPopup as jest.MockedFunction<typeof signInWithPopup>
    ).mockResolvedValue(mockUserCredential);

    const result = await handleSignInWithGitHub();

    expect(signInWithPopup).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockUserCredential.user);
  });

  it("should handle authentication error from GitHub", async () => {
    const errorMessage = "Authentication error message";

    (
      signInWithPopup as jest.MockedFunction<typeof signInWithPopup>
    ).mockRejectedValue(new Error(errorMessage));

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    await handleSignInWithGitHub();

    expect(signInWithPopup).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error de autenticación con GitHub",
      expect.any(Error)
    );
    expect(consoleErrorSpy.mock.calls[0][1].message).toEqual(errorMessage);

    consoleErrorSpy.mockRestore();
  });
});
