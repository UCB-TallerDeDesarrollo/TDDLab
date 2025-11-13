import { signInWithPopup, getAuth, GithubAuthProvider } from "firebase/auth";
import { handleSignInWithGitHub } from "../../../../src/modules/User-Authentication/application/signInWithGithub";
import { mockUserCredential } from "../../__mocks__/Auth/mockedUserCredential";

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  GithubAuthProvider: jest.fn(),
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should sign in with GitHub successfully and return user data", async () => {
    const mockProvider = {
      addScope: jest.fn(),
    };
    
    (GithubAuthProvider as unknown as jest.Mock).mockImplementation(() => mockProvider);
    (getAuth as jest.Mock).mockReturnValue({ currentUser: null });
    (
      signInWithPopup as jest.MockedFunction<typeof signInWithPopup>
    ).mockResolvedValue(mockUserCredential);

    const result = await handleSignInWithGitHub();

    expect(GithubAuthProvider).toHaveBeenCalled();
    expect(mockProvider.addScope).toHaveBeenCalledWith("user:email");
    expect(signInWithPopup).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockUserCredential.user);
  });

  it("should handle authentication error from GitHub", async () => {
    const errorMessage = "Authentication error message";
    const mockProvider = {
      addScope: jest.fn(),
    };
    
    (GithubAuthProvider as unknown as jest.Mock).mockImplementation(() => mockProvider);
    (getAuth as jest.Mock).mockReturnValue({ currentUser: null });
    (
      signInWithPopup as jest.MockedFunction<typeof signInWithPopup>
    ).mockRejectedValue(new Error(errorMessage));

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const result = await handleSignInWithGitHub();

    expect(signInWithPopup).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error de autenticación con GitHub",
      expect.any(Error)
    );
    expect(consoleErrorSpy.mock.calls[0][1].message).toEqual(errorMessage);
    expect(result).toBeNull();

    consoleErrorSpy.mockRestore();
  });

  it("should return null if user has active session with Google", async () => {
    const mockProvider = {
      addScope: jest.fn(),
    };
    
    const mockCurrentUser = {
      providerData: [
        { providerId: "google.com" }
      ]
    };
    
    (GithubAuthProvider as unknown as jest.Mock).mockImplementation(() => mockProvider);
    (getAuth as jest.Mock).mockReturnValue({ currentUser: mockCurrentUser });
    
    const alertSpy = jest.spyOn(window, "alert").mockImplementation();

    const result = await handleSignInWithGitHub();

    expect(alertSpy).toHaveBeenCalledWith("Ya tienes una sesión activa con Google. Debes iniciar sesión con Google.");
    expect(result).toBeNull();
    expect(signInWithPopup).not.toHaveBeenCalled();
    
    alertSpy.mockRestore();
  });

  it("should handle account-exists-with-different-credential error", async () => {
    const mockProvider = {
      addScope: jest.fn(),
    };
    
    const mockError = {
      code: "auth/account-exists-with-different-credential",
      customData: { email: "test@example.com" }
    };
    
    (GithubAuthProvider as unknown as jest.Mock).mockImplementation(() => mockProvider);
    (getAuth as jest.Mock).mockReturnValue({ currentUser: null });
    (
      signInWithPopup as jest.MockedFunction<typeof signInWithPopup>
    ).mockRejectedValue(mockError);

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    const alertSpy = jest.spyOn(window, "alert").mockImplementation();

    const result = await handleSignInWithGitHub();

    expect(consoleErrorSpy).toHaveBeenCalledWith("Error de autenticación con GitHub", mockError);
    expect(alertSpy).toHaveBeenCalledWith("Esta cuenta ya está registrada con Google. Debes iniciar sesión con Google.");
    expect(result).toBeNull();

    consoleErrorSpy.mockRestore();
    alertSpy.mockRestore();
  });
});
