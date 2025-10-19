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
    
    (GoogleAuthProvider as unknown as jest.Mock).mockImplementation(() => ({}));
    (getAuth as jest.Mock).mockReturnValue({});
    (signInWithPopup as jest.Mock).mockResolvedValue(mockResult);

    const result = await handleSignInWithGoogle();

    expect(GoogleAuthProvider).toHaveBeenCalled();
    expect(getAuth).toHaveBeenCalledWith(firebase);
    expect(signInWithPopup).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
  });

  it("should handle authentication error", async () => {
    const mockError = new Error("Authentication failed");
    
    (GoogleAuthProvider as unknown as jest.Mock).mockImplementation(() => ({}));
    (getAuth as jest.Mock).mockReturnValue({});
    (signInWithPopup as jest.Mock).mockRejectedValue(mockError);

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    const result = await handleSignInWithGoogle();

    expect(consoleSpy).toHaveBeenCalledWith("Error de autenticación con Google", mockError);
    expect(result).toBeUndefined();
    
    consoleSpy.mockRestore();
  });
});
