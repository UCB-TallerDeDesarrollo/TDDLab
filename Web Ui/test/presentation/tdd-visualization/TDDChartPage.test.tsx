import { render, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import TDDChartPage from "../../../src/presentation/tdd-visualization/pages/TDDChartPage";
import {
  MockGithubAPI,
  MockGithubAPIEmpty,
  MockGithubAPIError,
} from "./__mocks__/MocksCommitHistory";

// Mock persistente de `react-router-dom` con URLSearchParams
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
  useSearchParams: () => [
    new URLSearchParams("owner=exampleOwner&repoName=exampleRepo&repo=exampleRepo"),
  ],
}));

describe("TDDChartPage", () => {
  test.each([["admin"], ["student"]])(
    "renders loading spinner when loading is true for role %s",
    async (role) => {
      const { getByTestId } = render(
        <TDDChartPage port={new MockGithubAPI()} role={role} teacher_id={294} graphs="graph"/>
      );

      await waitFor(() => {
        const loadingSpinner = getByTestId("loading-spinner");
        expect(loadingSpinner).toBeInTheDocument();
      });
    }
  );

  test.each([["admin"], ["student"]])(
    "displays an error message when no data is available for role %s",
    async (role) => {
      const { getByTestId } = render(
        <TDDChartPage port={new MockGithubAPIEmpty()} role={role} teacher_id={294} graphs="graph"/>
      );

      await waitFor(() => {
        const error = getByTestId("errorMessage");
        expect(error).toBeInTheDocument();
      });
    }
  );

  test.each([["admin"], ["student"]])(
    "displays the repository name for role %s",
    async (role) => {
      const { getByTestId } = render(
        <TDDChartPage port={new MockGithubAPI()} role={role} teacher_id={294} graphs="graph"/>
      );

      await waitFor(() => {
        const repoName = getByTestId("repoNameTitle");
        expect(repoName).toBeInTheDocument();

        if (role === "admin") {
          const repoOwner = getByTestId("repoOwnerTitle");
          expect(repoOwner).toBeInTheDocument();
        }
      });
    }
  );

  it("tests the catch event for both, obtainJobsData and obtainCommitsData", async () => {
    const spyConsoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    await act(async () => {
      render(<TDDChartPage port={new MockGithubAPIError()} role="admin" teacher_id={294} graphs="graph"/>);
    });

    expect(spyConsoleError).toHaveBeenCalledWith(
      "Error obtaining owner name:",
      expect.any(Error)
    );
    spyConsoleError.mockRestore();
  });
});
