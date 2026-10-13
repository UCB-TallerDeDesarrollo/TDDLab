import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import TDDBoard from "../../../src/presentation/tdd-visualization/components/TDDBoard";
import { MockGithubAPI, convertToCommitDataObject } from "./__mocks__/MocksCommitHistory";
import { mockCommitDataArray } from "./__mocks__/dataTypeMocks/commitData";

describe("TDDBoard Navigation", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, reload: jest.fn() },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("updates selectedMetric and does not reload page when clicking Cobertura de Código", () => {
    const commits = mockCommitDataArray.map(convertToCommitDataObject);
    const mockTddLogs = [
      {
        numPassedTests: 1,
        failedTests: 0,
        numTotalTests: 1,
        timestamp: Date.now(),
        success: true,
        testId: 1,
      },
    ];

    render(
      <TDDBoard
        commits={commits}
        tddLogs={mockTddLogs}
        port={new MockGithubAPI()}
        role="teacher"
      />
    );

    const coverageTitle = screen.getByRole("heading", { name: "Cobertura de Código" });
    const coverageContainer = coverageTitle.closest("div");
    expect(coverageContainer).not.toBeNull();

    fireEvent.click(coverageContainer!);

    expect(localStorage.getItem("selectedMetric")).toBe("Cobertura de Código");
    expect(window.location.reload).not.toHaveBeenCalled();
  });

  it("updates selectedMetric and does not reload page when pressing Enter on Cobertura de Código", () => {
    const commits = mockCommitDataArray.map(convertToCommitDataObject);
    const mockTddLogs = [
      {
        numPassedTests: 1,
        failedTests: 0,
        numTotalTests: 1,
        timestamp: Date.now(),
        success: true,
        testId: 1,
      },
    ];

    render(
      <TDDBoard
        commits={commits}
        tddLogs={mockTddLogs}
        port={new MockGithubAPI()}
        role="teacher"
      />
    );

    const coverageTitle = screen.getByRole("heading", { name: "Cobertura de Código" });
    const coverageContainer = coverageTitle.closest("div");
    expect(coverageContainer).not.toBeNull();

    fireEvent.keyDown(coverageContainer!, { key: "Enter" });

    expect(localStorage.getItem("selectedMetric")).toBe("Cobertura de Código");
    expect(window.location.reload).not.toHaveBeenCalled();
  });
});
