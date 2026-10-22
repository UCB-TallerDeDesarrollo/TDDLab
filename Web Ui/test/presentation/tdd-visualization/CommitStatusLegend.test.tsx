import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CommitStatusLegend from "../../../src/presentation/tdd-visualization/components/CommitStatusLegend";

describe("CommitStatusLegend", () => {
  it("explains every visual state without relying only on color", () => {
    render(<CommitStatusLegend />);

    expect(screen.getByRole("complementary", { name: "Estados de los commits" })).toBeInTheDocument();
    expect(screen.getByText("Pruebas pasadas.")).toBeInTheDocument();
    expect(screen.getByText("Círculo verde.")).toBeInTheDocument();
    expect(screen.getByText("Pruebas fallidas.")).toBeInTheDocument();
    expect(screen.getByText("Triángulo rojo.")).toBeInTheDocument();
    expect(screen.getByText("Refactor.")).toBeInTheDocument();
    expect(screen.getByText("Círculo verde con contorno azul.")).toBeInTheDocument();
  });
});
