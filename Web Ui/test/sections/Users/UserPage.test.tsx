import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import InvitationPage from "../../../src/sections/GroupInvitation/InvitationPage";
import "@testing-library/jest-dom";

describe("InvitationPage component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Renders the Sign Up button and press it", async () => {
    render(<InvitationPage />);

    const signUpButton = screen.getByText("Registrarse");
    expect(signUpButton).toBeInTheDocument();

    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Te has registrado exitosamente/i)
      ).toBeInTheDocument();
    });
  });

  it("Displays error message when registration fails", async () => {
    render(<InvitationPage />);

    const signUpButton = screen.getByText("Registrarse");
    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Error al registrar/i)
      ).toBeInTheDocument();
    });
  });
});
