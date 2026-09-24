import { renderHook, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";

import { useAssignmentDetailData } from "../../../../src/presentation/assignments/hooks/useAssignmentDetailData";

const mockGetSubmission = {
  getSubmisssionByUserandSubmissionId: jest.fn(),
};
const mockCreateSubmission = { createSubmission: jest.fn() };
const mockFinishSubmission = { finishSubmission: jest.fn() };

jest.mock("../../../../src/modules/Assignments/application/GetAssignmentDetail", () => ({
  GetAssignmentDetail: jest.fn().mockImplementation(() => ({
    obtainAssignmentDetail: jest.fn().mockResolvedValue({
      title: "Test Assignment",
      description: "d",
      start_date: new Date(),
      end_date: new Date(),
      state: "open",
      link: "https://github.com/test/repo",
      comment: "",
      groupid: 123,
    }),
  })),
}));

jest.mock("../../../../src/modules/Groups/application/GetGroupDetail", () => ({
  GetGroupDetail: jest.fn().mockImplementation(() => ({
    obtainGroupDetail: jest.fn().mockResolvedValue({ groupName: "Test Group" }),
  })),
}));

jest.mock("../../../../src/modules/FeatureFlags/application/GetFeatureFlagByName", () => ({
  GetFeatureFlagByName: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue({ is_enabled: true }),
  })),
}));

jest.mock(
  "../../../../src/modules/Submissions/Aplication/getSubmissionByUseridandSubmissionid",
  () => ({
    GetSubmissionByUserandAssignmentId: jest.fn().mockImplementation(() => mockGetSubmission),
  })
);

jest.mock("../../../../src/modules/Submissions/Aplication/createSubmission", () => ({
  CreateSubmission: jest.fn().mockImplementation(() => mockCreateSubmission),
}));

jest.mock("../../../../src/modules/Submissions/Aplication/finishSubmission", () => ({
  FinishSubmission: jest.fn().mockImplementation(() => mockFinishSubmission),
}));

jest.mock(
  "../../../../src/modules/Submissions/Aplication/getSubmissionsByAssignmentId",
  () => ({
    GetSubmissionsByAssignmentId: jest.fn().mockImplementation(() => ({
      getSubmissionsByAssignmentId: jest.fn().mockResolvedValue([]),
    })),
  })
);

jest.mock("../../../../src/modules/Users/repository/UsersRepository", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    getUserById: jest.fn().mockResolvedValue({ email: "x@example.com" }),
  })),
}));

const navigate = jest.fn();

function createDeferred<T = void>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("useAssignmentDetailData (student start/finish)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("exposes isActionLoading and toggles it around a start", async () => {
    const deferred = createDeferred<void>();
    mockCreateSubmission.createSubmission.mockReturnValue(deferred.promise);
    mockGetSubmission.getSubmisssionByUserandSubmissionId.mockResolvedValue(null);

    const { result } = renderHook(() =>
      useAssignmentDetailData({ role: "student", userid: 1, assignmentid: 1, navigate })
    );

    await waitFor(() => expect(result.current.assignment).not.toBeNull());
    expect(result.current.isActionLoading).toBe(false);

    act(() => {
      result.current.sendGithubLink("https://github.com/u/repo");
    });

    expect(result.current.isActionLoading).toBe(true);
    expect(mockCreateSubmission.createSubmission).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "in progress",
        repository_link: "https://github.com/u/repo",
        assignmentid: 1,
        userid: 1,
      })
    );

    act(() => deferred.resolve());
    await waitFor(() => expect(result.current.isActionLoading).toBe(false));
  });

  it("keeps the in-progress status after a successful start (transition)", async () => {
    mockCreateSubmission.createSubmission.mockResolvedValue(undefined);
    mockGetSubmission.getSubmisssionByUserandSubmissionId
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        assignmentid: 1,
        userid: 1,
        id: 5,
        status: "in progress",
        repository_link: "https://github.com/u/repo",
        start_date: new Date(),
        end_date: null,
        comment: null,
      });

    const { result } = renderHook(() =>
      useAssignmentDetailData({ role: "student", userid: 1, assignmentid: 1, navigate })
    );

    await waitFor(() => expect(result.current.assignment).not.toBeNull());
    await act(async () => {
      await result.current.sendGithubLink("https://github.com/u/repo");
    });

    await waitFor(() =>
      expect(result.current.studentSubmission?.status).toBe("in progress")
    );
  });

  it("prevents duplicate start calls while one is in flight", async () => {
    const deferred = createDeferred<void>();
    mockCreateSubmission.createSubmission.mockReturnValue(deferred.promise);
    mockGetSubmission.getSubmisssionByUserandSubmissionId.mockResolvedValue(null);

    const { result } = renderHook(() =>
      useAssignmentDetailData({ role: "student", userid: 1, assignmentid: 1, navigate })
    );

    await waitFor(() => expect(result.current.assignment).not.toBeNull());

    act(() => {
      result.current.sendGithubLink("https://github.com/u/repo");
      result.current.sendGithubLink("https://github.com/u/repo");
    });

    expect(mockCreateSubmission.createSubmission).toHaveBeenCalledTimes(1);

    act(() => deferred.resolve());
    await waitFor(() => expect(result.current.isActionLoading).toBe(false));
  });

  it("recovers from a finish error keeping a coherent state", async () => {
    const inProgressSub = {
      assignmentid: 1,
      userid: 1,
      id: 5,
      status: "in progress",
      repository_link: "https://github.com/u/repo",
      start_date: new Date(),
      end_date: null,
      comment: null,
    };
    mockGetSubmission.getSubmisssionByUserandSubmissionId.mockResolvedValue(
      inProgressSub
    );
    mockFinishSubmission.finishSubmission.mockRejectedValue(new Error("network"));

    const { result } = renderHook(() =>
      useAssignmentDetailData({ role: "student", userid: 1, assignmentid: 1, navigate })
    );

    await waitFor(() =>
      expect(result.current.studentSubmission?.status).toBe("in progress")
    );

    await act(async () => {
      await result.current.sendComment("terminé");
    });

    await waitFor(() => expect(result.current.uiMessage).toMatch(/no se pudo/i));
    expect(result.current.isActionLoading).toBe(false);
    expect(result.current.studentSubmission?.status).toBe("in progress");
  });
});
