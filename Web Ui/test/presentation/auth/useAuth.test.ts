import { act, renderHook } from "@testing-library/react";
import { useAuth } from "../../../src/presentation/auth/hooks/useAuth";
import { handleAuthResult, handleSignInWithGoogle } from "../../../src/presentation/auth/services/authService";
import { mockUserCredential } from "../../modules/__mocks__/Auth/mockedUserCredential";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate }));
jest.mock("../../../src/modules/User-Authentication/domain/authStates", () => ({
  useGlobalState: () => [null],
}));
jest.mock("../../../src/presentation/auth/services/authService", () => ({
  handleSignInWithGoogle: jest.fn(),
  handleAuthResult: jest.fn(),
}));

describe("useAuth", () => {
  beforeEach(() => { jest.resetAllMocks(); });

  it("starts Google login immediately and completes the existing login flow", async () => {
    jest.mocked(handleSignInWithGoogle).mockResolvedValue(mockUserCredential.user);
    jest.mocked(handleAuthResult).mockImplementation(async ({ onSuccess }) => { onSuccess(); });
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const login = result.current.loginWithGoogle();
      expect(handleSignInWithGoogle).toHaveBeenCalledTimes(1);
      await login;
    });

    expect(handleAuthResult).toHaveBeenCalledWith({
      userData: mockUserCredential.user, onSuccess: expect.any(Function),
    });
    expect(mockNavigate).toHaveBeenCalledWith({ pathname: "/" });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("does not complete login when the popup falls back to redirect", async () => {
    jest.mocked(handleSignInWithGoogle).mockResolvedValue(null);
    const { result } = renderHook(() => useAuth());

    await act(async () => { await result.current.loginWithGoogle(); });

    expect(handleAuthResult).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it.each([
    [new Error("Popup cerrado"), "Popup cerrado"],
    [{ message: "Popup bloqueado" }, "Popup bloqueado"],
    [new Error(""), "Error al iniciar sesión"],
    [null, "Error al iniciar sesión"],
    ["unexpected", "Error al iniciar sesión"],
    [{ message: 42 }, "Error al iniciar sesión"],
    [new Error("Usuario no encontrado"), "Usuario no encontrado. Por favor, regístrate primero."],
    [{ message: "HTTP 404" }, "Usuario no encontrado. Por favor, regístrate primero."],
  ])("handles login rejection %p without leaving the button loading", async (error, expected) => {
    jest.mocked(handleSignInWithGoogle).mockRejectedValue(error);
    const { result } = renderHook(() => useAuth());

    await act(async () => { await result.current.loginWithGoogle(); });

    expect(result.current.error).toBe(expected);
    expect(result.current.loading).toBe(false);
    expect(handleAuthResult).not.toHaveBeenCalled();
  });
});
