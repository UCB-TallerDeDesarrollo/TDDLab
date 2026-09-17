import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AuthPage from "../../../src/presentation/auth/pages/AuthPage";
import { useAuth } from "../../../src/presentation/auth/hooks/useAuth";
import { User } from "firebase/auth";
import { handleSignInWithGoogle } from "../../../src/modules/User-Authentication/application/signInWithGoogle";
import { CheckIfUserHasAccount } from "../../../src/modules/User-Authentication/application/checkIfUserHasAccount";
import { setGlobalState } from "../../../src/modules/User-Authentication/domain/authStates";

jest.mock("../../../src/presentation/auth/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate }));
jest.mock("../../../src/modules/User-Authentication/application/signInWithGoogle");
jest.mock("../../../src/modules/User-Authentication/application/checkIfUserHasAccount");
jest.mock("../../../src/modules/User-Authentication/domain/authStates", () => ({
  useGlobalState: () => [{ userEmail: undefined }],
  setGlobalState: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("AuthPage", () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue({
      loginWithGoogle: jest.fn(),
      loading: false,
      error: null,
      setError: jest.fn(),
    });
  });

  it("renders the TDD Lab logo", () => {
    render(<AuthPage />);

    expect(screen.getByRole("img", { name: /tdd lab logo/i })).toBeInTheDocument();
  });



  it("renders the Google login button", () => {
    render(<AuthPage />);

    expect(
      screen.getByRole("button", { name: /accedé con google/i }),
    ).toBeInTheDocument();
  });

  it("renders welcome message", () => {
    render(<AuthPage />);

    expect(screen.getByText(/bienvenido al tdd lab/i)).toBeInTheDocument();
  });
});

// Pruebas agregadas para la HU-10: eliminar el acceso con GitHub.
const signIn = handleSignInWithGoogle as jest.Mock;
const lookup = jest.fn();
const account = { id: 7, email: "qa@example.com", groupid: 90, role: "student" };
const user = {
  email: account.email,
  photoURL: "https://example.com/avatar.png",
  getIdToken: jest.fn().mockResolvedValue("qa-google-token"),
} as unknown as User;

describe("HU-10: acceso con Google tras retirar GitHub", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuth.mockImplementation(
      jest.requireActual("../../../src/presentation/auth/hooks/useAuth").useAuth,
    );
    localStorage.clear();
    signIn.mockResolvedValue(user);
    lookup.mockResolvedValue(account);
    (CheckIfUserHasAccount as jest.Mock).mockImplementation(() => ({
      userHasAnAccountWithGoogleToken: lookup,
    }));
  });

  it("muestra Google y no muestra un boton ni texto de GitHub", () => {
    render(<AuthPage />);
    expect(screen.getByRole("button", { name: /google/i })).toBeEnabled();
    expect(screen.queryByRole("button", { name: /github/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/github/i)).not.toBeInTheDocument();
  });

  it("consulta con el token de Google, restaura la sesion y navega al inicio", async () => {
    render(<AuthPage />);
    fireEvent.click(screen.getByRole("button", { name: /google/i }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith({ pathname: "/" }));
    expect(signIn).toHaveBeenCalledTimes(1);
    expect(lookup).toHaveBeenCalledWith("qa-google-token");
    expect(setGlobalState).toHaveBeenCalledWith("authData", expect.objectContaining({
      userid: 7, userEmail: account.email, usergroupid: 90, userRole: "student",
    }));
    expect(localStorage.getItem("tddlabAuthSession")).toBe("active");
  });

  it("deshabilita el acceso mientras Google responde y lo habilita al terminar", async () => {
    let resolveSignIn!: (value: User) => void;
    signIn.mockReturnValue(new Promise<User>((resolve) => { resolveSignIn = resolve; }));
    render(<AuthPage />);
    const button = screen.getByRole("button", { name: /google/i });
    fireEvent.click(button);
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(signIn).toHaveBeenCalledTimes(1);
    await act(async () => { resolveSignIn(user); });
    expect(button).toBeEnabled();
  });

  it("no crea una sesion si el usuario no esta registrado", async () => {
    lookup.mockResolvedValue(null);
    render(<AuthPage />);
    fireEvent.click(screen.getByRole("button", { name: /google/i }));
    await screen.findAllByText(/reg.strate primero/i);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(setGlobalState).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /google/i })).toBeEnabled();
  });

  it("permite reintentar si Google no devuelve un usuario", async () => {
    signIn.mockResolvedValue(undefined);
    render(<AuthPage />);
    fireEvent.click(screen.getByRole("button", { name: /google/i }));
    await screen.findAllByText(/reg.strate primero/i);
    expect(lookup).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /google/i })).toBeEnabled();
  });

  it("no recomienda un acceso eliminado si recibe un error antiguo de GitHub", async () => {
    // Reproduce la referencia residual del manejo de errores; no llama al backend real.
    lookup.mockRejectedValue(new Error("Cuenta vinculada con GitHub"));
    render(<AuthPage />);
    fireEvent.click(screen.getByRole("button", { name: /google/i }));
    await screen.findAllByText(/no se pudo iniciar sesi.n/i);
    expect(screen.queryAllByText(/inicia sesi.n con GitHub/i)).toHaveLength(0);
  });
});
