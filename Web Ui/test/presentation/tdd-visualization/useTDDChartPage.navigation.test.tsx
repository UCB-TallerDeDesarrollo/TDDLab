import { act, renderHook, waitFor } from "@testing-library/react";
import { useTDDChartPage } from "../../../src/presentation/tdd-visualization/hooks/useTDDChartPage";
import { MockGithubAPI } from "./__mocks__/MocksCommitHistory";

const mockNavigate = jest.fn();
const submissions = [
  { id: 1, repository_link: "https://github.com/student/first" },
  { id: 2, repository_link: "https://github.com/student/second" },
  { id: 3, repository_link: "https://github.com/student/third" },
];
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams({
    repoOwner: "student", repoName: "second", submissionId: "2",
    fetchedSubmissions: JSON.stringify(submissions),
  })],
}));
jest.mock("../../../src/presentation/tdd-visualization/services/tddVisualization.service", () => ({
  fetchCommentsData: jest.fn().mockResolvedValue({ emails: {}, comments: [] }),
  fetchOwnerName: jest.fn().mockResolvedValue("Student"),
  fetchTDDVisualizationData: jest.fn().mockResolvedValue({ commits: [], commitsTddCycles: [], tddLogs: [] }),
  createTeacherComment: jest.fn(),
}));

describe("Navegación entre entregas", () => {
  beforeEach(() => { localStorage.clear(); mockNavigate.mockClear(); });
  afterEach(() => localStorage.clear());

  it.each([
    ["goToPreviousStudent", "first", "1", 0],
    ["goToNextStudent", "third", "3", 2],
  ] as const)("%s conserva el repositorio y selecciona Dashboard", async (action, repo, id, index) => {
    const port = new MockGithubAPI();
    const { result } = renderHook(() => useTDDChartPage({
      port, role: "teacher", teacher_id: 10, graphs: "graph",
    }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    localStorage.setItem("selectedMetric", "Cobertura de Código");
    act(() => result.current[action]());
    const query = new URLSearchParams(mockNavigate.mock.calls[0][0]);
    expect(query.get("repoOwner")).toBe("student");
    expect(query.get("repoName")).toBe(repo);
    expect(query.get("submissionId")).toBe(id);
    expect(JSON.parse(query.get("fetchedSubmissions")!)).toEqual(submissions);
    expect(localStorage.getItem("selectedMetric")).toBe("Dashboard");
    expect(result.current.currentIndex).toBe(index);
  });
});
