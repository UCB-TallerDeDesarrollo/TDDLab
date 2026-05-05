import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import MyPracticesList from "../../../src/sections/MyPractices/MyPracticesList";

describe("MyPracticesList Component", () => {
  it("renderiza la estructura principal de prácticas", () => {
    render(
      <MemoryRouter>
        <MyPracticesList ShowForm={jest.fn()} userRole="student" />
      </MemoryRouter>
    );

    expect(screen.getByText("Practicas")).toBeInTheDocument();
    expect(screen.getByText("Título")).toBeInTheDocument();
    expect(screen.getByText("Descripción")).toBeInTheDocument();
    expect(screen.getByText("Fecha de Creación")).toBeInTheDocument();
    expect(screen.getByText("Estado")).toBeInTheDocument();
    expect(screen.getByText("Acciones")).toBeInTheDocument();
    expect(screen.getByText("Crear +")).toBeInTheDocument();
  });
});