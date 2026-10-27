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

describe("Preferencias de métricas integradas", () => {
  const logs = [{ numPassedTests: 1, failedTests: 0, numTotalTests: 1, timestamp: 1, success: true, testId: 1 }];
  const port = new MockGithubAPI();
  const view = (hasLogs: boolean, setMetric = jest.fn()) => <TDDCharts
    commits={[]} tddLogs={hasLogs ? logs : []} metric={null}
    setMetric={setMetric} port={port} role="student" commitsTddCycles={[]}
  />;

  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it.each(["Complejidad", "Pie", "desconocida"])("usa Dashboard al leer %s con logs", stored => {
    localStorage.setItem("selectedMetric", stored);
    const setMetric = jest.fn();
    render(view(true, setMetric));
    expect(screen.getByTestId("selected-metric")).toHaveTextContent("Dashboard");
    expect(setMetric).toHaveBeenLastCalledWith("Dashboard");
    // Reading a fallback must not overwrite a preference automatically.
    expect(localStorage.getItem("selectedMetric")).toBe(stored);
  });

  it.each([null, "Pie", "Dashboard", "Ciclo de ejecución de pruebas"])("elige una opción visible sin logs para %s", stored => {
    if (stored !== null) localStorage.setItem("selectedMetric", stored);
    render(view(false));
    expect(screen.getByTestId("selected-metric")).toHaveTextContent("Total Número de Tests");
    fireEvent.mouseDown(screen.getByRole("combobox"));
    expect(within(screen.getByRole("listbox")).getByRole("option", { name: "Total Número de Tests" })).toHaveAttribute("aria-selected", "true");
  });

  it("conserva una preferencia vigente", () => {
    localStorage.setItem("selectedMetric", "Cobertura de Código");
    render(view(false));
    expect(screen.getByTestId("selected-metric")).toHaveTextContent("Cobertura de Código");
  });

  it("normaliza cambios de storage y conserva selecciones válidas", () => {
    const setMetric = jest.fn();
    render(view(false, setMetric));
    localStorage.setItem("selectedMetric", "Complejidad");
    fireEvent(window, new Event("storage"));
    expect(screen.getByTestId("selected-metric")).toHaveTextContent("Total Número de Tests");
    expect(setMetric).toHaveBeenLastCalledWith("Total Número de Tests");
    localStorage.setItem("selectedMetric", "Lista");
    fireEvent(window, new Event("storage"));
    expect(screen.getByTestId("selected-metric")).toHaveTextContent("Lista");
    expect(setMetric).toHaveBeenLastCalledWith("Lista");
  });

  it("revalida la preferencia cuando llegan o desaparecen los logs", () => {
    localStorage.setItem("selectedMetric", "Dashboard");
    const setMetric = jest.fn();
    const { rerender } = render(view(false, setMetric));
    expect(screen.getByTestId("selected-metric")).toHaveTextContent("Total Número de Tests");
    rerender(view(true, setMetric));
    expect(screen.getByTestId("selected-metric")).toHaveTextContent("Dashboard");
    rerender(view(false, setMetric));
    expect(screen.getByTestId("selected-metric")).toHaveTextContent("Total Número de Tests");
  });
});
