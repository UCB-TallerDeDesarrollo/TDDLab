import {
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import {
  handleGoogleRedirectResult,
  handleSignInWithGoogle,
} from "../../../../src/modules/User-Authentication/application/signInWithGoogle";
import { mockUserCredential } from "../../__mocks__/Auth/mockedUserCredential";

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  getRedirectResult: jest.fn(),
  signInWithPopup: jest.fn(),
  signInWithRedirect: jest.fn(),
}));

jest.mock("../../../../src/firebaseConfig", () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

describe("handleSignInWithGoogle function", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should sign in with Google successfully and return user data", async () => {
    (
      signInWithPopup as jest.MockedFunction<typeof signInWithPopup>
    ).mockResolvedValue(mockUserCredential);

    const result = await handleSignInWithGoogle();

    expect(signInWithPopup).toHaveBeenCalledTimes(1);
    expect(signInWithRedirect).not.toHaveBeenCalled();
    expect(result).toEqual(mockUserCredential.user);
  });

  it("should fall back to redirect when the Google popup is blocked", async () => {
    (
      signInWithPopup as jest.MockedFunction<typeof signInWithPopup>
    ).mockRejectedValue({ code: "auth/popup-blocked" });
    (
      signInWithRedirect as jest.MockedFunction<typeof signInWithRedirect>
    ).mockImplementation(() => Promise.resolve(undefined as never));

    const result = await handleSignInWithGoogle();

    expect(signInWithPopup).toHaveBeenCalledTimes(1);
    expect(signInWithRedirect).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
  });

  it("should throw Google authentication errors that are not popup blocked", async () => {
    const error = new Error("Authentication error message");

    (
      signInWithPopup as jest.MockedFunction<typeof signInWithPopup>
    ).mockRejectedValue(error);

    await expect(handleSignInWithGoogle()).rejects.toThrow(error.message);

    expect(signInWithPopup).toHaveBeenCalledTimes(1);
    expect(signInWithRedirect).not.toHaveBeenCalled();
  });
});

describe("handleGoogleRedirectResult function", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return the redirected Google user when Firebase has a result", async () => {
    (
      getRedirectResult as jest.MockedFunction<typeof getRedirectResult>
    ).mockResolvedValue(mockUserCredential);

    const result = await handleGoogleRedirectResult();

    expect(getRedirectResult).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockUserCredential.user);
  });

  it("should return null when Firebase has no redirect result", async () => {
    (
      getRedirectResult as jest.MockedFunction<typeof getRedirectResult>
    ).mockResolvedValue(null);

    const result = await handleGoogleRedirectResult();

    expect(getRedirectResult).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
  });
});
