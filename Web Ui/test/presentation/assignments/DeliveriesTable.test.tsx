import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DeliveriesTable } from "../../../src/presentation/assignments/components/detail/DeliveriesTable";

describe("DeliveriesTable Component", () => {
  const mockRows = [
    {
      id: 1,
      email: "student@example.com",
      status: "Enviado",
      startDate: "2026-03-01",
      endDate: "2026-03-05",
      repositoryLink: "https://github.com/student/repo",
      comment: "",
    },
  ];

  it("does not render the 'Gráficas adicionales' column header or action button", () => {
    render(
      <DeliveriesTable
        state="success"
        rows={mockRows}
        onOpenGraph={jest.fn()}
        onOpenAssistant={jest.fn()}
      />
    );

    expect(screen.getByText("Gráfica")).toBeInTheDocument();
    expect(screen.getByText("Asistente IA")).toBeInTheDocument();
    expect(screen.queryByText("Gráficas adicionales")).not.toBeInTheDocument();
  });
});
