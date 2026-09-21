import { render, screen, fireEvent } from "@testing-library/react";

import TDDCharts from "../../../src/presentation/tdd-visualization/components/TDDChart";
import "@testing-library/jest-dom";
import { CommitHistoryAdapter } from "../../../src/modules/TDDCycles-Visualization/repository/CommitHistoryAdapter";
import { mockCommitDataArray } from "./__mocks__/dataTypeMocks/commitData";
import { convertToCommitDataObject } from "./__mocks__/MocksCommitHistory";

describe("TDDCharts", () => {
  it("renders with default props (null data)", () => {
    render(<TDDCharts 
      commits={null}
      tddLogs={null}
      metric={""} 
      setMetric={() => {}}
      port={new CommitHistoryAdapter()}
      role={"student"}
      commitsTddCycles={null}
    />);

    expect(screen.queryByTestId("graph-coverage")).not.toBeInTheDocument();
  });

  it("does not include additional graphs (Complejidad, Pie) in the metric options", async () => {
    const commits = mockCommitDataArray.map(convertToCommitDataObject);

    render(
      <TDDCharts
        commits={commits}
        tddLogs={[{ numPassedTests: 1, failedTests: 0, numTotalTests: 1, timestamp: Date.now(), success: true, testId: 1 }]}
        metric={"Dashboard"}
        setMetric={() => {}}
        port={new CommitHistoryAdapter()}
        role={"teacher"}
        commitsTddCycles={null}
      />
    );

    const select = screen.getByRole("combobox");
    fireEvent.mouseDown(select);

    expect(screen.queryByText("Lista de Complejidad")).not.toBeInTheDocument();
    expect(screen.queryByText("Distribución de Commits")).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Total Número de Tests" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Porcentaje de Cobertura de Código" })).toBeInTheDocument();
  });
});