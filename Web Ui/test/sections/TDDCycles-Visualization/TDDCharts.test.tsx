import { render, screen } from "@testing-library/react";

import TDDCharts from "../../../src/sections/TDDCycles-Visualization/components/TDDChart";
import "@testing-library/jest-dom";
import { GithubAPIAdapter } from "../../../src/modules/TDDCycles-Visualization/repository/GithubAPIAdapter";


describe("TDDCharts", () => {


  it("renders with default props (null data)", () => {
    render(<TDDCharts 
      commits={null} 
      jobsByCommit={null}  
      metric={""} 
      setMetric={() => {}}
      port={new GithubAPIAdapter()}
      role={"student"}
    />);

    expect(screen.queryByTestId("graph-coverage")).not.toBeInTheDocument();
  });

});