import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import EditPromptAI from "../../../src/sections/Settings/components/EditPromptAI";

const defaultProps = {
  initialPrompt: "Texto del prompt de prueba",
  isEditing: false,
  onEdit: jest.fn(),
  onSave: jest.fn(),
  onCancel: jest.fn(),
};

describe("EditPromptAI", () => {
  beforeEach(() => jest.clearAllMocks());

  it("en modo lectura muestra el botón Editar Prompt", () => {
    render(<EditPromptAI {...defaultProps} />);
    expect(screen.getByText("Editar Prompt")).toBeInTheDocument();
    expect(screen.queryByText("Guardar")).not.toBeInTheDocument();
    expect(screen.queryByText("Cancelar")).not.toBeInTheDocument();
    expect(screen.queryByText("Limpiar")).not.toBeInTheDocument();
  });

  it("en modo edición muestra los botones Guardar, Cancelar y Limpiar", () => {
    render(<EditPromptAI {...defaultProps} isEditing={true} />);
    expect(screen.getByText("Guardar")).toBeInTheDocument();
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
    expect(screen.getByText("Limpiar")).toBeInTheDocument();
    expect(screen.queryByText("Editar Prompt")).not.toBeInTheDocument();
  });

  it("llama a onEdit al hacer clic en Editar Prompt", () => {
    const onEdit = jest.fn();
    render(<EditPromptAI {...defaultProps} onEdit={onEdit} />);
    fireEvent.click(screen.getByText("Editar Prompt"));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("llama a onSave con el valor actual al hacer clic en Guardar", () => {
    const onSave = jest.fn();
    render(<EditPromptAI {...defaultProps} isEditing={true} onSave={onSave} />);
    fireEvent.click(screen.getByText("Guardar"));
    expect(onSave).toHaveBeenCalledWith("Texto del prompt de prueba");
  });

  it("llama a onCancel al hacer clic en Cancelar", () => {
    const onCancel = jest.fn();
    render(<EditPromptAI {...defaultProps} isEditing={true} onCancel={onCancel} />);
    fireEvent.click(screen.getByText("Cancelar"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("Limpiar vacía el campo de texto", () => {
    render(<EditPromptAI {...defaultProps} isEditing={true} />);
    fireEvent.click(screen.getByText("Limpiar"));
    expect(screen.getByRole("textbox")).toHaveValue("");
  });
});
