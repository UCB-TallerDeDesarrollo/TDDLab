import TDDChartPage from "../../../src/sections/TDDCycles-Visualization/TDDChartPage";
import { render, waitFor, fireEvent, act } from "@testing-library/react";
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
  it("renders loading spinner when loading is true", async () => {
    const { getByTestId } = render(<TDDChartPage port={new MockGithubAPI()} />);

    await waitFor(() => {
      const loadingSpinner = getByTestId("loading-spinner");
      expect(loadingSpinner).toBeInTheDocument();
    });
  });
  it("displays an error message when no data is available", async () => {
    const { getByTestId } = render(
      <TDDChartPage port={new MockGithubAPIEmpty()} />
    );
    await waitFor(() => {
      const error = getByTestId("errorMessage");
      expect(error).toBeInTheDocument();
    });
  });

  it("displays the repository name", async () => {
    const { getByTestId } = render(<TDDChartPage port={new MockGithubAPI()} />);
    await waitFor(() => {
      const repoName = getByTestId("repoTitle");
      expect(repoName).toBeInTheDocument();
    });
  });
  it("click on Cambiar Grafico button", async () => {
    const { getByText } = render(<TDDChartPage port={new MockGithubAPI()} />);
    await waitFor(() => {
      fireEvent.click(getByText("Cambiar vista grafica"));
      expect(getByText("Métricas")).toBeInTheDocument();
    });
  });

  it("tests the catch event for both, obtainJobsData and obtainCommits Data", async () => {
    const spyConsoleError = jest.spyOn(console, "error");
    spyConsoleError.mockImplementation(() => {});

    await act(async () => {
      render(<TDDChartPage port={new MockGithubAPIError()} />);
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
