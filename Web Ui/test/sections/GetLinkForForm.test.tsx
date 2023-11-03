import { render, fireEvent, screen } from "@testing-library/react";
import InvitationComponent from "../../src/sections/Assignments/components/EnrollmentLink";

describe("AssignmentManager Component", () => {
  it('should show the form when "Generar Link de Invitación" button is clicked', () => {
    render(<InvitationComponent />);
    const generarLinkButton = screen.getByText("Generar Link de Invitación");
    fireEvent.click(generarLinkButton);

    const formElement = screen.queryByTestId("form");
    expect(formElement).toBeInTheDocument();
  });

  it('should copy link to clipboard when "Copiar" button is clicked', () => {
    render(<InvitationComponent />);
    const generarLinkButton = screen.getByText("Generar Link de Invitación");
    fireEvent.click(generarLinkButton);

    const copiarLinkButton = screen.getByText("Copiar");
    fireEvent.click(copiarLinkButton);

  });

  it("should not show the form initially", () => {
    render(<InvitationComponent />);
    const formElement = screen.queryByTestId("form");
    expect(formElement).not.toBeInTheDocument();
  });
});
