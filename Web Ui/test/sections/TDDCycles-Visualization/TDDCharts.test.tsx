import { render, screen, fireEvent, within } from "@testing-library/react";
import { mockArrayJobData } from "./__mocks__/dataTypeMocks/jobData";
import { mockArrayCommitData } from "./__mocks__/dataTypeMocks/commitData";
import TDDCharts from "../../../src/sections/TDDCycles-Visualization/components/TDDChart";
import "@testing-library/jest-dom";

describe("TDDCharts", () => {
  const commitsData = mockArrayCommitData;

  const jobsByCommitData = mockArrayJobData;

  it("renders with default props", () => {
    render(<TDDCharts commits={null} jobsByCommit={null} />);
  });

  it("renders with provided data", () => {
    render(<TDDCharts commits={commitsData} jobsByCommit={jobsByCommitData} />);

    expect(screen.getByText("Métricas")).toBeInTheDocument();
    expect(screen.getByTestId("graph-coverage")).toBeInTheDocument();
  });

  it("Check that type of graph can be changed", async () => {
    render(<TDDCharts commits={commitsData} jobsByCommit={jobsByCommitData} />);

    fireEvent.mouseDown(screen.getByTestId("select-graph-type"));
    const listbox = within(screen.getByRole("combobox"));
    fireEvent.click(listbox.getByText(/Porcentaje de Cobertura de Código/i));
    expect(screen.getByTestId("select-graph-type")).toHaveTextContent(
      /Porcentaje de Cobertura de Código/i
    );
  });
});
