import { fireEvent, render, screen, within } from "@testing-library/react";

import TDDCharts from "../../../src/presentation/tdd-visualization/components/TDDChart";
import "@testing-library/jest-dom";
import { CommitHistoryAdapter } from "../../../src/modules/TDDCycles-Visualization/repository/CommitHistoryAdapter";
import { convertToCommitDataObject } from "./__mocks__/MocksCommitHistory";
import { mockCommitDataArray } from "./__mocks__/dataTypeMocks/commitData";


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

  it("does not offer the removed additional graphs in the metrics select", () => {
    render(<TDDCharts
      commits={mockCommitDataArray.map(convertToCommitDataObject)}
      tddLogs={null}
      metric={""}
      setMetric={() => {}}
      port={new CommitHistoryAdapter()}
      role={"student"}
      commitsTddCycles={null}
    />);

    fireEvent.mouseDown(within(screen.getByTestId("select-graph-type")).getByRole("combobox"));

    expect(screen.queryByText("Lista de Complejidad")).not.toBeInTheDocument();
    expect(screen.queryByText("Distribución de Commits")).not.toBeInTheDocument();
    expect(screen.getByText("Lista de Commits")).toBeInTheDocument();
  });

});
