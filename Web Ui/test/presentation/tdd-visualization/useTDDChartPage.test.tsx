import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { CommitHistoryRepository } from "../../../src/modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";
import {
  readTeacherSubmissions,
  saveTeacherSubmissions,
} from "../../../src/shared/helpers/navigationHandlers";
import { useTDDChartPage } from "../../../src/presentation/tdd-visualization/hooks/useTDDChartPage";
import { Submission } from "../../../src/presentation/tdd-visualization/types/tddVisualization.types";
import { fetchTDDVisualizationData } from "../../../src/presentation/tdd-visualization/services/tddVisualization.service";

jest.mock("../../../src/presentation/tdd-visualization/services/tddVisualization.service", () => ({
  createTeacherComment: jest.fn(),
  fetchCommentsData: jest.fn().mockResolvedValue({ comments: [], emails: {} }),
  fetchOwnerName: jest.fn().mockResolvedValue("Teacher"),
  fetchTDDVisualizationData: jest.fn().mockResolvedValue({
    commits: [],
    commitsTddCycles: [],
    tddLogs: [],
  }),
}));

const submissions: Submission[] = [
  { id: 10, repository_link: "https://github.com/student/first-repo" },
  { id: 11, repository_link: "https://github.com/student/second-repo" },
  { id: 12, repository_link: "https://github.com/student/third-repo" },
];

const port: CommitHistoryRepository = {
  obtainBranches: jest.fn().mockResolvedValue([{ name: "main", isDefault: true }]),
  obtainCommitsOfRepo: jest.fn().mockResolvedValue([]),
  obtainUserName: jest.fn().mockResolvedValue("Teacher"),
  obtainCommitTddCycle: jest.fn().mockResolvedValue([]),
  obtainTDDLogs: jest.fn().mockResolvedValue([]),
};

function ChartNavigationHarness() {
  const page = useTDDChartPage({
    graphs: "graph",
    port,
    role: "teacher",
    teacher_id: 1,
  });
  const location = useLocation();

  return (
    <div>
      <output data-testid="current-index">{page.currentIndex}</output>
      <output data-testid="current-query">{location.search}</output>
      <button onClick={page.goToPreviousStudent}>Previous student</button>
      <button onClick={page.goToNextStudent}>Next student</button>
      <button onClick={() => page.selectBranch("feature/divisor")}>Divisor</button>
      <output data-testid="selected-branch">{page.chartsState.selectedBranch}</output>
    </div>
  );
}

describe("useTDDChartPage teacher navigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    saveTeacherSubmissions(7, submissions);
  });

  it("loads divisor once without fetching the branch list again", async () => {
    (port.obtainBranches as jest.Mock).mockResolvedValueOnce([
      { name: "main", isDefault: true }, { name: "feature/divisor" },
    ]);
    render(<MemoryRouter initialEntries={["/graph?repoOwner=student&repoName=first-repo"]}><ChartNavigationHarness /></MemoryRouter>);
    await waitFor(() => expect(fetchTDDVisualizationData).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByText("Divisor"));
    await waitFor(() => expect(screen.getByTestId("selected-branch")).toHaveTextContent("feature/divisor"));
    await waitFor(() => expect(fetchTDDVisualizationData).toHaveBeenCalledTimes(2));
    expect(fetchTDDVisualizationData).toHaveBeenLastCalledWith(port, "student", "first-repo", "feature/divisor");
    expect(port.obtainBranches).toHaveBeenCalledTimes(1);
  });

  it("loads the selected assignment's submissions and navigates without putting them in the URL", async () => {
    render(
      <MemoryRouter
        initialEntries={[
          "/graph?repoOwner=student&repoName=first-repo&assignmentId=7&submissionId=10",
        ]}
      >
        <Routes>
          <Route path="/graph" element={<ChartNavigationHarness />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(readTeacherSubmissions(7)).toEqual(submissions);
    expect(screen.getByTestId("current-index")).toHaveTextContent("0");

    fireEvent.click(screen.getByRole("button", { name: "Next student" }));

    await waitFor(() => {
      expect(screen.getByTestId("current-index")).toHaveTextContent("1");
      expect(screen.getByTestId("current-query")).toHaveTextContent(
        "repoName=second-repo",
      );
      expect(screen.getByTestId("current-query")).toHaveTextContent(
        "assignmentId=7",
      );
      expect(screen.getByTestId("current-query")).toHaveTextContent(
        "submissionId=11",
      );
      expect(screen.getByTestId("current-query")).not.toHaveTextContent(
        "fetchedSubmissions",
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "Previous student" }));

    await waitFor(() => {
      expect(screen.getByTestId("current-index")).toHaveTextContent("0");
      expect(screen.getByTestId("current-query")).toHaveTextContent(
        "repoName=first-repo",
      );
      expect(screen.getByTestId("current-query")).toHaveTextContent(
        "submissionId=10",
      );
    });
  });
});
