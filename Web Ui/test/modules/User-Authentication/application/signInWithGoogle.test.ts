import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import firebase from "../../../../src/firebaseConfig";
import { handleSignInWithGoogle } from "../../../../src/modules/User-Authentication/application/signInWithGoogle";
import { mockAuth } from "../../__mocks__/Auth/mockedAuthObject";
import { mockUserCredential } from "../../__mocks__/Auth/mockedUserCredential";

jest.mock("firebase/auth", () => ({
  GoogleAuthProvider: jest.fn(),
  getAuth: jest.fn(),
  signInWithPopup: jest.fn(),
}));

jest.mock("../../../../src/firebaseConfig", () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe("handleSignInWithGoogle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getAuth as jest.Mock).mockReturnValue(mockAuth);
  });

  it("returns the signed-in Google user", async () => {
    (signInWithPopup as jest.MockedFunction<typeof signInWithPopup>).mockResolvedValue(
      mockUserCredential
    );

    const user = await handleSignInWithGoogle();

    expect(GoogleAuthProvider).toHaveBeenCalledTimes(1);
    expect(getAuth).toHaveBeenCalledWith(firebase);
    expect(signInWithPopup).toHaveBeenCalledWith(
      mockAuth,
      expect.any(GoogleAuthProvider)
    );
    expect(user).toEqual(mockUserCredential.user);
  });

  it("propagates popup authentication errors", async () => {
    (signInWithPopup as jest.MockedFunction<typeof signInWithPopup>).mockRejectedValue(
      new Error("Google sign-in failed")
    );

    await expect(handleSignInWithGoogle()).rejects.toThrow("Google sign-in failed");
  });
});
