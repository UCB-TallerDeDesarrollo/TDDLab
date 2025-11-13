import { handleSignInWithGoogle } from "../../../../src/modules/User-Authentication/application/signInWithGoogle";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import firebase from "../../../../src/firebaseConfig";

// Mock Firebase
jest.mock("firebase/auth", () => ({
  GoogleAuthProvider: jest.fn(),
  getAuth: jest.fn(),
  signInWithPopup: jest.fn(),
}));

jest.mock("../../../../src/firebaseConfig", () => ({}));

describe("handleSignInWithGoogle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully sign in with Google", async () => {
    const mockUser = { email: "test@google.com", displayName: "Test User" };
    const mockResult = { user: mockUser };
    
    const mockProvider = {
      addScope: jest.fn(),
    };
    
    (GoogleAuthProvider as unknown as jest.Mock).mockImplementation(() => mockProvider);
    (getAuth as jest.Mock).mockReturnValue({ currentUser: null });
    (signInWithPopup as jest.Mock).mockResolvedValue(mockResult);

    const result = await handleSignInWithGoogle();

    expect(GoogleAuthProvider).toHaveBeenCalled();
    expect(getAuth).toHaveBeenCalledWith(firebase);
    expect(mockProvider.addScope).toHaveBeenCalledWith("email");
    expect(signInWithPopup).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
  });

  it("should handle authentication error", async () => {
    const mockError = new Error("Authentication failed");
    
    const mockProvider = {
      addScope: jest.fn(),
    };
    
    (GoogleAuthProvider as unknown as jest.Mock).mockImplementation(() => mockProvider);
    (getAuth as jest.Mock).mockReturnValue({ currentUser: null });
    (signInWithPopup as jest.Mock).mockRejectedValue(mockError);

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    const result = await handleSignInWithGoogle();

    expect(consoleSpy).toHaveBeenCalledWith("Error de autenticación con Google", mockError);
    expect(result).toBeNull();
    
    consoleSpy.mockRestore();
  });

  it("should return null if user has active session with GitHub", async () => {
    const mockProvider = {
      addScope: jest.fn(),
    };
    
    const mockCurrentUser = {
      providerData: [
        { providerId: "github.com" }
      ]
    };
    
    (GoogleAuthProvider as unknown as jest.Mock).mockImplementation(() => mockProvider);
    (getAuth as jest.Mock).mockReturnValue({ currentUser: mockCurrentUser });
    
    const alertSpy = jest.spyOn(window, "alert").mockImplementation();

    const result = await handleSignInWithGoogle();

    expect(alertSpy).toHaveBeenCalledWith("Ya tienes una sesión activa con GitHub. Debes iniciar sesión con GitHub.");
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
    
    (GoogleAuthProvider as unknown as jest.Mock).mockImplementation(() => mockProvider);
    (getAuth as jest.Mock).mockReturnValue({ currentUser: null });
    (signInWithPopup as jest.Mock).mockRejectedValue(mockError);

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    const alertSpy = jest.spyOn(window, "alert").mockImplementation();

    const result = await handleSignInWithGoogle();

    expect(consoleSpy).toHaveBeenCalledWith("Error de autenticación con Google", mockError);
    expect(alertSpy).toHaveBeenCalledWith("Esta cuenta ya está registrada con GitHub. Debes iniciar sesión con GitHub.");
    expect(result).toBeNull();
    
    consoleSpy.mockRestore();
    alertSpy.mockRestore();
  });
});
