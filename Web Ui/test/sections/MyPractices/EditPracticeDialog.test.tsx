import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import EditPracticeDialog from "../../../src/sections/MyPractices/EditPracticeForm";

describe("EditPracticeDialog Component", () => {
  const defaultProps = {
    practiceId: 1,
    currentTitle: "Práctica inicial",
    currentDescription: "Descripción inicial",
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza el título del diálogo", () => {
    render(<EditPracticeDialog {...defaultProps} />);

    expect(
      screen.getByText("Editar Practica : Práctica inicial")
    ).toBeInTheDocument();
  });

  it("muestra valores iniciales en inputs", () => {
    render(<EditPracticeDialog {...defaultProps} />);

    expect(screen.getByDisplayValue("Práctica inicial")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Descripción inicial")).toBeInTheDocument();
  });

  it("ejecuta onClose al hacer click en Cancelar", () => {
    render(<EditPracticeDialog {...defaultProps} />);

    fireEvent.click(screen.getByText("Cancelar"));

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});