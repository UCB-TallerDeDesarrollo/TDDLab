import { render } from "@testing-library/react";
import TDDCyclesList from "../../../src/sections/TDD-Visualization/TDDCyclesList";
import { MockGithubAPI } from "./__ mocks __/MockGithubAPI";

describe("TDD Cycles List", () => {
  //Pending this test
  xit("Gets all commits and jobs", async () => {
    const mockGithubAPI = new MockGithubAPI();

    render(<TDDCyclesList port={mockGithubAPI}></TDDCyclesList>);

    expect(mockGithubAPI.obtainCommitsOfRepo).toHaveBeenCalled();
    expect(mockGithubAPI.obtainRunsOfGithubActions).toHaveBeenCalled();
  });
});
