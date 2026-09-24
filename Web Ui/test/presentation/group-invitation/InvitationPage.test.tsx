import InvitationPage from "../../../src/presentation/group-invitation/pages/InvitationPage";
import { fireEvent, render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { mockUserCredential } from "../../modules/__mocks__/Auth/mockedUserCredential";
import { MemoryRouter } from "react-router-dom";
import {
  signInInvitationWithGithub,
  registerInvitationUser,
} from "../../../src/presentation/group-invitation/services/invitation.service";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => ({
    pathname: "localhost:5173/invitation",
    search: "?groupid=90&type=student",
  }),
}));

let onAuthChangeCallback: ((user: any, provider: any) => void) | null = null;

jest.mock(
  "../../../src/presentation/group-invitation/services/invitation.service",
  () => ({
    subscribeToInvitationAuth: jest.fn((callback) => {
      onAuthChangeCallback = callback;
      return jest.fn();
    }),
    signInInvitationWithGithub: jest.fn().mockImplementation(async () => {
      if (onAuthChangeCallback) {
        onAuthChangeCallback(mockUserCredential.user, "github");
      }
    }),
    registerInvitationUser: jest.fn().mockResolvedValue(undefined),
    signOutInvitationSession: jest.fn(),
    verifyInvitationPassword: jest.fn(),
  })
);

describe("InvitationPage component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Renders the Sign Up button and press it", async () => {
    const { getByText } = render(
      <MemoryRouter>
        <InvitationPage />
      </MemoryRouter>
    );

    const signUpButton = getByText("Registrarse con GitHub");
    expect(signUpButton).toBeInTheDocument();

    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(signInInvitationWithGithub).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      const acceptButton = getByText(/Aceptar invitaci.*n al curso/);
      expect(acceptButton).toBeInTheDocument();
      fireEvent.click(acceptButton);
    });
    await waitFor(() => {
      expect(registerInvitationUser).toHaveBeenCalled();
    });
  });
});
