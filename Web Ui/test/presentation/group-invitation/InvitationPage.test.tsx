import InvitationPage from "../../../src/presentation/group-invitation/pages/InvitationPage";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { handleSignInWithGoogle } from "../../../src/modules/User-Authentication/application/signInWithGoogle";
import { mockUserCredential } from "../../modules/__mocks__/Auth/mockedUserCredential";
import { RegisterUserOnDb } from "../../../src/modules/User-Authentication/application/registerUserOnDb";
import { MemoryRouter } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

const mockRegisterWithGoogle = jest.fn();
const mockRegister = jest.fn();
const mockVerifyPass = jest.fn();

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn((_, func) => {
    func(null);
    return jest.fn();
  }),
  User: jest.fn(),
}));
jest.mock(
  "../../../src/modules/User-Authentication/application/signInWithGoogle",
  () => ({
    handleSignInWithGoogle: jest.fn(),
  })
);
jest.mock("../../../src/firebaseConfig", () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});
jest.mock(
  "../../../src/modules/User-Authentication/application/registerUserOnDb",
  () => {
    return {
      RegisterUserOnDb: jest.fn().mockImplementation(() => ({
        register: (...args: unknown[]) => mockRegister(...args),
        registerWithGoogle: (...args: unknown[]) => mockRegisterWithGoogle(...args),
        verifyPass: (...args: unknown[]) => mockVerifyPass(...args),
        getAccountInfo: jest.fn().mockResolvedValue(null),
      })),
    };
  }
);
describe("InvitationPage component", () => {
  beforeEach(() => {
    const mockedUser = mockUserCredential.user;
    (
      handleSignInWithGoogle as jest.MockedFunction<
        typeof handleSignInWithGoogle
      >
    ).mockResolvedValue(mockedUser);
  });
  it("Renders the Sign Up button and press it", async () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={["/invitation?groupid=90&type=student"]}>
        <InvitationPage />
      </MemoryRouter>
    );
    const signUpButton = getByText("Registrarse con Google");

    fireEvent.click(signUpButton);
    expect(RegisterUserOnDb).toHaveBeenCalledTimes(1);
    expect(signUpButton).toBeInTheDocument();
    expect(handleSignInWithGoogle).toHaveBeenCalled();
    await waitFor(() => {
      const acceptButton = getByText(/Aceptar invitaci.*n al curso/);
      fireEvent.click(acceptButton);
      expect(acceptButton).toBeInTheDocument();
    });
  });
});

// Pruebas agregadas para la HU-10: eliminar el acceso con GitHub.
const mockAuth = {};
const user = {
  email: "qa@example.com", displayName: "QA Student", photoURL: "https://example.com/avatar.png",
  providerData: [{ providerId: "google.com" }],
  getIdToken: jest.fn().mockResolvedValue("qa-google-token"),
};
const showPage = (role = "student") => render(
  <MemoryRouter initialEntries={[`/invitation?groupid=90&type=${role}`]}>
    <InvitationPage />
  </MemoryRouter>,
);
const signIn = async () => {
  fireEvent.click(screen.getByRole("button", { name: /registrarse con google/i }));
  await screen.findByText("QA Student");
};

describe("HU-10: registro por invitacion y cierre de sesion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getAuth as jest.Mock).mockReturnValue(mockAuth);
    (onAuthStateChanged as jest.Mock).mockImplementation((_, callback) => {
      callback(null);
      return jest.fn();
    });
    (handleSignInWithGoogle as jest.Mock).mockResolvedValue(user);
    (signOut as jest.Mock).mockResolvedValue(undefined);
    mockRegisterWithGoogle.mockResolvedValue(undefined);
    mockVerifyPass.mockResolvedValue(true);
  });

  it("ofrece registro con Google sin boton ni icono de GitHub", () => {
    showPage();
    expect(screen.getByRole("button", { name: /registrarse con google/i })).toBeEnabled();
    expect(screen.queryByRole("button", { name: /github/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId("GitHubIcon")).not.toBeInTheDocument();
  });

  it("registra al estudiante con token, grupo y rol y confirma la inscripcion", async () => {
    showPage();
    await signIn();
    fireEvent.click(screen.getByRole("button", { name: /aceptar invitaci.n al curso$/i }));
    await screen.findByText(/inscripci.n exitosa/i);
    expect(mockRegisterWithGoogle).toHaveBeenCalledWith("qa-google-token", 90, "student");
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("valida la clave y conserva el registro como docente", async () => {
    showPage("teacher");
    await signIn();
    fireEvent.click(screen.getByRole("button", { name: /aceptar invitaci.n.*docente/i }));
    fireEvent.change(screen.getByLabelText(/contrase.a/i, { selector: "input" }), { target: { value: "qa-password" } });
    fireEvent.click(screen.getByRole("button", { name: /enviar/i }));
    await screen.findByText(/inscripci.n exitosa/i);
    expect(mockVerifyPass).toHaveBeenCalledWith("qa-password");
    expect(mockRegisterWithGoogle).toHaveBeenCalledWith("qa-google-token", 90, "teacher");
  });

  it("rechaza una clave docente incorrecta sin registrar al usuario", async () => {
    mockVerifyPass.mockResolvedValue(false);
    showPage("teacher");
    await signIn();
    fireEvent.click(screen.getByRole("button", { name: /aceptar invitaci.n.*docente/i }));
    fireEvent.change(screen.getByLabelText(/contrase.a/i, { selector: "input" }), { target: { value: "incorrecta" } });
    fireEvent.click(screen.getByRole("button", { name: /enviar/i }));
    await screen.findByText(/contrase.a inv.lida/i);
    expect(mockRegisterWithGoogle).not.toHaveBeenCalled();
    expect(screen.queryByText(/inscripci.n exitosa/i)).not.toBeInTheDocument();
  });

  it("cierra la sesion de Firebase y vuelve a ofrecer Google", async () => {
    showPage();
    await signIn();
    fireEvent.click(screen.getByRole("button", { name: /cerrar sesi.n/i }));
    await waitFor(() => expect(signOut).toHaveBeenCalledWith(mockAuth));
    const authListener = (onAuthStateChanged as jest.Mock).mock.calls[0][1];
    act(() => authListener(null));
    expect(screen.getByRole("button", { name: /registrarse con google/i })).toBeEnabled();
  });
});
