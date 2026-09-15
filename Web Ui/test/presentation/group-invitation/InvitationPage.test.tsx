import InvitationPage from "../../../src/presentation/group-invitation/pages/InvitationPage";
import { fireEvent, render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { mockUserCredential } from "../../modules/__mocks__/Auth/mockedUserCredential";
import { RegisterUserOnDb } from "../../../src/modules/User-Authentication/application/registerUserOnDb";
import { MemoryRouter } from "react-router-dom";
import { fireBaseAuthManager } from "../../../src/modules/User-Authentication/infrastructure/authFirebase";

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
  User: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  GithubAuthProvider: jest.fn(),
}));

jest.mock("../../../src/modules/User-Authentication/infrastructure/authFirebase", () => ({
  fireBaseAuthManager: {
    loginWithOAuth: jest.fn(),
    logout: jest.fn(),
  },
  OAuthProvider: {
    Google: "google",
    Github: "github",
  },
}));

jest.mock("../../../src/firebaseConfig", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock(
  "../../../src/modules/User-Authentication/application/registerUserOnDb",
  () => ({
    RegisterUserOnDb: jest.fn().mockImplementation(() => ({
      register: jest.fn().mockResolvedValue(undefined),
      getAccountInfo: jest.fn().mockResolvedValue(null),
    })),
  })
);
describe("InvitationPage component", () => {
  beforeEach(() => {
    const mockedUser = mockUserCredential.user;
    (
      fireBaseAuthManager.loginWithOAuth as jest.MockedFunction<
        typeof fireBaseAuthManager.loginWithOAuth
      >
    ).mockResolvedValue(mockedUser);
  });
  it("Renders the Sign Up button and press it", async () => {
    const { getByText } = render(
      <MemoryRouter>
        <InvitationPage />
      </MemoryRouter>
    );
    const signUpButton = getByText("Registrarse con Google");

    fireEvent.click(signUpButton);
    expect(RegisterUserOnDb).toHaveBeenCalledTimes(1);
    expect(signUpButton).toBeInTheDocument();
    expect(fireBaseAuthManager.loginWithOAuth).toHaveBeenCalled();
    await waitFor(() => {
      const acceptButton = getByText(/Aceptar invitaci.*n al curso/);
      fireEvent.click(acceptButton);
      expect(acceptButton).toBeInTheDocument();
    });
  });
});
