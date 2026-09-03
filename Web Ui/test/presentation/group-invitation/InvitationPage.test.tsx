import InvitationPage from "../../../src/presentation/group-invitation/pages/InvitationPage";
import { fireEvent, render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { handleSignInWithGoogle } from "../../../src/modules/User-Authentication/application/signInWithGoogle";
import { mockUserCredential } from "../../modules/__mocks__/Auth/mockedUserCredential";
import { MemoryRouter } from "react-router-dom";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => ({
    pathname: "localhost:5173/invitation",
    search: "?groupid=90&type=student",
  }),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn((_, func) => {
    func(null);
    return jest.fn();
  }),
  signOut: jest.fn(),
  User: jest.fn(),
}));

jest.mock(
  "../../../src/modules/User-Authentication/application/signInWithGoogle",
  () => ({
    handleSignInWithGoogle: jest.fn(),
  }),
);

jest.mock("../../../src/firebaseConfig", () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

var mockRegister: jest.Mock;
var mockRegisterWithGoogle: jest.Mock;

jest.mock(
  "../../../src/modules/User-Authentication/application/registerUserOnDb",
  () => {
    mockRegister = jest.fn().mockResolvedValue(undefined);
    mockRegisterWithGoogle = jest.fn().mockResolvedValue(undefined);

    return {
      RegisterUserOnDb: jest.fn().mockImplementation(() => ({
        register: mockRegister,
        registerWithGoogle: mockRegisterWithGoogle,
        getAccountInfo: jest.fn().mockResolvedValue(null),
        verifyPass: jest.fn().mockResolvedValue(true),
      })),
    };
  },
);

function asMock<T extends (...args: any[]) => any>(fn: T): jest.MockedFunction<T> {
  return fn as jest.MockedFunction<T>;
}

describe("InvitationPage component", () => {
  beforeEach(() => {
    // No usamos jest.clearAllMocks() acá porque borraría el historial
    // del singleton RegisterUserOnDb creado al importar el módulo.
    // Reseteamos manualmente lo que sí necesitamos limpiar entre tests.
    mockRegister.mockClear();
    mockRegisterWithGoogle.mockClear();

    const mockedUser = mockUserCredential.user;
    const typedHandleSignIn = asMock(handleSignInWithGoogle);

    typedHandleSignIn.mockReset();
    typedHandleSignIn.mockResolvedValue(mockedUser);
  });

  it("Renders the Sign Up button and press it", async () => {
    const { getByText } = render(
      <MemoryRouter>
        <InvitationPage />
      </MemoryRouter>,
    );

    const signUpButton = getByText("Registrarse con Google");

    fireEvent.click(signUpButton);

    expect(signUpButton).toBeInTheDocument();

    await waitFor(() => {
      expect(handleSignInWithGoogle).toHaveBeenCalled();
    });

    const acceptButton = await waitFor(() =>
      getByText(/Aceptar invitaci.*n al curso/),
    );

    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(mockRegisterWithGoogle).toHaveBeenCalledTimes(1);
    });

    expect(acceptButton).toBeInTheDocument();
  });
});