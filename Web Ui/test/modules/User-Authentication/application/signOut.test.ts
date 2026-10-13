import { signOut, getAuth } from "firebase/auth";
import { handleSignOut } from "../../../../src/modules/User-Authentication/application/signOut";
import { mockAuth } from "../../__mocks__/Auth/mockedAuthObject";

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("../../../../src/firebaseConfig", () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe("handleSignOut", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("signs out the current Firebase session", async () => {
    (getAuth as jest.MockedFunction<typeof getAuth>).mockReturnValue(mockAuth);
    (signOut as jest.MockedFunction<typeof signOut>).mockResolvedValue(undefined);

    await handleSignOut();

    expect(getAuth).toHaveBeenCalledTimes(1);
    expect(signOut).toHaveBeenCalledWith(mockAuth);
  });

  it("reports sign-out errors", async () => {
    const error = new Error("Sign-out error message");
    (getAuth as jest.MockedFunction<typeof getAuth>).mockReturnValue(mockAuth);
    (signOut as jest.MockedFunction<typeof signOut>).mockRejectedValue(error);
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    await handleSignOut();

    expect(consoleErrorSpy).toHaveBeenCalledWith("Error al cerrar sesión", error);
    consoleErrorSpy.mockRestore();
  });
});
