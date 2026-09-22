import { renderHook, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";

import { usePracticeDetail } from "../../../../src/presentation/my-practices/hooks/usePracticeDetail";
import * as practiceServices from "../../../../src/presentation/my-practices/services";

jest.mock("../../../../src/presentation/my-practices/services", () => ({
  fetchPracticeById: jest.fn(),
  fetchSubmissionsByPracticeId: jest.fn(),
  startPracticeSubmission: jest.fn(),
  finishPracticeSubmission: jest.fn(),
}));

const mocked = practiceServices as jest.Mocked<typeof practiceServices>;
const navigate = jest.fn();

const practice = {
  id: 1,
  title: "Práctica de prueba",
  description: "desc",
  creation_date: new Date("2024-01-01"),
  state: "open",
  userid: 1,
};

const inProgressSubmission = {
  id: 2,
  practiceid: 1,
  userid: 1,
  status: "in progress",
  repository_link: "https://github.com/u/repo",
  start_date: new Date(),
  end_date: null,
  comment: null,
};

function createDeferred<T = void>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("usePracticeDetail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mocked.fetchPracticeById.mockResolvedValue(practice);
    mocked.fetchSubmissionsByPracticeId.mockResolvedValue([]);
    mocked.startPracticeSubmission.mockResolvedValue(undefined);
    mocked.finishPracticeSubmission.mockResolvedValue(undefined);
  });

  it("exposes isActionLoading and toggles it around a start", async () => {
    const deferred = createDeferred<void>();
    mocked.startPracticeSubmission.mockReturnValue(deferred.promise);

    const { result } = renderHook(() =>
      usePracticeDetail({ userid: 1, practiceid: 1, navigate })
    );

    await waitFor(() => expect(result.current.practice).not.toBeNull());
    expect(result.current.isActionLoading).toBe(false);

    act(() => {
      result.current.sendGithubLink("https://github.com/u/repo");
    });

    expect(result.current.isActionLoading).toBe(true);
    expect(mocked.startPracticeSubmission).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "in progress",
        repository_link: "https://github.com/u/repo",
        practiceid: 1,
        userid: 1,
      })
    );

    act(() => deferred.resolve());
    await waitFor(() => expect(result.current.isActionLoading).toBe(false));
  });

  it("advances the submission status after a successful start (transition)", async () => {
    mocked.fetchSubmissionsByPracticeId
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([inProgressSubmission]);

    const { result } = renderHook(() =>
      usePracticeDetail({ userid: 1, practiceid: 1, navigate })
    );

    await waitFor(() => expect(result.current.practice).not.toBeNull());
    expect(result.current.submission).toBeNull();

    await act(async () => {
      await result.current.sendGithubLink("https://github.com/u/repo");
    });

    await waitFor(() =>
      expect(result.current.submission?.status).toBe("in progress")
    );
  });

  it("prevents duplicate start calls while one is in flight", async () => {
    const { result } = renderHook(() =>
      usePracticeDetail({ userid: 1, practiceid: 1, navigate })
    );

    await waitFor(() => expect(result.current.practice).not.toBeNull());

    await act(async () => {
      result.current.sendGithubLink("https://github.com/u/repo");
      result.current.sendGithubLink("https://github.com/u/repo");
    });

    expect(mocked.startPracticeSubmission).toHaveBeenCalledTimes(1);
  });

  it("recovers from a finish error keeping a coherent state", async () => {
    mocked.fetchSubmissionsByPracticeId.mockResolvedValueOnce([
      inProgressSubmission,
    ]);
    mocked.finishPracticeSubmission.mockRejectedValue(new Error("network"));

    const { result } = renderHook(() =>
      usePracticeDetail({ userid: 1, practiceid: 1, navigate })
    );

    await waitFor(() => expect(result.current.submission?.status).toBe("in progress"));

    await act(async () => {
      await result.current.sendComment("terminé");
    });

    await waitFor(() => expect(result.current.uiMessage).toMatch(/no se pudo/i));
    expect(result.current.isActionLoading).toBe(false);
    expect(result.current.submission?.status).toBe("in progress");
  });
});
