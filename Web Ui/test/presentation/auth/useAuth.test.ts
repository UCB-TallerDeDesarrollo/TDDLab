import { act, renderHook } from "@testing-library/react";
import { useAuth } from "../../../src/presentation/auth/hooks/useAuth";
import { handleSignInWithGoogle } from "../../../src/presentation/auth/services/authService";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../../src/modules/User-Authentication/domain/authStates", () => ({
  useGlobalState: () => [{ userEmail: "" }],
}));

jest.mock("../../../src/presentation/auth/services/authService", () => ({
  handleSignInWithGoogle: jest.fn(),
  handleAuthResult: jest.fn(),
}));

const mockedSignInWithGoogle = handleSignInWithGoogle as jest.MockedFunction<
  typeof handleSignInWithGoogle
>;

describe("useAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not suggest GitHub when Google login detects a different auth provider", async () => {
    mockedSignInWithGoogle.mockRejectedValue(new Error("GitHub provider mismatch"));
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.loginWithGoogle();
    });

    expect(result.current.error).toBe(
      "Este usuario está registrado con otro método de acceso.",
    );
    expect(result.current.error).not.toMatch(/github/i);
  });
});
