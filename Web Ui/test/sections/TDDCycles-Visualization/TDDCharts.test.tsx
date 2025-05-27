import { render, screen } from "@testing-library/react";

import TDDCharts from "../../../src/sections/TDDCycles-Visualization/components/TDDChart";
import "@testing-library/jest-dom";
import { CommitHistoryAdapter } from "../../../src/modules/TDDCycles-Visualization/repository/CommitHistoryAdapter";


describe("TDDCharts", () => {


  it("renders with default props (null data)", () => {
    render(<TDDCharts 
      commits={null} 
      metric={""} 
      setMetric={() => {}}
      port={new CommitHistoryAdapter()}
      complexity={null}
      role={"student"}
      commitsTddCycles={null}
      typegraphs="graph"
    />);

    expect(screen.queryByTestId("graph-coverage")).not.toBeInTheDocument();
  });

});