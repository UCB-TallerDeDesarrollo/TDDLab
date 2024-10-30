import TDDChartPage from "../../../src/sections/TDDCycles-Visualization/TDDChartPage";
import { render, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  MockGithubAPI,
  MockGithubAPIEmpty,
  MockGithubAPIError,
} from "./__mocks__/MocksGithubAPI";

jest.mock("react-router-dom", () => ({
  useSearchParams: jest.fn(() => {
    const params = new URLSearchParams();
    const getMock = jest.fn(); // Create a mock for the get method
    getMock.mockReturnValueOnce("exampleOwner"); // Set the desired return value
    getMock.mockReturnValueOnce("exampleRepo"); // Set the desired return value
    params.get = getMock; // Assign the mock get method to the URLSearchParams object
    return [params];
  }),
}));

describe("TDDChartPage", () => {
  test.each([
    ["admin"],
    ["student"]
  ])("renders loading spinner when loading is true for role %s", async (role) => {
    const { getByTestId } = render(<TDDChartPage port={new MockGithubAPI()} role={role} />);
  
    await waitFor(() => {
      const loadingSpinner = getByTestId("loading-spinner");
      expect(loadingSpinner).toBeInTheDocument();
    });
  });
  
  test.each([
    ["admin"],
    ["student"]
  ])("displays an error message when no data is available for role %s", async (role) => {
    const { getByTestId } = render(
      <TDDChartPage port={new MockGithubAPIEmpty()} role={role} />
    );
  
    await waitFor(() => {
      const error = getByTestId("errorMessage");
      expect(error).toBeInTheDocument();
    });
  }); 
  
  test.each([
    ["admin"],
    ["student"]
  ])("displays the repository name for role %s", async (role) => {
    const { getByTestId } = render(<TDDChartPage port={new MockGithubAPI()} role={role} />);
  
    await waitFor(() => {
      const repoName = getByTestId("repoNameTitle");
      expect(repoName).toBeInTheDocument();
  
      if (role === "admin") {
        const repoOwner = getByTestId("repoOwnerTitle");
        expect(repoOwner).toBeInTheDocument();
      }
    });
  });
  

  it("tests the catch event for both, obtainJobsData and obtainCommitsData", async () => {
    const spyConsoleError = jest.spyOn(console, "error");
    spyConsoleError.mockImplementation(() => {});
  
    await act(async () => {
      render(<TDDChartPage port={new MockGithubAPIError()} role="admin" />);
    });
  
    expect(spyConsoleError).toHaveBeenCalledWith(
      "Error obtaining jobs:",
      expect.any(Error)
    );
    expect(spyConsoleError).toHaveBeenCalledWith(
      "Error obtaining commit information:",
      expect.any(Error)
    );
  
    spyConsoleError.mockRestore();
  });
});
