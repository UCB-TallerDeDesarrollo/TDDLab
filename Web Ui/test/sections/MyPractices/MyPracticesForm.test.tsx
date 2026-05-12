import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import MyPracticesForm from "../../../src/sections/MyPractices/MyPracticesForm";

describe("MyPracticesForm Component", () => {
  const defaultProps = {
    open: true,
    handleClose: jest.fn(),
    userid: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza el formulario para crear práctica", () => {
    render(<MyPracticesForm {...defaultProps} />);

    expect(screen.getByText("Crear una Practica")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre de la Practica*")).toBeInTheDocument();
    expect(screen.getByLabelText("Descripción")).toBeInTheDocument();
  });

  it("permite escribir nombre y descripción", () => {
    render(<MyPracticesForm {...defaultProps} />);

    const titleInput = screen.getByLabelText("Nombre de la Practica*");
    const descriptionInput = screen.getByLabelText("Descripción");

    fireEvent.change(titleInput, {
      target: { value: "Nueva práctica" },
    });

    fireEvent.change(descriptionInput, {
      target: { value: "Descripción de prueba" },
    });

    expect(titleInput).toHaveValue("Nueva práctica");
    expect(descriptionInput).toHaveValue("Descripción de prueba");
  });

  it("ejecuta handleClose al presionar Cancelar", () => {
    render(<MyPracticesForm {...defaultProps} />);

    fireEvent.click(screen.getByText("Cancelar"));

    expect(defaultProps.handleClose).toHaveBeenCalledTimes(1);
  });

  it("muestra error si se intenta crear sin nombre", () => {
    render(<MyPracticesForm {...defaultProps} />);

    fireEvent.click(screen.getByText("Crear"));

    const titleInput = screen.getByLabelText("Nombre de la Practica*");

    expect(titleInput).toBeInvalid();
  });
});