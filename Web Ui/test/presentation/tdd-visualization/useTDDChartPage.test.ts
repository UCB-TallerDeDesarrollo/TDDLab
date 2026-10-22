import { renderHook, act } from "@testing-library/react";
import { useTDDChartPage } from "../../../src/presentation/tdd-visualization/hooks/useTDDChartPage";
import { MockGithubAPI } from "./__mocks__/MocksCommitHistory";

const mockNavigate = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParams],
}));

describe("useTDDChartPage hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    mockSearchParams = new URLSearchParams("repoOwner=owner1&repoName=repo1&submissionId=101");
  });

  it("loads teacher submissions from sessionStorage and allows navigating to next and previous student", () => {
    const mockSubmissions = [
      { id: 101, repository_link: "https://github.com/owner1/repo1" },
      { id: 102, repository_link: "https://github.com/owner2/repo2" },
      { id: 103, repository_link: "https://github.com/owner3/repo3" },
    ];
    sessionStorage.setItem("teacherSubmissions", JSON.stringify(mockSubmissions));

    const { result } = renderHook(() =>
      useTDDChartPage({
        port: new MockGithubAPI(),
        role: "teacher",
        teacher_id: 1,
      })
    );

    expect(result.current.fetchedSubmissions).toHaveLength(3);
    expect(result.current.currentIndex).toBe(0);

    act(() => {
      result.current.goToNextStudent();
    });

    expect(mockNavigate).toHaveBeenCalledWith("?repoOwner=owner2&repoName=repo2&submissionId=102");
    expect(result.current.currentIndex).toBe(1);

    act(() => {
      result.current.goToPreviousStudent();
    });

    expect(mockNavigate).toHaveBeenCalledWith("?repoOwner=owner1&repoName=repo1&submissionId=101");
    expect(result.current.currentIndex).toBe(0);
  });

  it("falls back to searchParams for backwards compatibility if sessionStorage is empty", () => {
    const legacySubmissions = [
      { id: 201, repository_link: "https://github.com/legacy/repo" },
    ];
    mockSearchParams = new URLSearchParams(
      `repoOwner=legacy&repoName=repo&submissionId=201&fetchedSubmissions=${encodeURIComponent(
        JSON.stringify(legacySubmissions)
      )}`
    );

    const { result } = renderHook(() =>
      useTDDChartPage({
        port: new MockGithubAPI(),
        role: "teacher",
        teacher_id: 1,
      })
    );

    expect(result.current.fetchedSubmissions).toEqual(legacySubmissions);
  });

  it("does not load teacher submissions when role is student", () => {
    const mockSubmissions = [
      { id: 101, repository_link: "https://github.com/owner1/repo1" },
    ];
    sessionStorage.setItem("teacherSubmissions", JSON.stringify(mockSubmissions));

    const { result } = renderHook(() =>
      useTDDChartPage({
        port: new MockGithubAPI(),
        role: "student",
        teacher_id: 0,
      })
    );

    expect(result.current.fetchedSubmissions).toEqual([]);
    expect(result.current.isStudent).toBe(true);
  });
});
