import { render, renderHook, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useTDDChartPage } from "../../../src/presentation/tdd-visualization/hooks/useTDDChartPage";
import { fetchTDDVisualizationData } from "../../../src/presentation/tdd-visualization/services/tddVisualization.service";
import { useNavigate, useSearchParams } from "react-router-dom";
import TDDChartPage from "../../../src/presentation/tdd-visualization/pages/TDDChartPage";
import {
  MockGithubAPI,
  MockGithubAPIEmpty,
  MockGithubAPIError,
} from "./__mocks__/MocksCommitHistory";

// Mock de `useNavigate` con tipo explícito
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
  useSearchParams: jest.fn(() => {
    const params = new URLSearchParams();
    const getMock = jest.fn();
    getMock.mockReturnValueOnce("exampleOwner"); // Setea el valor deseado
    getMock.mockReturnValueOnce("exampleRepo"); // Setea el valor deseado
    params.get = getMock;
    return [params];
  }),
}));

describe("TDDChartPage", () => {
  test.each([["admin"], ["student"]])(
    "renders loading spinner when loading is true for role %s",
    async (role) => {
      const { getByTestId } = render(
        <TDDChartPage port={new MockGithubAPI()} role={role} teacher_id={294}/>
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
        <TDDChartPage port={new MockGithubAPIEmpty()} role={role} teacher_id={294}/>
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
        <TDDChartPage port={new MockGithubAPI()} role={role} teacher_id={294}/>
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
    const spyConsoleError = jest.spyOn(console, "error");
    spyConsoleError.mockImplementation(() => {});

    await act(async () => {
      render(<TDDChartPage port={new MockGithubAPIError()} role="admin" teacher_id={294}/>);
    });

    expect(spyConsoleError).toHaveBeenCalledWith(
      "Error obtaining data:",
      expect.any(Error)
    );
    spyConsoleError.mockRestore();
  });
});

describe("HU-06 visualization data", () => {
  it("loads the current graph without requesting the unused commit-cycle distribution", async () => {
    const retiredRequest = jest.fn().mockRejectedValue(new Error("Retired data is unavailable"));
    const port = {
      obtainUserName: jest.fn().mockResolvedValue("Student"),
      obtainCommitsOfRepo: jest.fn().mockResolvedValue([]),
      obtainTDDLogs: jest.fn().mockResolvedValue([]),
      obtainCommitTddCycle: retiredRequest,
    };
    await expect(fetchTDDVisualizationData(port, "student", "practice"))
      .resolves.toEqual({ commits: [], tddLogs: [] });
    expect(port.obtainCommitsOfRepo).toHaveBeenCalledWith("student", "practice");
    expect(port.obtainTDDLogs).toHaveBeenCalledWith("student", "practice");
    expect(retiredRequest).not.toHaveBeenCalled();
  });

  it("keeps teacher navigation on Dashboard and the selected student's repository", async () => {
    const navigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(navigate);
    const submissions = [
      { id: 1, repository_link: "https://github.com/first/task" },
      { id: 2, repository_link: "https://github.com/second/task" },
    ];
    (useSearchParams as jest.Mock).mockReturnValue([new URLSearchParams({
      repoOwner: "first", repoName: "task", submissionId: "1", fetchedSubmissions: JSON.stringify(submissions),
    })]);
    const port = new MockGithubAPI();
    const { result } = renderHook(() => useTDDChartPage({ port, role: "teacher", teacher_id: 294 }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    localStorage.setItem("selectedMetric", "Lista");
    act(() => result.current.goToNextStudent());
    expect(localStorage.getItem("selectedMetric")).toBe("Dashboard");
    expect(navigate).toHaveBeenCalledWith(expect.stringContaining("repoOwner=second&repoName=task&submissionId=2"));
    expect(result.current.currentIndex).toBe(1);
    act(() => result.current.goToPreviousStudent());
    expect(navigate).toHaveBeenLastCalledWith(expect.stringContaining("repoOwner=first&repoName=task&submissionId=1"));
    expect(result.current.currentIndex).toBe(0);
  });
});
