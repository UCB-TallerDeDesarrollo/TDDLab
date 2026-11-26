import { fireEvent, render, screen, within } from "@testing-library/react";

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

  it("shows the classic metrics for one branch and topology for all branches", () => {
    const props = {
      commits: [],
      tddLogs: null,
      metric: "Dashboard",
      setMetric: () => {},
      port: new CommitHistoryAdapter(),
      role: "student",
      commitsTddCycles: null,
      typegraphs: "graph",
    };
    const { unmount } = render(<TDDCharts {...props} selectedBranch="main" />);

    const openMenu = () => {
      fireEvent.mouseDown(screen.getByRole("combobox"));
      return within(screen.getByRole("listbox"));
    };

    expect(openMenu().queryByRole("option", { name: /Topolog/ })).not.toBeInTheDocument();

    unmount();
    render(<TDDCharts {...props} selectedBranch="all" />);
    expect(openMenu().getByRole("option", { name: /Topolog/ })).toBeInTheDocument();
  });

});
