import InvitationPage from "../../../src/presentation/group-invitation/pages/InvitationPage";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

jest.mock("../../../src/presentation/group-invitation/hooks/useInvitationPage", () => ({
  useInvitationPage: jest.fn(),
}));

import { useInvitationPage } from "../../../src/presentation/group-invitation/hooks/useInvitationPage";

describe("InvitationPage component", () => {
  it("renders the invitation and accepts it", () => {
    const handleAcceptInvitation = jest.fn();

    (useInvitationPage as jest.Mock).mockReturnValue({
      user: {
        displayName: "Test User",
        email: "test@example.com",
        photoURL: null,
      },
      isLoading: false,
      userType: "student",
      rotation: {
        rotateX: 0,
        rotateY: 0,
      },
      handleMouseMove: jest.fn(),
      handleMouseLeave: jest.fn(),
      handleAcceptInvitation,
      showPasswordPopup: false,
      setShowPasswordPopup: jest.fn(),
      handlePassVerification: jest.fn(),
      showPopUp: false,
      authProvider: "",
      openPopup: false,
      feedbackMessage: "",
      setFeedbackMessage: jest.fn(),
      showAdminModal: false,
    });

    render(
      <MemoryRouter>
        <InvitationPage />
      </MemoryRouter>,
    );

    const acceptButton = screen.getByText("Aceptar invitación al curso");

    expect(acceptButton).toBeInTheDocument();

    fireEvent.click(acceptButton);

    expect(handleAcceptInvitation).toHaveBeenCalledTimes(1);
    expect(handleAcceptInvitation).toHaveBeenCalledWith("student");
  });
});