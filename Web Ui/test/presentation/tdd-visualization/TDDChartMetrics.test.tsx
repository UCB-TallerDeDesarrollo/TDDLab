import { fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import TDDCharts from "../../../src/presentation/tdd-visualization/components/TDDChart";
import { MockGithubAPI } from "./__mocks__/MocksCommitHistory";

jest.mock("../../../src/presentation/tdd-visualization/components/TDDLineChart", () => ({
  __esModule: true,
  default: ({ optionSelected }: { optionSelected: string }) => (
    <div data-testid="selected-metric">{optionSelected}</div>
  ),
}));

describe("Métricas vigentes", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("ofrece las seis métricas vigentes cuando hay logs", () => {
    render(<TDDCharts
      commits={[]}
      tddLogs={[{ numPassedTests: 1, failedTests: 0, numTotalTests: 1, timestamp: 1, success: true, testId: 1 }]}
      metric={null}
      setMetric={jest.fn()}
      port={new MockGithubAPI()}
      role="student"
      commitsTddCycles={[]}
    />);
    fireEvent.mouseDown(screen.getByRole("combobox"));
    expect(within(screen.getByRole("listbox")).getAllByRole("option").map(option => option.textContent)).toEqual([
      "Dashboard",
      "Total Número de Tests",
      "Porcentaje de Cobertura de Código",
      "Líneas de Código Modificadas",
      "Lista de Commits",
      "Ciclo de ejecución de pruebas",
    ]);
  });

  it("conserva las métricas disponibles sin logs y persiste la selección", () => {
    const setMetric = jest.fn();
    render(<TDDCharts
      commits={[]}
      tddLogs={null}
      metric={null}
      setMetric={setMetric}
      port={new MockGithubAPI()}
      role="teacher"
      commitsTddCycles={[]}
    />);

    fireEvent.mouseDown(screen.getByRole("combobox"));
    const menu = within(screen.getByRole("listbox"));
    expect(menu.getAllByRole("option").map(option => option.textContent)).toEqual([
      "Total Número de Tests",
      "Porcentaje de Cobertura de Código",
      "Líneas de Código Modificadas",
      "Lista de Commits",
    ]);
    fireEvent.click(menu.getByRole("option", { name: "Porcentaje de Cobertura de Código" }));
    expect(setMetric).toHaveBeenCalledWith("Cobertura de Código");
    expect(localStorage.getItem("selectedMetric")).toBe("Cobertura de Código");
    expect(screen.getByTestId("selected-metric")).toHaveTextContent("Cobertura de Código");
  });
});
