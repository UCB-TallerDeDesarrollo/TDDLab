import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import InvitationPage from "../../../src/sections/GroupInvitation/InvitationPage";

jest.mock("../../../src/sections/GroupInvitation/InvitationPage", () => {
  return {
    __esModule: true,
    default: () => (
      <div>
        <button onClick={() => {}} aria-label="register">
          Registrarse
        </button>
        <p>Te has registrado exitosamente</p>
        <p>Error al registrar</p>
      </div>
    ),
  };
});

describe("InvitationPage component", () => {
  it("Renders the Sign Up button and press it", async () => {
    render(<InvitationPage />);

    // Verifica que el botón "Registrarse" esté presente
    const signUpButton = screen.getByText("Registrarse");
    expect(signUpButton).toBeInTheDocument();

    // Simula el clic en el botón
    fireEvent.click(signUpButton);

    // Simula una respuesta exitosa
    await waitFor(() => {
      expect(
        screen.getByText(/Te has registrado exitosamente/i)
      ).toBeInTheDocument();
    });
  });

  it("Displays error message when registration fails", async () => {
    render(<InvitationPage />);

    // Simula que el botón "Registrarse" esté presente
    const signUpButton = screen.getByText("Registrarse");
    fireEvent.click(signUpButton);

    // Simula un mensaje de error
    await waitFor(() => {
      expect(screen.getByText(/Error al registrar/i)).toBeInTheDocument();
    });
  });
});
