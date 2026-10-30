import { render, screen } from "@testing-library/react";

import TDDCharts from "../../../src/presentation/tdd-visualization/components/TDDChart";
import "@testing-library/jest-dom";
import { CommitHistoryAdapter } from "../../../src/modules/TDDCycles-Visualization/repository/CommitHistoryAdapter";

// El selector se prueba independientemente del renderizado de Chart.js.
jest.mock("../../../src/presentation/tdd-visualization/components/TDDLineChart", () => ({
  __esModule: true,
  default: () => <div data-testid="mock-tdd-line-charts" />,
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
      commitsTddCycles={null}
      typegraphs="graph"
    />);

    expect(screen.queryByTestId("graph-coverage")).not.toBeInTheDocument();
  });

});
