import InvitationPage from "../../../src/presentation/group-invitation/pages/InvitationPage";
import { fireEvent, render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { handleSignInWithGoogle } from "../../../src/modules/User-Authentication/application/signInWithGoogle";
import { mockUserCredential } from "../../modules/__mocks__/Auth/mockedUserCredential";
import { RegisterUserOnDb } from "../../../src/modules/User-Authentication/application/registerUserOnDb";
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
        register: jest.fn().mockResolvedValue(undefined),
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
      <MemoryRouter>
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
