import { getAuth, signOut } from "firebase/auth";
import firebase from "../../../../src/firebaseConfig";
import { handleSignOutFromGoogle } from "../../../../src/modules/User-Authentication/application/signOutFromGoogle";
import { mockAuth } from "../../__mocks__/Auth/mockedAuthObject";

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("../../../../src/firebaseConfig", () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe("handleSignOutFromGoogle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getAuth as jest.MockedFunction<typeof getAuth>).mockReturnValue(mockAuth);
  });

  it("signs out the current Google session", async () => {
    (signOut as jest.MockedFunction<typeof signOut>).mockResolvedValue(undefined);

    await handleSignOutFromGoogle();

    expect(getAuth).toHaveBeenCalledWith(firebase);
    expect(signOut).toHaveBeenCalledWith(mockAuth);
  });

  it("logs and handles sign-out errors", async () => {
    const error = new Error("Sign-out failed");
    (signOut as jest.MockedFunction<typeof signOut>).mockRejectedValue(error);
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    await handleSignOutFromGoogle();

    expect(consoleErrorSpy).toHaveBeenCalledWith("Error al cerrar sesión", error);
    consoleErrorSpy.mockRestore();
  });
});
