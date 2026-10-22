import { fireEvent, render, screen, within } from "@testing-library/react";

import TDDCharts from "../../../src/presentation/tdd-visualization/components/TDDChart";
import "@testing-library/jest-dom";
import { CommitHistoryAdapter } from "../../../src/modules/TDDCycles-Visualization/repository/CommitHistoryAdapter";


jest.mock("../../../src/presentation/tdd-visualization/components/TDDLineChart", () => ({
  __esModule: true,
  default: ({ optionSelected }: { optionSelected: string }) => (
    <output data-testid="current-metric">{optionSelected}</output>
  ),
}));

describe("TDDCharts", () => {


  it("renders with default props (null data)", () => {
    render(<TDDCharts 
      commits={null}
      tddLogs={null}
      metric={""} 
      setMetric={() => {}}
      port={new CommitHistoryAdapter()}

      role={"student"}
    />);

    expect(screen.queryByTestId("graph-coverage")).not.toBeInTheDocument();
  });

});

describe("HU-06 remaining chart metrics", () => {
  const port = new CommitHistoryAdapter();
  const setMetric = jest.fn();
  const logs = [{ numPassedTests: 2, failedTests: 0, numTotalTests: 2, timestamp: 1, success: true, testId: 1 }];
  beforeEach(() => {
    localStorage.clear();
    setMetric.mockClear();
  });

  function mount(withLogs = true) {
    return render(<TDDCharts commits={[]} tddLogs={withLogs ? logs : []}
      metric={null} setMetric={setMetric} port={port} role="student" />);
  }

  function openMetrics() {
    const select = screen.getByTestId("select-graph-type");
    const trigger = select.querySelector('[role="combobox"], [role="button"]');
    expect(trigger).not.toBeNull();
    fireEvent.mouseDown(trigger!);
    return screen.getByRole("listbox");
  }

  it("offers only the six supported metrics", () => {
    mount();
    const menu = openMetrics();
    const labels = within(menu).getAllByRole("option").map((option) => option.textContent);
    expect(labels).toEqual([
      "Dashboard", "Total N\u00famero de Tests", "Porcentaje de Cobertura de C\u00f3digo",
      "L\u00edneas de C\u00f3digo Modificadas", "Lista de Commits", "Ciclo de ejecuci\u00f3n de pruebas",
    ]);
    expect(screen.queryByRole("button", { name: /gr[a\u00e1]ficas adicionales/i })).not.toBeInTheDocument();
  });

  it("preserves filtering of metrics when execution logs are absent", () => {
    localStorage.setItem("selectedMetric", "Lista");
    mount(false);
    const labels = within(openMetrics()).getAllByRole("option").map((option) => option.textContent);
    expect(labels).toHaveLength(4);
    expect(labels).not.toContain("Dashboard");
    expect(labels).not.toContain("Ciclo de ejecuci\u00f3n de pruebas");
  });

  it.each(["Pie", "Complejidad"])("opens Dashboard when a retired metric %s was saved", (metric) => {
    localStorage.setItem("selectedMetric", metric);
    mount();
    expect(screen.getByTestId("current-metric")).toHaveTextContent("Dashboard");
  });

  it("updates the graph and storage when choosing a supported metric", () => {
    mount();
    const menu = openMetrics();
    fireEvent.click(within(menu).getByRole("option", { name: "Lista de Commits" }));
    expect(screen.getByTestId("current-metric")).toHaveTextContent("Lista");
    expect(localStorage.getItem("selectedMetric")).toBe("Lista");
    expect(setMetric).toHaveBeenCalledWith("Lista");
  });

  it("preserves storage events and replaces unsupported metrics safely", () => {
    mount();
    localStorage.setItem("selectedMetric", "Cobertura de C\u00f3digo");
    fireEvent(window, new Event("storage"));
    expect(screen.getByTestId("current-metric")).toHaveTextContent("Cobertura de C\u00f3digo");
    localStorage.setItem("selectedMetric", "Pie");
    fireEvent(window, new Event("storage"));
    expect(screen.getByTestId("current-metric")).toHaveTextContent("Dashboard");
    expect(setMetric).toHaveBeenLastCalledWith("Dashboard");
  });
});
