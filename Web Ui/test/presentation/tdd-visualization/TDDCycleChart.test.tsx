import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TDDCycleChart from "../../../src/presentation/tdd-visualization/components/TDDCycleChart";

describe("TDDCycleChart component", () => {
  const mockData = [
    {
      testId: 1,
      numPassedTests: 1,
      failedTests: 0,
      success: true,
      commitId: "commit-1",
    },
    {
      testId: 2,
      numPassedTests: 0,
      failedTests: 1,
      success: false,
      commitId: "commit-2",
    },
  ];

  it("renders chart title", () => {
    render(<TDDCycleChart data={mockData} />);

    expect(
      screen.getByText("Ciclo de Ejecución de Pruebas TDD")
    ).toBeInTheDocument();
  });

  it("renders custom svg icons for passed and failed tests in the chart", () => {
    const { container } = render(<TDDCycleChart data={mockData} />);

    const images = container.querySelectorAll("svg image");
    expect(images.length).toBe(2);

    const hrefs = Array.from(images).map((img) => img.getAttribute("href"));
    expect(hrefs).toContain("/successful-test.svg");
    expect(hrefs).toContain("/failed-test.svg");
  });

  it("renders custom svg icons in the legend", () => {
    render(<TDDCycleChart data={mockData} />);

    const successIcon = screen.getByAltText("Pruebas exitosas");
    const failedIcon = screen.getByAltText("Pruebas fallidas");

    expect(successIcon).toBeInTheDocument();
    expect(successIcon).toHaveAttribute("src", "/successful-test.svg");

    expect(failedIcon).toBeInTheDocument();
    expect(failedIcon).toHaveAttribute("src", "/failed-test.svg");
  });
});
