import { render } from "@testing-library/react";
import TDDCycleList from "../../../src/sections/TDDCycles-Visualization/components/TDDCycleList";
import { mockCommitData } from "./__mocks__/dataTypeMocks/commitData";
import { convertToCommitDataObject } from "./__mocks__/MocksCommitHistory.ts"; 
import "@testing-library/jest-dom";

describe("TDDCycleList Component", () => {
  test("renders a list of cycle cards when provided with commits and jobs data", () => {
    const commitsInfo = [convertToCommitDataObject(mockCommitData)];

    render(
      <TDDCycleList commitsInfo={commitsInfo} />
    );
    const cycleCards = document.getElementsByClassName("cycleCardContainer");
    expect(cycleCards.length).toBeGreaterThanOrEqual(1);
  });

  test("renders a list of cycle cards when commits and jobs don't match", () => {
    const commitsInfo = [convertToCommitDataObject(mockCommitData)];

    render(
      <TDDCycleList commitsInfo={commitsInfo} />
    );
    const cycleCards = document.getElementsByClassName("cycleCardContainer");
    expect(cycleCards.length).toBeGreaterThanOrEqual(1);
  });

  test("renders nothing when provided with no commits and jobs data", () => {
    render(<TDDCycleList commitsInfo={null} />);
    const cycleCards = document.getElementsByClassName("cycleCardContainer");
    expect(cycleCards.length).toBe(0);
  });
});