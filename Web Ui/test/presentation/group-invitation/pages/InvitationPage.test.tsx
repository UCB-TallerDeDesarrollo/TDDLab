import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import InvitationPage from "../../../../src/presentation/group-invitation/pages/InvitationPage";
import { useInvitationPage } from "../../../../src/presentation/group-invitation/hooks/useInvitationPage";

jest.mock("../../../../src/presentation/group-invitation/hooks/useInvitationPage", () => ({
  useInvitationPage: jest.fn(),
}));

const mockedUseInvitationPage = useInvitationPage as jest.MockedFunction<
  typeof useInvitationPage
>;

describe("InvitationPage", () => {
  beforeEach(() => {
    mockedUseInvitationPage.mockReturnValue({
      authProvider: null,
      feedbackMessage: "",
      handleAcceptInvitation: jest.fn(),
      handleMouseLeave: jest.fn(),
      handleMouseMove: jest.fn(),
      handlePassVerification: jest.fn(),
      handleSignOut: jest.fn(),
      handleSignUpWithGoogle: jest.fn(),
      isLoading: false,
      openPopup: false,
      rotation: { rotateX: 0, rotateY: 0 },
      setFeedbackMessage: jest.fn(),
      setShowPasswordPopup: jest.fn(),
      showAdminModal: false,
      showPasswordPopup: false,
      showPopUp: false,
      user: null,
      userType: "student",
    });
  });

  it("does not render the GitHub sign-up button", () => {
    render(
      <MemoryRouter>
        <InvitationPage />
      </MemoryRouter>,
    );

    expect(
      screen.queryByRole("button", { name: /registrarse con github/i }),
    ).not.toBeInTheDocument();
  });

  it("renders the Google sign-up button", () => {
    render(
      <MemoryRouter>
        <InvitationPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("button", { name: /registrarse con google/i }),
    ).toBeInTheDocument();
  });
});
