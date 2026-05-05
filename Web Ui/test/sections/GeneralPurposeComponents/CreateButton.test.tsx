import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CreateButton from "../../../src/sections/GeneralPurposeComponents/CreateButton";

describe("CreateButton Component", () => {
  it("renderiza el botón con el label", () => {
    render(<CreateButton label="Crear grupo" onClick={jest.fn()} />);

    expect(screen.getByText("Crear grupo")).toBeInTheDocument();
  });

  it("usa el label por defecto si no se pasa", () => {
    render(<CreateButton onClick={jest.fn()} />);

    expect(screen.getByText("Crear")).toBeInTheDocument();
  });

  it("ejecuta onClick al hacer click", () => {
    const handleClick = jest.fn();

    render(<CreateButton label="Crear" onClick={handleClick} />);

    fireEvent.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});