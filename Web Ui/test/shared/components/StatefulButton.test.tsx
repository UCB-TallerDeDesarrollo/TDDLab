import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import StatefulButton from "../../../src/shared/components/StatefulButton";

describe("StatefulButton", () => {
  it("renders its children and is enabled when not loading", () => {
    render(<StatefulButton>Guardar</StatefulButton>);

    const button = screen.getByRole("button", { name: /guardar/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("renders a loading indicator and is disabled while loading", () => {
    render(<StatefulButton loading>Iniciar</StatefulButton>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(screen.getByRole("status", { name: /cargando/i })).toBeInTheDocument();
    expect(screen.queryByText("Iniciar")).not.toBeInTheDocument();
  });

  it("renders the loading indicator regardless of variant style", () => {
    render(
      <StatefulButton variantStyle="primary" loading>
        Finalizar
      </StatefulButton>
    );

    expect(screen.getByRole("status", { name: /cargando/i })).toBeInTheDocument();
    expect(screen.queryByText("Finalizar")).not.toBeInTheDocument();
  });
});
